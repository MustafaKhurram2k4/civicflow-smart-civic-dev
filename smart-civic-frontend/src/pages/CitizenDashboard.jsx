import { useState, useMemo, useEffect } from "react";
import { Box, Button, Chip, Grid, Typography, Card } from "@mui/material";
import AddRounded from "@mui/icons-material/AddRounded";
import TrackChangesRounded from "@mui/icons-material/TrackChangesRounded";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import WarningAmberRounded from "@mui/icons-material/WarningAmberRounded";
import AccessTimeRounded from "@mui/icons-material/AccessTimeRounded";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import ConstructionRounded from "@mui/icons-material/ConstructionRounded";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import StatCard from "../components/StatCard";
import ComplaintTable from "../components/ComplaintTable";
import ComplaintDetail from "../components/ComplaintDetail";
import { getCurrentUser, getUserComplaints, getTimeGreeting, syncComplaintsFromDB } from "../data/complaintsStore";
import { useTranslation } from "react-i18next";

export default function CitizenDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [complaintsList, setComplaintsList] = useState([]);

  const currentUser = useMemo(() => getCurrentUser(), []);

  useEffect(() => {
    // Initial local cache
    setComplaintsList(getUserComplaints(currentUser));
    // Fetch live from MongoDB backend
    syncComplaintsFromDB(currentUser).then((live) => {
      if (live) setComplaintsList(live);
    });
  }, [currentUser]);

  const myComplaints = complaintsList;

  if (selected) return <ComplaintDetail complaint={selected} onBack={() => setSelected(null)} />;

  const services = [
    ["Road Damage", <ConstructionRounded />],
    ["Garbage", <DeleteOutlineRounded />],
    ["Pothole", <ConstructionRounded />],
    ["Other", <InfoOutlined />],
  ];

  const tracked = myComplaints.length > 0 ? myComplaints[0] : null;
  const steps = ["New", "Assigned", "In Progress", "Resolved"];
  const activeStep = tracked ? steps.indexOf(tracked.status) : -1;

  // Calculate dynamic stats for this user
  const activeCount = myComplaints.filter((x) => x.status !== "Resolved").length;
  const resolvedCount = myComplaints.filter((x) => x.status === "Resolved").length;
  const urgentCount = myComplaints.filter((x) => ["Critical", "High"].includes(x.priority) && x.status !== "Resolved").length;

  return (
    <Box>
      {/* Header with Dynamic Time-Based Greeting and Name */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Box>
          <Typography variant="h3" fontWeight={900}>
            {getTimeGreeting(currentUser.name)} 👋
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.7 }}>
            {myComplaints.length > 0
              ? `You have ${activeCount} active civic report${activeCount === 1 ? "" : "s"} under review.`
              : "Welcome to your personal CivicFlow dashboard. You have not submitted any complaints yet."}
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          startIcon={<AddRounded />}
          onClick={() => navigate("/citizen/report")}
          sx={{ borderRadius: 2, px: 2.5, boxShadow: "0 10px 24px rgba(49,95,140,.22)" }}
        >
          {t("newComplaint")}
        </Button>
      </Box>

      {/* Top Status Banner */}
      {tracked ? (
        <Box className="neo-soft" sx={{ p: 1.8, borderRadius: 2.5, mb: 2.5, display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <CheckCircleRounded color="success" />
          <Box sx={{ flex: 1 }}>
            <Typography fontWeight={800}>Your latest report is being processed</Typography>
            <Typography variant="body2" color="text.secondary">
              {tracked.id} • {tracked.category} • Status: {tracked.status}
            </Typography>
          </Box>
          <Button size="small" endIcon={<ArrowForwardRounded />} onClick={() => setSelected(tracked)}>
            View status
          </Button>
        </Box>
      ) : (
        <Box className="neo-soft" sx={{ p: 1.8, borderRadius: 2.5, mb: 2.5, display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <InfoOutlined color="primary" />
          <Box sx={{ flex: 1 }}>
            <Typography fontWeight={800}>No active complaints</Typography>
            <Typography variant="body2" color="text.secondary">
              Spot a pothole, broken streetlight, or garbage overflow in your area? Report it to notify municipal teams.
            </Typography>
          </Box>
          <Button size="small" variant="contained" startIcon={<AddRounded />} onClick={() => navigate("/citizen/report")}>
            Report an issue
          </Button>
        </Box>
      )}

      {/* Stat Cards */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard icon={<TrackChangesRounded />} label="Your Active" value={activeCount} hint={activeCount > 0 ? "In Progress" : "None"} tone="blue" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard icon={<CheckCircleRounded />} label="Your Resolved" value={resolvedCount} hint="Resolved" tone="green" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard icon={<WarningAmberRounded />} label="High Priority" value={urgentCount} hint={urgentCount > 0 ? "Needs Action" : "All Clear"} tone="amber" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard icon={<AccessTimeRounded />} label="Avg Response" value="-" hint="Not available yet" tone="purple" />
        </Grid>
      </Grid>

      {/* Service Category Shortcuts */}
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="subtitle1" fontWeight={900} sx={{ mb: 1 }}>
          Report by service category
        </Typography>
        <Grid container spacing={1.5}>
          {services.map(([name, icon]) => (
            <Grid key={name} size={{ xs: 6, sm: 3 }}>
              <motion.div whileHover={{ y: -2 }}>
                <Button
                  fullWidth
                  onClick={() => navigate("/citizen/report")}
                  className="neo-soft"
                  sx={{ justifyContent: "flex-start", gap: 1.2, p: 1.4, borderRadius: 2, color: "text.primary" }}
                >
                  {icon}
                  <Typography fontWeight={750} noWrap>
                    {name}
                  </Typography>
                </Button>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Recent Complaints Table & Live Tracker */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Box className="neo" sx={{ p: 2.5, borderRadius: 2.5, height: "100%" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight={900}>
                  {t("recent")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your submitted civic grievances
                </Typography>
              </Box>
              {myComplaints.length > 0 && (
                <Button onClick={() => navigate("/citizen/complaints")}>{t("viewAll")}</Button>
              )}
            </Box>

            {myComplaints.length > 0 ? (
              <ComplaintTable rows={myComplaints.slice(0, 4)} onSelect={setSelected} />
            ) : (
              <Box sx={{ py: 6, textAlign: "center" }}>
                <Typography color="text.secondary" fontWeight={650} sx={{ mb: 1.5 }}>
                  You haven't filed any complaints yet.
                </Typography>
                <Button variant="outlined" startIcon={<AddRounded />} onClick={() => navigate("/citizen/report")}>
                  Submit your first complaint
                </Button>
              </Box>
            )}
          </Box>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Box className="neo" sx={{ p: 2.5, borderRadius: 2.5, height: "100%" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              <Box>
                <Typography variant="h6" fontWeight={900}>
                  {t("track")}
                </Typography>
                <Typography color="text.secondary">{tracked ? tracked.id : "Live Tracker"}</Typography>
              </Box>
              {tracked && <Chip label={tracked.priority} size="small" color={["Critical", "High"].includes(tracked.priority) ? "error" : "primary"} />}
            </Box>

            {tracked ? (
              <Box className="neo-inset" sx={{ p: 2, mt: 2, borderRadius: 2 }}>
                {steps.map((step, i) => (
                  <Box key={step} sx={{ display: "flex", alignItems: "flex-start", gap: 1.3, position: "relative", pb: i === 3 ? 0 : 2 }}>
                    {i < 3 && (
                      <Box sx={{ position: "absolute", left: 5, top: 13, bottom: 0, width: 2, bgcolor: i < activeStep ? "primary.main" : "divider" }} />
                    )}
                    <Box sx={{ zIndex: 1, width: 12, height: 12, borderRadius: "50%", bgcolor: i <= activeStep ? "primary.main" : "action.disabledBackground", mt: 0.3 }} />
                    <Box>
                      <Typography fontWeight={800}>{step}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {i < activeStep ? "Completed" : i === activeStep ? "Team is working on it" : "Pending"}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box className="neo-inset" sx={{ p: 3, mt: 2, borderRadius: 2, textAlign: "center" }}>
                <Typography color="text.secondary" variant="body2">
                  When you report an issue, you can track its step-by-step resolution timeline here in real-time.
                </Typography>
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
