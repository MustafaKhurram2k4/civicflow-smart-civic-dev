import asyncio
import importlib.util
import tempfile
from datetime import datetime
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, Depends, File, UploadFile, status
from models.complaint import ComplaintCreate, ComplaintUpdate, CommentCreate, ComplaintResponse, Comment, TimelineEvent
from services.prioritization_service import calculate_priority_score
from services.auth_service import get_current_user
from database import get_database, memory_store
from config import settings

router = APIRouter(prefix="/complaints", tags=["Complaints Queue"])

VISION_SERVICE_PATH = Path(__file__).resolve().parents[1] / "Image-Verification" / "vision_service.py"
MAX_FILE_SIZE = 5 * 1024 * 1024
_vision_service = None


def _load_vision_service():
    global _vision_service
    if _vision_service is not None:
        return _vision_service

    spec = importlib.util.spec_from_file_location("civicflow_vision_service", VISION_SERVICE_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError("Image verification service could not be loaded.")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    _vision_service = module
    return _vision_service


def _upload_image_to_cloudinary(image_path: Path, complaint_id: str | None = None) -> dict:
    if not all([
        settings.CLOUDINARY_CLOUD_NAME,
        settings.CLOUDINARY_API_KEY,
        settings.CLOUDINARY_API_SECRET,
    ]):
        raise RuntimeError("Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.")

    import cloudinary
    import cloudinary.uploader

    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True,
    )

    upload_result = cloudinary.uploader.upload(
        str(image_path),
        folder="civicflow/complaints",
        public_id=complaint_id,
        resource_type="image",
        overwrite=False,
    )

    return {
        "image_url": upload_result.get("secure_url"),
        "cloudinary_public_id": upload_result.get("public_id"),
    }

async def get_next_sequence_id() -> str:
    db = get_database()
    if db is not None:
        result = await db["counters"].find_one_and_update(
            {"_id": "complaint_id"},
            {"$inc": {"seq": 1}},
            upsert=True,
            return_document=True
        )
        seq_num = result.get("seq", 1049)
        return f"CIV-{datetime.utcnow().year}-{seq_num}"
    else:
        return memory_store.get_next_id()

