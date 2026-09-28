// -----------------------------------------------------------------------------
// ComplaintDetail.jsx — Complaint details, lifecycle and operational actions
// -----------------------------------------------------------------------------
// The screen is intentionally shared between citizen and admin.
//
// Citizen sees:
//   - complaint information
//   - status timeline
//   - reference number / share controls
//
// Admin additionally sees:
//   - status update
//   - assignment
//   - internal comments
//   - rule-based priority explanation
//
// All actions are local demo state right now. Replace the handlers with the
// appropriate FastAPI service functions when the backend is ready.
// -----------------------------------------------------------------------------

import { useState } from "react";
import { Alert, Box, Button, Chip, Divider, MenuItem, Select, TextField, Typography } from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import LocationOnRounded from "@mui/icons-material/LocationOnRounded";
import AccessTimeRounded from "@mui/icons-material/AccessTimeRounded";
import PersonRounded from "@mui/icons-material/PersonRounded";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import ContentCopyRounded from "@mui/icons-material/ContentCopyRounded";
import ShareRounded from "@mui/icons-material/ShareRounded";
import AutoAwesomeRounded from "@mui/icons-material/AutoAwesomeRounded";
import { useTranslation } from "react-i18next";
import StatusChip from "./StatusChip";

const API_ROOT = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");
const API_BASE = `${API_ROOT}/api`;

