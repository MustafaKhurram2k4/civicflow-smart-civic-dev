// -----------------------------------------------------------------------------
// SettingsPage.jsx — Preferences and account controls
// -----------------------------------------------------------------------------
// Theme and language work immediately in the frontend. Notification and privacy
// controls are visually prepared for a future user-preferences API.
// -----------------------------------------------------------------------------

import { useState } from "react";
import { Box, Divider, FormControlLabel, Grid, Switch, Typography, Button, Alert } from "@mui/material";
import DarkModeRounded from "@mui/icons-material/DarkModeRounded";
import NotificationsActiveOutlined from "@mui/icons-material/NotificationsActiveOutlined";
import ShieldOutlined from "@mui/icons-material/ShieldOutlined";
import LanguageRounded from "@mui/icons-material/LanguageRounded";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useThemeMode } from "../theme/ThemeModeContext";

export default function SettingsPage() {
  const { mode, toggleMode } = useThemeMode();
  const [notifications, setNotifications] = useState(true);
  const [privacy, setPrivacy] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(()=>setSaved(false), 1800); };
  return <Box sx={{maxWidth:950,mx:"auto"}}>
    <Box sx={{mb:3}}><Typography variant="h3">Settings</Typography><Typography color="text.secondary" sx={{mt:.7}}>Control language, appearance and notification preferences.</Typography></Box>
    {saved && <Alert severity="success" sx={{mb:2,borderRadius:1.5}}>Preferences saved on this device.</Alert>}
    <Grid container spacing={2}>
      <Grid size={{xs:12,md:7}}><Box className="neo" sx={{p:2.5,borderRadius:2}}>
        <Typography variant="h6" fontWeight={900}>Appearance</Typography><Typography variant="body2" color="text.secondary" sx={{mb:2}}>Choose how CivicFlow looks on this device.</Typography>
        <Box sx={{display:"flex",alignItems:"center",justifyContent:"space-between",p:1.5,borderRadius:1.7}} className="neo-soft"><Box sx={{display:"flex",gap:1.2,alignItems:"center"}}><DarkModeRounded color="primary"/><Box><Typography fontWeight={800}>Dark mode</Typography><Typography variant="caption" color="text.secondary">Reduce glare in low-light environments.</Typography></Box></Box><Switch checked={mode==="dark"} onChange={toggleMode}/></Box>
        <Divider sx={{my:2}} />
        <Box sx={{display:"flex",alignItems:"center",gap:1.2,mb:1}}><LanguageRounded color="primary"/><Typography fontWeight={850}>Language</Typography></Box><LanguageSwitcher />
      </Box></Grid>
      <Grid size={{xs:12,md:5}}><Box className="neo" sx={{p:2.5,borderRadius:2,height:"100%"}}>
        <Typography variant="h6" fontWeight={900}>Notifications</Typography><Typography variant="body2" color="text.secondary" sx={{mb:2}}>Frontend controls ready for server-side preferences.</Typography>
        <FormControlLabel control={<Switch checked={notifications} onChange={e=>setNotifications(e.target.checked)} />} label={<Box><Typography fontWeight={750}>Complaint updates</Typography><Typography variant="caption" color="text.secondary">Status and assignment alerts</Typography></Box>} />
        <FormControlLabel control={<Switch checked={privacy} onChange={e=>setPrivacy(e.target.checked)} />} label={<Box><Typography fontWeight={750}>Privacy-first reporting</Typography><Typography variant="caption" color="text.secondary">Default new reports to anonymous</Typography></Box>} />
        <Box sx={{display:"flex",gap:1,mt:2,alignItems:"center"}}><NotificationsActiveOutlined color="action"/><Typography variant="caption" color="text.secondary">Notification delivery will be connected by the backend team.</Typography></Box>
      </Box></Grid>
      <Grid size={12}><Box className="neo-soft" sx={{p:2,borderRadius:2,display:"flex",gap:1.2,alignItems:"center"}}><ShieldOutlined color="success"/><Box sx={{flex:1}}><Typography fontWeight={850}>Your privacy matters</Typography><Typography variant="body2" color="text.secondary">Anonymous reports hide citizen identity from the complaint workflow where supported by the backend.</Typography></Box><Button onClick={save} variant="contained">Save preferences</Button></Box></Grid>
    </Grid>
  </Box>;
}