@router.post("", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
async def create_complaint(
    payload: ComplaintCreate,
    current_user: Optional[dict] = Depends(get_current_user)
):
    db = get_database()
    
    similar_count = 0
    if db is not None:
        similar_count = await db["complaints"].count_documents({
            "category": payload.category,
            "status": {"$ne": "Resolved"}
        })
    else:
        similar_count = sum(1 for c in memory_store.complaints if c["category"] == payload.category and c["status"] != "Resolved")
        
    scoring = calculate_priority_score(category=payload.category, age_days=0, similar_count=similar_count)
    priority = scoring["priority"]
    score = scoring["score"]
    
    cid = await get_next_sequence_id()
    now = datetime.utcnow()
    time_str = "Just now"
    
    title = payload.title or f"{payload.category} issue reported at {payload.location}"
    creator = "Anonymous" if payload.anonymous else (payload.created_by or (current_user.get("name", "Citizen") if current_user else "Citizen"))
    creator_email = payload.created_by_email or (current_user.get("email", "") if current_user else "")
    
    doc = {
        "id": cid,
        "title": title,
        "category": payload.category,
        "custom_category": payload.custom_category.strip() if payload.custom_category else None,
        "location": payload.location,
        "priority": priority,
        "status": "New",
        "age": 0,
        "assigned": "Unassigned",
        "score": score,
        "time": time_str,
        "description": payload.description,
        "anonymous": payload.anonymous,
        "photo_url": payload.photo_url,
        "image_verification": payload.image_verification,
        "created_by": creator,
        "created_by_email": creator_email.strip().lower() if creator_email else "",
        "created_at": now,
        "updated_at": now,
        "comments": [],
        "timeline": [
            {
                "status": "New",
                "updated_at": now.isoformat(),
                "updated_by": creator
            }
        ]
    }
    
    if db is not None:
        await db["complaints"].insert_one(doc)
    else:
        memory_store.complaints.insert(0, doc)
        
    return ComplaintResponse(**doc)


@router.post("/verify-image")
async def verify_complaint_image(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload a valid image file.")

    suffix = Path(file.filename or "upload.jpg").suffix or ".jpg"
    file_data = await file.read()

    if len(file_data) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="Image must be smaller than 5 MB",
        )

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            temp_path = Path(tmp.name)
            tmp.write(file_data)

        vision_service = _load_vision_service()
        result = await asyncio.to_thread(vision_service.verify_image, temp_path)
        upload_result = await asyncio.to_thread(_upload_image_to_cloudinary, temp_path)
        return {**result, **upload_result}
    except ModuleNotFoundError as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Image verification dependency missing: {exc.name}. Install Image-Verification requirements.",
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Image verification failed: {exc}")
    finally:
        try:
            if "temp_path" in locals():
                temp_path.unlink(missing_ok=True)
        except Exception:
            pass


@router.get("/priority-preview")
async def preview_complaint_priority(category: str = Query(...), age_days: int = Query(0)):
    db = get_database()
    if db is not None:
        similar_count = await db["complaints"].count_documents({
            "category": category,
            "status": {"$ne": "Resolved"}
        })
    else:
        similar_count = sum(1 for c in memory_store.complaints if c["category"] == category and c["status"] != "Resolved")

    return calculate_priority_score(
        category=category,
        age_days=age_days,
        similar_count=similar_count,
    )

@router.get("", response_model=List[ComplaintResponse])
async def list_complaints(
    q: Optional[str] = Query(None, description="Search term across id, title, location, category"),
    status_filter: Optional[str] = Query("All", alias="status"),
    priority_filter: Optional[str] = Query("All", alias="priority"),
    category_filter: Optional[str] = Query("All", alias="category"),
    created_by_email: Optional[str] = Query(None, description="Filter by creator email"),
    sort_by: Optional[str] = Query("newest", alias="sort")
):
    db = get_database()
    if db is not None:
        query_dict = {}
        if status_filter and status_filter != "All":
            query_dict["status"] = status_filter
        if priority_filter and priority_filter != "All":
            query_dict["priority"] = priority_filter
        if category_filter and category_filter != "All":
            query_dict["category"] = category_filter
        if created_by_email and created_by_email.strip():
            query_dict["created_by_email"] = created_by_email.strip().lower()
            
        if q and q.strip():
            search_regex = {"$regex": q.strip(), "$options": "i"}
            query_dict["$or"] = [
                {"id": search_regex},
                {"title": search_regex},
                {"location": search_regex},
                {"category": search_regex},
                {"description": search_regex}
            ]

        cursor = db["complaints"].find(query_dict)
        if sort_by == "priority":
            cursor = cursor.sort("score", -1)
        elif sort_by == "oldest":
            cursor = cursor.sort("age", -1)
        else:
            cursor = cursor.sort("created_at", -1)
            
        results = await cursor.to_list(length=200)
    else:
        # In-memory filtering
        results = memory_store.complaints
        if status_filter and status_filter != "All":
            results = [x for x in results if x.get("status") == status_filter]
        if priority_filter and priority_filter != "All":
            results = [x for x in results if x.get("priority") == priority_filter]
        if category_filter and category_filter != "All":
            results = [x for x in results if x.get("category") == category_filter]
        if created_by_email and created_by_email.strip():
            results = [x for x in results if x.get("created_by_email", "").lower() == created_by_email.strip().lower()]
        if q and q.strip():
            term = q.strip().lower()
            results = [x for x in results if any(term in str(x.get(k, "")).lower() for k in ["id", "title", "location", "category", "description"])]
            
        if sort_by == "priority":
            results = sorted(results, key=lambda x: x.get("score", 0), reverse=True)
        elif sort_by == "oldest":
            results = sorted(results, key=lambda x: x.get("age", 0), reverse=True)
        else:
            results = sorted(results, key=lambda x: str(x.get("id", "")), reverse=True)
            
    similar_counts = {}
    for item in results:
        if item.get("status") == "Resolved":
            continue
        category = item.get("category", "Other")
        similar_counts[category] = similar_counts.get(category, 0) + 1

    out = []
    for item in results:
        doc = dict(item)
        if "created_at" in doc and isinstance(doc["created_at"], datetime):
            delta_days = (datetime.utcnow() - doc["created_at"]).days
            doc["age"] = max(doc.get("age", 0), delta_days)
            res_scoring = calculate_priority_score(
                doc["category"],
                doc["age"],
                similar_count=similar_counts.get(doc.get("category"), 0),
            )
            doc["score"] = res_scoring["score"]
        out.append(ComplaintResponse(**doc))
        
    return out

@router.get("/{complaint_id}", response_model=ComplaintResponse)
async def get_complaint(complaint_id: str):
    db = get_database()
    if db is not None:
        item = await db["complaints"].find_one({"id": complaint_id})
    else:
        item = next((c for c in memory_store.complaints if c["id"] == complaint_id), None)
        
    if not item:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    return ComplaintResponse(**item)

@router.patch("/{complaint_id}", response_model=ComplaintResponse)
async def update_complaint(
    complaint_id: str,
    payload: ComplaintUpdate,
    current_user: Optional[dict] = Depends(get_current_user)
):
    db = get_database()
    if db is not None:
        existing = await db["complaints"].find_one({"id": complaint_id})
    else:
        existing = next((c for c in memory_store.complaints if c["id"] == complaint_id), None)
        
    if not existing:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    now = datetime.utcnow()
    updater_name = current_user.get("name", "Operations Officer") if current_user else "Operations Officer"
    
    if payload.status and payload.status != existing.get("status"):
        existing["status"] = payload.status
        timeline = existing.get("timeline", [])
        timeline.append({
            "status": payload.status,
            "updated_at": now.isoformat(),
            "updated_by": updater_name
        })
        existing["timeline"] = timeline

    if payload.assigned is not None:
        existing["assigned"] = payload.assigned
        
    if payload.priority is not None:
        existing["priority"] = payload.priority

    existing["updated_at"] = now

    if db is not None:
        await db["complaints"].update_one({"id": complaint_id}, {"$set": existing})
        
    return ComplaintResponse(**existing)

@router.post("/{complaint_id}/comments", response_model=ComplaintResponse)
async def add_comment(
    complaint_id: str,
    payload: CommentCreate,
    current_user: Optional[dict] = Depends(get_current_user)
):
    db = get_database()
    if db is not None:
        existing = await db["complaints"].find_one({"id": complaint_id})
    else:
        existing = next((c for c in memory_store.complaints if c["id"] == complaint_id), None)
        
    if not existing:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    author = payload.author or (current_user.get("name") if current_user else "Municipal Officer")
    new_comment = {
        "author": author,
        "text": payload.text,
        "created_at": datetime.utcnow().isoformat()
    }
    
    if "comments" not in existing or not isinstance(existing["comments"], list):
        existing["comments"] = []
    existing["comments"].append(new_comment)
    existing["updated_at"] = datetime.utcnow()
    
    if db is not None:
        await db["complaints"].update_one(
            {"id": complaint_id},
            {"$push": {"comments": new_comment}, "$set": {"updated_at": datetime.utcnow()}}
        )
        
    return ComplaintResponse(**existing)