export default function ComplaintDetail({ complaint, admin=false, onBack }) {
  const { t } = useTranslation();
  const [status,setStatus] = useState(complaint.status);
  const [assigned,setAssigned] = useState(complaint.assigned);
  const [comment,setComment] = useState("");
  const [notice,setNotice] = useState("");
  const steps = ["New","Assigned","In Progress","Resolved"];
  const active = steps.indexOf(status);
  const officers = ["Unassigned","Ravi Kumar","Roads Team A","Water Works 2","Civic Safety Team"];

  const copyReference = async () => {
    try { await navigator.clipboard.writeText(complaint.id); setNotice("Complaint reference copied."); }
    catch { setNotice(`Reference: ${complaint.id}`); }
    setTimeout(()=>setNotice(""),1800);
  };

  const share = async () => {
    if (navigator.share) await navigator.share({ title:"CivicFlow complaint", text:`Track complaint ${complaint.id}` });
    else await copyReference();
  };

  const addComment = () => {
    if (!comment.trim()) return;
    setNotice("Internal update added (demo).");
    setComment("");
    setTimeout(()=>setNotice(""),1800);
  };

  const saveOperationsChanges = async () => {
    try {
      const token = localStorage.getItem("civic_token");
      const response = await fetch(`${API_BASE}/complaints/${encodeURIComponent(complaint.id)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status, assigned }),
      });

      if (!response.ok) throw new Error("Could not save complaint changes.");

      const updatedComplaint = await response.json();
      setStatus(updatedComplaint.status);
      setAssigned(updatedComplaint.assigned);
      setNotice("Operations changes saved.");
    } catch (error) {
      setNotice(error.message || "Could not save complaint changes.");
    }
  };

  return (
    <Box>
      <Button startIcon={<ArrowBackRounded />} onClick={onBack} sx={{mb:2}}>Back</Button>
      {notice && <Alert severity="success" sx={{mb:2,borderRadius:1.5}}>{notice}</Alert>}
      <Box className="neo" sx={{p:{xs:2,md:3},borderRadius:2}}>
        <Box sx={{display:"flex",justifyContent:"space-between",gap:2,flexWrap:"wrap"}}>
          <Box><Typography variant="h4" fontWeight={900}>{complaint.title}</Typography><Typography color="text.secondary" sx={{mt:.7}}>{complaint.id} · {complaint.time}</Typography></Box>
          <Box sx={{display:"flex",alignItems:"center",gap:.7}}><Button size="small" onClick={copyReference} startIcon={<ContentCopyRounded/>}>Copy ID</Button><Button size="small" onClick={share} startIcon={<ShareRounded/>}>Share</Button><StatusChip status={status}/></Box>
        </Box>

        <Box sx={{display:"grid",gridTemplateColumns:{xs:"1fr",md:"repeat(4,1fr)"},gap:1.2,my:3}}>
          {[[<LocationOnRounded/> ,"Location",complaint.location],[<AccessTimeRounded/> ,"Age",`${complaint.age} days`],[<PersonRounded/> ,"Assigned to",assigned],[<AutoAwesomeRounded/> ,"Priority score",`${complaint.score}/100`]].map(([icon,label,value])=><Box key={label} className="neo-soft" sx={{p:1.7,borderRadius:1.7}}><Box sx={{display:"flex",gap:1,alignItems:"center",color:"primary.main"}}>{icon}<Typography variant="caption" fontWeight={800}>{label}</Typography></Box><Typography fontWeight={800} sx={{mt:.7}}>{value}</Typography></Box>)}
        </Box>

        {complaint.category === "Other" && complaint.custom_category && (
          <Box className="neo-soft" sx={{ p:1.7, borderRadius:1.7, mb:2 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={800}>Specified category</Typography>
            <Typography fontWeight={800} sx={{ mt:.5 }}>{complaint.custom_category}</Typography>
          </Box>
        )}

        <Box sx={{px:{xs:0,md:2},py:2}}><Typography fontWeight={850} sx={{mb:2}}>Status timeline</Typography><Box sx={{display:"flex",alignItems:"flex-start",overflowX:"auto",pb:1}}>{steps.map((step,i)=><Box key={step} sx={{minWidth:150,flex:1,textAlign:"center",position:"relative"}}>{i<steps.length-1&&<Box sx={{position:"absolute",top:14,left:"50%",right:"-50%",height:3,bgcolor:i<active?"primary.main":"divider",zIndex:0}}/>}<Box sx={{position:"relative",zIndex:1,mx:"auto",width:30,height:30,borderRadius:"50%",display:"grid",placeItems:"center",bgcolor:i<=active?"primary.main":"action.disabledBackground",color:i<=active?"#fff":"text.secondary"}}>{i<active?<CheckCircleRounded fontSize="small"/>:i+1}</Box><Typography variant="caption" fontWeight={800} sx={{display:"block",mt:1}}>{step}</Typography><Typography variant="caption" color="text.secondary">{i<active?"Completed":i===active?"Current status":"Pending"}</Typography></Box>)}</Box></Box>

        <Divider sx={{my:2}} />
        <Typography fontWeight={850} sx={{mb:1}}>Description</Typography><Typography color="text.secondary" sx={{lineHeight:1.8,maxWidth:900}}>{complaint.description}</Typography>

        {complaint.photo_url && (
          <Box sx={{ mt:3 }}>
            <Typography fontWeight={850} sx={{ mb:1 }}>Attached photo</Typography>
            <Box
              component="img"
              src={complaint.photo_url}
              alt={`Complaint ${complaint.id}`}
              sx={{
                width:"100%",
                maxWidth:640,
                maxHeight:360,
                objectFit:"cover",
                borderRadius:1.5,
                display:"block",
                border:"1px solid",
                borderColor:"divider",
              }}
            />
          </Box>
        )}

        {admin && <Box sx={{mt:3,display:"grid",gridTemplateColumns:{xs:"1fr",md:"1fr 1fr"},gap:2}}>
          <Box className="neo-inset" sx={{p:2,borderRadius:1.7}}>
            <Typography fontWeight={800} sx={{mb:1}}>Operations update</Typography>
            <Typography variant="caption" color="text.secondary">Status</Typography>
            <Select fullWidth size="small" value={status} onChange={e=>setStatus(e.target.value)} sx={{mt:.5,mb:1.5}}>{steps.map(s=><MenuItem key={s} value={s}>{s}</MenuItem>)}</Select>
            <Typography variant="caption" color="text.secondary">Assign team member</Typography>
            <Select fullWidth size="small" value={assigned} onChange={e=>setAssigned(e.target.value)} sx={{mt:.5}}>{officers.map(s=><MenuItem key={s} value={s}>{s}</MenuItem>)}</Select>
            <Button variant="contained" sx={{mt:1.5}} onClick={saveOperationsChanges}>Save changes</Button>
          </Box>
          <Box className="neo-inset" sx={{p:2,borderRadius:1.7}}>
            <Typography fontWeight={800}>Internal update</Typography>
            <TextField fullWidth multiline minRows={3} value={comment} onChange={e=>setComment(e.target.value)} placeholder="Write an internal update for the municipal team..." sx={{mt:1,"& .MuiOutlinedInput-root":{borderRadius:1.5}}}/>
            <Button sx={{mt:1}} variant="outlined" disabled={!comment.trim()} onClick={addComment}>Add update</Button>
          </Box>
          <Box className="neo-soft" sx={{p:2,borderRadius:1.7,gridColumn:{md:"1 / -1"}}}>
            <Typography fontWeight={850}>Why is this priority?</Typography>
            <Typography variant="body2" color="text.secondary" sx={{mt:.5}}>Demo explanation: complaint age ({complaint.age} days), category weight ({complaint.category}) and similar-complaint volume contribute to the displayed score of {complaint.score}. The authoritative rule should be calculated by the backend.</Typography>
          </Box>
        </Box>}
      </Box>
    </Box>
  );
}
