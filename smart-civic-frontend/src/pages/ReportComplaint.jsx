// -----------------------------------------------------------------------------
// ReportComplaint.jsx — Citizen complaint submission experience
// -----------------------------------------------------------------------------
// This screen now includes several frontend-only enhancements that make the
// prototype feel production-ready while keeping the backend contract clean:
//   - draft recovery using localStorage
//   - character counter + validation
//   - Smart Assist integration point
//   - browser geolocation integration point
//   - image selection + preview
//   - anonymous submission
//   - clear loading/success states
//
// The actual POST request is intentionally left for the FastAPI team.
// ----------------------------------------------------------------------------

import { useEffect, useRef, useState } from "react";
import { Alert, Box, Button, Checkbox, FormControlLabel, Grid, MenuItem, Select, TextField, Typography, Chip, LinearProgress } from "@mui/material";
import AutoAwesomeRounded from "@mui/icons-material/AutoAwesomeRounded";
import MyLocationRounded from "@mui/icons-material/MyLocationRounded";
import PhotoCameraRounded from "@mui/icons-material/PhotoCameraRounded";
import SendRounded from "@mui/icons-material/SendRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import DraftsOutlined from "@mui/icons-material/DraftsOutlined";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SmartAssistCard from "../components/SmartAssistCard";
import { addComplaint, getCurrentUser } from "../data/complaintsStore";

const DRAFT_KEY = "civicflow-complaint-draft";
const MAX_DESCRIPTION = 1000;
const API_ROOT = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");
const COMPLAINTS_API = `${API_ROOT}/api/complaints`;
const CATEGORIES = ["Road Damage", "Garbage", "Pothole", "Other"];

const mapDetectionToCategory = (detectionClass = "") => {
  const normalized = detectionClass.toLowerCase();
  if (normalized.includes("pothole")) return "Pothole";
  if (normalized.includes("garbage") || normalized.includes("waste")) return "Garbage";
  if (normalized.includes("road") || normalized.includes("damage")) return "Road Damage";
  return "Other";
};

