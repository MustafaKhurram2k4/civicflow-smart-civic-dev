from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class Comment(BaseModel):
    author: str
    text: str
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class TimelineEvent(BaseModel):
    status: str
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_by: str = "System"

class ComplaintCreate(BaseModel):
    title: Optional[str] = None
    category: str  # Road Damage, Garbage, Pothole, Other
    custom_category: Optional[str] = None
    description: str
    location: str
    priority: Optional[str] = "Medium"  # High, Medium, Low
    anonymous: bool = False
    photo_url: Optional[str] = None
    image_verification: Optional[Dict[str, Any]] = None
    created_by: Optional[str] = None
    created_by_email: Optional[str] = None

class ComplaintUpdate(BaseModel):
    status: Optional[str] = None  # New, Assigned, In Progress, Resolved
    assigned: Optional[str] = None
    priority: Optional[str] = None

class CommentCreate(BaseModel):
    text: str
    author: Optional[str] = "Municipal Officer"

class ComplaintResponse(BaseModel):
    id: str
    title: str
    category: str
    custom_category: Optional[str] = None
    location: str
    priority: str
    status: str
    age: int
    assigned: str
    score: float
    time: str
    description: str
    anonymous: bool = False
    photo_url: Optional[str] = None
    image_verification: Optional[Dict[str, Any]] = None
    created_by: Optional[str] = None
    created_by_email: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    comments: List[Comment] = []
    timeline: List[TimelineEvent] = []

class AnalyticsStats(BaseModel):
    active: int
    resolved: int
    urgent: int
    response: str

class SLAItem(BaseModel):
    category: str
    percentage: float

class HotspotItem(BaseModel):
    location: str
    count: int

class DistributionItem(BaseModel):
    category: str
    count: int

class AnalyticsReport(BaseModel):
    period: str
    period_label: str
    start: str
    end: str
    summary: Dict[str, Any]
    categories: List[Dict[str, Any]]
    statuses: List[Dict[str, Any]]
    priorities: List[Dict[str, Any]]
    trend: List[Dict[str, Any]]
    hotspots: List[Dict[str, Any]]
    aging: Dict[str, int]
