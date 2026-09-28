import { useMemo, useState, useEffect } from "react";
import { Box, Button, Chip, FormControl, Grid, InputAdornment, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import SearchRounded from "@mui/icons-material/SearchRounded";
import FilterAltOutlined from "@mui/icons-material/FilterAltOutlined";
import RestartAltRounded from "@mui/icons-material/RestartAltRounded";
import AddRounded from "@mui/icons-material/AddRounded";
import { getAllComplaints, getUserComplaints, getCurrentUser, syncComplaintsFromDB } from "../data/complaintsStore";
import ComplaintTable from "../components/ComplaintTable";
import ComplaintDetail from "../components/ComplaintDetail";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function ComplaintsPage({ admin = false }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("newest");
  const [rawComplaints, setRawComplaints] = useState([]);

  const currentUser = useMemo(() => getCurrentUser(), []);

  useEffect(() => {
    setRawComplaints(admin ? getAllComplaints() : getUserComplaints(currentUser));
    syncComplaintsFromDB(currentUser).then((live) => {
      if (live) setRawComplaints(live);
    });
  }, [admin, currentUser]);

  const complaintSource = rawComplaints;

  const categories = ["All", ...new Set(complaintSource.map((x) => x.category))];
  const statuses = ["All", "New", "Assigned", "In Progress", "Resolved"];
  const priorities = ["All", "Critical", "High", "Medium", "Low"];

  const rows = useMemo(() => {
    const filtered = complaintSource.filter((x) => {
      const textMatch = [x.id, x.title, x.category, x.location, x.status].join(" ").toLowerCase().includes(q.toLowerCase());
      return (
        textMatch &&
        (status === "All" || x.status === status) &&
        (priority === "All" || x.priority === priority) &&
        (category === "All" || x.category === category)
      );
    });
    return [...filtered].sort((a, b) =>
      sort === "priority" ? b.score - a.score : sort === "oldest" ? b.age - a.age : b.id.localeCompare(a.id)
    );
  }, [complaintSource, q, status, priority, category, sort]);

  const clear = () => {
    setQ("");
    setStatus("All");
    setPriority("All");
    setCategory("All");
    setSort("newest");
  };

  if (selected) return <ComplaintDetail complaint={selected} admin={admin} onBack={() => setSelected(null)} />;

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "end", mb: 2.5, gap: 2, flexWrap: "wrap" }}>
        <Box>
          <Typography variant="h3">{admin ? t("queue") : t("myComplaints")}</Typography>
          <Typography color="text.secondary">
            {admin ? t("queueHint") : "Track every civic grievance submitted by your account."}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          {!admin && (
            <Button variant="contained" startIcon={<AddRounded />} onClick={() => navigate("/citizen/report")}>
              {t("newComplaint")}
            </Button>
          )}
          <Chip icon={<FilterAltOutlined />} label={`${rows.length} shown`} variant="outlined" />
        </Box>
      </Box>

      <Box className="neo-soft" sx={{ p: 1.5, borderRadius: 2, mb: 2 }}>
        <Grid container spacing={1.2} alignItems="center">
          <Grid size={{ xs: 12, lg: 4 }}>
            <TextField
              fullWidth
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("search")}
              size="small"
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchRounded /></InputAdornment> }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3, lg: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
                {statuses.map((x) => (
                  <MenuItem key={x} value={x}>{x}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6, sm: 3, lg: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select label="Priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
                {priorities.map((x) => (
                  <MenuItem key={x} value={x}>{x}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6, sm: 3, lg: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map((x) => (
                  <MenuItem key={x} value={x}>{x}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6, sm: 3, lg: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort</InputLabel>
              <Select label="Sort" value={sort} onChange={(e) => setSort(e.target.value)}>
                <MenuItem value="newest">Newest</MenuItem>
                <MenuItem value="oldest">Oldest</MenuItem>
                <MenuItem value="priority">Priority score</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, lg: 12 }} sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button size="small" onClick={clear} startIcon={<RestartAltRounded />}>
              Clear filters
            </Button>
          </Grid>
        </Grid>
      </Box>

      {rows.length > 0 ? (
        <ComplaintTable rows={rows} onSelect={setSelected} />
      ) : (
        <Box className="neo" sx={{ p: 5, borderRadius: 2.5, textAlign: "center" }}>
          <Typography fontWeight={700} color="text.secondary" sx={{ mb: 1.5 }}>
            {admin ? "No complaints matching the selected filters." : "You haven't filed any complaints yet."}
          </Typography>
          {!admin && (
            <Button variant="outlined" startIcon={<AddRounded />} onClick={() => navigate("/citizen/report")}>
              Report a new complaint
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
}