export default function ReportComplaint() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileInput = useRef(null);
  const [form, setForm] = useState({ category:"Other", customCategory:"", description:"", location:"", priority:"Medium", anonymous:false });
  const [photo, setPhoto] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [createdId, setCreatedId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [photoVerifying, setPhotoVerifying] = useState(false);
  const [photoVerification, setPhotoVerification] = useState(null);
  const [photoError, setPhotoError] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  // Restore an unfinished complaint when the user returns to the page.
  useEffect(() => {
    try {
      const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
      if (draft?.form) setForm(draft.form);
    } catch { /* Ignore malformed local drafts. */ }
  }, []);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const saveDraft = () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, savedAt: new Date().toISOString() }));
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 1800);
  };

  useEffect(() => {
    if (!form.category) return;

    const controller = new AbortController();

    const updatePriority = async () => {
      try {
        const response = await fetch(
          `${COMPLAINTS_API}/priority-preview?category=${encodeURIComponent(form.category)}&age_days=0`,
          { signal: controller.signal }
        );
        const result = await response.json();
        if (response.ok && result.priority) {
          set("priority", result.priority);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.warn("Priority preview unavailable:", err.message);
        }
      }
    };

    updatePriority();
    return () => controller.abort();
  }, [form.category]);

  const useLocation = () => {
    if (!navigator.geolocation) {
      set("location", "Location unavailable — please enter a landmark manually");
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        set("location", `GPS: ${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`);
        setLocationLoading(false);
      },
      () => {
        setLocationLoading(false);
        set("location", "Location permission denied — enter a street or landmark");
      },
      { enableHighAccuracy:true, timeout:8000 }
    );
  };

  const verifyPhoto = async (file) => {
    setPhotoVerifying(true);
    setPhotoVerification(null);
    setPhotoError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("civic_token");
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(`${COMPLAINTS_API}/verify-image`, {
        method: "POST",
        headers,
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.detail || "Image verification failed.");
      }

      const detectedCategory = result.verified
        ? mapDetectionToCategory(result.detections?.[0]?.class)
        : "Other";

      set("category", detectedCategory);
      setPhotoVerification(result);
    } catch (err) {
      set("category", "Other");
      setPhotoError(err.message || "Image verification failed.");
    } finally {
      setPhotoVerifying(false);
    }
  };

  const choosePhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setPhoto({ file, preview });
    verifyPhoto(file);
  };

  const removePhoto = () => {
    if (photo?.preview) URL.revokeObjectURL(photo.preview);
    setPhoto(null);
    setPhotoVerification(null);
    setPhotoError("");
    setPhotoVerifying(false);
    if (fileInput.current) fileInput.current.value = "";
  };

  const applyAssist = (result) => {
    setForm((current) => ({
      ...current,
      category: CATEGORIES.includes(result.category) ? result.category : "Other",
      priority: result.urgency || current.priority,
      description: result.summary,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const user = getCurrentUser();
      const newRecord = await addComplaint({ ...form, photo: photoVerification?.image_url || null, imageVerification: photoVerification }, user);
      setCreatedId(newRecord?.id || "CIV-2026-1049");
      localStorage.removeItem(DRAFT_KEY);
      setSubmitting(false);
      setSubmitted(true);
      setTimeout(() => navigate("/citizen/complaints"), 1300);
    } catch (err) {
      console.error("Complaint submit error:", err);
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth:1050, mx:"auto" }}>
      <Box sx={{ mb:3 }}>
        <Typography variant="h3">{t("reportIssue")}</Typography>
        <Typography color="text.secondary" sx={{ mt:.7, maxWidth:720 }}>{t("reportHint")}</Typography>
      </Box>

      {submitted && <Alert severity="success" sx={{ mb:2, borderRadius:1.5 }}>
        Complaint submitted successfully. Your reference is <strong>{createdId || "CIV-2026-1049"}</strong>.
      </Alert>}

      <Box component="form" onSubmit={submit} className="neo" sx={{ p:{xs:2,md:3.5}, borderRadius:2 }}>
        <Grid container spacing={2.5}>
          <Grid size={{xs:12,md:6}}>
            <Typography fontWeight={800} sx={{ mb:.8 }}>{t("category")}</Typography>
            <Select fullWidth value={form.category} onChange={e=>set("category",e.target.value)}>
              {CATEGORIES.map(x=><MenuItem key={x} value={x}>{x}</MenuItem>)}
            </Select>
          </Grid>
          <Grid size={{xs:12,md:6}}>
            <Typography fontWeight={800} sx={{ mb:.8 }}>{t("priority")}</Typography>
            <Select fullWidth value={form.priority} disabled>
              {["Low","Medium","High","Critical"].map(x=><MenuItem key={x} value={x}>{x}</MenuItem>)}
            </Select>
          </Grid>

          {form.category === "Other" && (
            <Grid size={12}>
              <Typography fontWeight={800} sx={{ mb:.8 }}>Specify category</Typography>
              <TextField
                fullWidth
                value={form.customCategory}
                onChange={e=>set("customCategory", e.target.value)}
                placeholder="Example: water leakage, streetlight, drainage, sanitation..."
              />
            </Grid>
          )}

          <Grid size={12}>
            <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"end", mb:.8 }}>
              <Typography fontWeight={800}>{t("description")}</Typography>
              <Typography variant="caption" color={form.description.length > 900 ? "warning.main" : "text.secondary"}>{form.description.length} / {MAX_DESCRIPTION}</Typography>
            </Box>
            <TextField
              required fullWidth multiline minRows={5} value={form.description}
              onChange={e=>set("description",e.target.value.slice(0, MAX_DESCRIPTION))}
              placeholder="Example: There has been no street light near Gate 3 for almost a week..."
              sx={{ "& .MuiOutlinedInput-root":{ borderRadius:1.5 } }}
            />
            <LinearProgress variant="determinate" value={(form.description.length / MAX_DESCRIPTION) * 100} sx={{ mt:.8, height:3, borderRadius:2, bgcolor:"action.hover" }} />
            <SmartAssistCard description={form.description} onApply={applyAssist} />
          </Grid>

          <Grid size={12}>
            <Typography fontWeight={800} sx={{ mb:.8 }}>{t("location")}</Typography>
            <Box sx={{ display:"flex", gap:1 }}>
              <TextField required fullWidth value={form.location} onChange={e=>set("location",e.target.value)} placeholder="Sector, street, landmark..." />
              <Button type="button" className="neo-soft" onClick={useLocation} disabled={locationLoading} sx={{ minWidth:52, borderRadius:1.5, color:"primary.main" }}>
                {locationLoading ? "…" : <MyLocationRounded />}
              </Button>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display:"block", mt:.6 }}>Use GPS or provide a recognizable landmark for faster routing.</Typography>
          </Grid>

          <Grid size={{xs:12,md:7}}>
            <input ref={fileInput} type="file" accept="image/*" hidden onChange={choosePhoto} />
            {!photo ? (
              <Button fullWidth variant="outlined" onClick={()=>fileInput.current?.click()} startIcon={<PhotoCameraRounded />} sx={{ height:54, borderRadius:1.5, borderStyle:"dashed" }}>
                {t("attachPhoto")} <Typography component="span" sx={{ ml:.5, fontSize:12 }}>({t("optional")})</Typography>
              </Button>
            ) : (
              <Box className="neo-soft" sx={{ p:1, borderRadius:1.5, display:"flex", gap:1.2, alignItems:"center" }}>
                <Box component="img" src={photo.preview} alt="Complaint preview" sx={{ width:64, height:48, objectFit:"cover", borderRadius:1 }} />
                <Box sx={{ flex:1, minWidth:0 }}><Typography fontWeight={750} noWrap>{photo.file.name}</Typography><Typography variant="caption" color="text.secondary">{Math.round(photo.file.size/1024)} KB</Typography></Box>
                <Button size="small" color="error" onClick={removePhoto} startIcon={<DeleteOutlineRounded />}>Remove</Button>
              </Box>
            )}
            {photoVerifying && <Alert severity="info" sx={{ mt:1, borderRadius:1.5 }}>Verifying image...</Alert>}
            {photoVerification && (
              <Alert severity={photoVerification.verified ? "success" : "warning"} sx={{ mt:1, borderRadius:1.5 }}>
                {photoVerification.verified
                  ? `Verified: ${photoVerification.detections?.map(item => item.class).join(", ")}`
                  : "No supported civic issue detected in this image."}
              </Alert>
            )}
            {photoError && <Alert severity="error" sx={{ mt:1, borderRadius:1.5 }}>{photoError}</Alert>}
          </Grid>
          <Grid size={{xs:12,md:5}} sx={{ display:"flex", alignItems:"center" }}>
            <FormControlLabel control={<Checkbox checked={form.anonymous} onChange={e=>set("anonymous",e.target.checked)} />} label={t("anonymous")} />
          </Grid>

          <Grid size={12}>
            <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:1.5, mt:1, flexWrap:"wrap" }}>
              <Box sx={{ display:"flex", alignItems:"center", gap:1 }}>
                <DraftsOutlined color="action" />
                <Button type="button" onClick={saveDraft} sx={{ borderRadius:1.5 }}>Save draft</Button>
                {draftSaved && <Chip size="small" label="Draft saved" color="success" variant="outlined" />}
              </Box>
              <Box sx={{ display:"flex", gap:1.5 }}>
                <Button type="button" onClick={()=>navigate("/citizen")} sx={{ borderRadius:1.5 }}>{t("cancel")}</Button>
                <Button type="submit" variant="contained" size="large" disabled={submitting || photoVerifying || !form.description.trim() || !form.location.trim()} endIcon={submitting ? <AutoAwesomeRounded /> : <SendRounded />} sx={{ borderRadius:1.5, px:3 }}>
                  {submitting ? "Submitting..." : t("submit")}
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
