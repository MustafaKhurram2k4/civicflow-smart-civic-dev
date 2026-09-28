import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import AutoAwesomeRounded from "@mui/icons-material/AutoAwesomeRounded";
import DownloadRounded from "@mui/icons-material/DownloadRounded";
import RefreshRounded from "@mui/icons-material/RefreshRounded";
import LocationOnRounded from "@mui/icons-material/LocationOnRounded";
import TrendingUpRounded from "@mui/icons-material/TrendingUpRounded";
import WarningAmberRounded from "@mui/icons-material/WarningAmberRounded";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import AccessTimeRounded from "@mui/icons-material/AccessTimeRounded";
import { useTranslation } from "react-i18next";
import { fetchAnalytics, generateAIReport } from "../services/reportService";

const PERIODS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "half-monthly", label: "Half Monthly" },
  { value: "monthly", label: "Monthly" },
];

const emptyReport = (period = "weekly") => ({
  period,
  period_label: PERIODS.find((item) => item.value === period)?.label || period,
  summary: { total: 0, resolved: 0, pending: 0, urgent: 0, resolution_rate: 0 },
  categories: [],
  statuses: [],
  priorities: [],
  trend: [],
  hotspots: [],
  aging: { "0-2 days": 0, "3-7 days": 0, "8-14 days": 0, ">14 days": 0 },
});

function KpiCard({ icon, label, value, helper }) {
  return (
    <Box className="neo" sx={{ p: 2.3, borderRadius: 2, height: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
        <Box>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
          <Typography sx={{ fontSize: 30, fontWeight: 950, mt: 0.5 }}>{value}</Typography>
          <Typography variant="caption" color="text.secondary">{helper}</Typography>
        </Box>
        <Box sx={{ width: 42, height: 42, borderRadius: 1.5, display: "grid", placeItems: "center", background: "rgba(109,93,252,.10)" }}>
          {icon}
        </Box>
      </Box>
    </Box>
  );
}

function HorizontalBars({ items, labelKey, valueKey, emptyText = "No data available." }) {
  const max = Math.max(...items.map((item) => Number(item[valueKey] || 0)), 1);
  if (!items.length) return <Typography color="text.secondary">{emptyText}</Typography>;

  return (
    <Stack spacing={1.7}>
      {items.map((item) => {
        const value = Number(item[valueKey] || 0);
        return (
          <Box key={String(item[labelKey])}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.6 }}>
              <Typography fontWeight={750}>{item[labelKey]}</Typography>
              <Typography fontWeight={900}>{value}</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(value / max) * 100}
              sx={{ height: 9, borderRadius: 5, "& .MuiLinearProgress-bar": { borderRadius: 5 } }}
            />
          </Box>
        );
      })}
    </Stack>
  );
}

function TrendBars({ trend }) {
  if (!trend.length) return <Typography color="text.secondary">No trend data available.</Typography>;
  const max = Math.max(...trend.map((item) => Number(item.count || 0)), 1);
  const shown = trend.slice(-14);

  return (
    <Box sx={{ height: 220, display: "flex", alignItems: "end", gap: 0.8, pt: 2 }}>
      {shown.map((item) => {
        const value = Number(item.count || 0);
        const height = Math.max(5, (value / max) * 170);
        return (
          <Box key={item.date} sx={{ flex: 1, minWidth: 8, height: 190, display: "flex", alignItems: "end" }}>
            <Box
              title={`${item.date}: ${value} complaints`}
              sx={{ width: "100%", height, borderRadius: "7px 7px 2px 2px", background: "linear-gradient(180deg,#6d5dfc,#315f8c)", transition: "height .25s" }}
            />
          </Box>
        );
      })}
    </Box>
  );
}

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState("weekly");
  const [report, setReport] = useState(emptyReport("weekly"));
  const [loading, setLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState("");
  const [reportError, setReportError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setReport(await fetchAnalytics(period));
    } catch (err) {
      setReport(emptyReport(period));
      setError(err.message || "Unable to load analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [period]);

  const agingTotal = useMemo(() => Object.values(report?.aging || {}).reduce((sum, value) => sum + Number(value || 0), 0), [report]);
  const agingItems = useMemo(() => Object.entries(report?.aging || {}).map(([label, count]) => ({ label, count })), [report]);

  const handleGenerate = async () => {
    setReportLoading(true);
    setReportError("");
    try {
      await generateAIReport(period);
    } catch (err) {
      setReportError(err.message || "Unable to generate the AI report.");
    } finally {
      setReportLoading(false);
    }
  };

  const summary = report?.summary || {};

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Box>
          <Typography variant="h3" fontWeight={950}>{t("analytics")}</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Operational intelligence for municipal teams.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Select size="small" value={period} onChange={(event) => setPeriod(event.target.value)} sx={{ minWidth: 150 }}>
            {PERIODS.map((item) => <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>)}
          </Select>
          <Button variant="outlined" startIcon={<RefreshRounded />} onClick={load} disabled={loading}>
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={reportLoading ? <CircularProgress size={18} color="inherit" /> : <AutoAwesomeRounded />}
            endIcon={!reportLoading && <DownloadRounded />}
            onClick={handleGenerate}
            disabled={reportLoading || loading}
            sx={{ fontWeight: 850 }}
          >
            {reportLoading ? "Generating AI Report..." : "Generate AI Report"}
          </Button>
        </Stack>
      </Box>

      <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
        The PDF uses verified analytics for its numbers and Gemini for interpretation, findings, and recommendations.
      </Alert>
      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}
      {reportError && <Alert severity="error" sx={{ mb: 2 }}>{reportError}</Alert>}

      {loading && !report ? (
        <Box sx={{ py: 10, display: "grid", placeItems: "center" }}><CircularProgress /></Box>
      ) : (
        <>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}><KpiCard icon={<TrendingUpRounded color="primary" />} label="Total complaints" value={summary.total ?? 0} helper={`${report.period_label} reporting period`} /></Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}><KpiCard icon={<CheckCircleRounded color="success" />} label="Resolved" value={summary.resolved ?? 0} helper={`${summary.resolution_rate ?? 0}% resolution rate`} /></Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}><KpiCard icon={<AccessTimeRounded color="warning" />} label="Pending" value={summary.pending ?? 0} helper="Not yet resolved" /></Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}><KpiCard icon={<WarningAmberRounded color="error" />} label="High priority" value={summary.urgent ?? 0} helper="Requires attention" /></Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, lg: 7 }}>
              <Box className="neo" sx={{ p: 3, borderRadius: 2, height: "100%" }}>
                <Typography variant="h6" fontWeight={900}>Complaint trend</Typography>
                <Typography variant="body2" color="text.secondary">Complaint volume during the selected period.</Typography>
                <TrendBars trend={report.trend || []} />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, lg: 5 }}>
              <Box className="neo" sx={{ p: 3, borderRadius: 2, height: "100%" }}>
                <Typography variant="h6" fontWeight={900} sx={{ mb: 2 }}>Issue distribution</Typography>
                <HorizontalBars items={report.categories || []} labelKey="category" valueKey="count" />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box className="neo" sx={{ p: 3, borderRadius: 2, height: "100%" }}>
                <Typography variant="h6" fontWeight={900} sx={{ mb: 2 }}>Priority mix</Typography>
                <HorizontalBars items={report.priorities || []} labelKey="priority" valueKey="count" />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box className="neo" sx={{ p: 3, borderRadius: 2, height: "100%" }}>
                <Typography variant="h6" fontWeight={900} sx={{ mb: 2 }}>Status mix</Typography>
                <HorizontalBars items={report.statuses || []} labelKey="status" valueKey="count" />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, lg: 7 }}>
              <Box className="neo" sx={{ p: 3, borderRadius: 2, height: "100%" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <LocationOnRounded color="primary" />
                  <Box>
                    <Typography variant="h6" fontWeight={900}>Hotspot locations</Typography>
                    <Typography variant="body2" color="text.secondary">Highest complaint concentration.</Typography>
                  </Box>
                </Box>
                <Stack spacing={1}>
                  {(report.hotspots || []).map((item, index) => (
                    <Paper key={item.location} variant="outlined" sx={{ p: 1.5, borderRadius: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">#{index + 1}</Typography>
                        <Typography fontWeight={800}>{item.location}</Typography>
                      </Box>
                      <Chip label={item.count} size="small" />
                    </Paper>
                  ))}
                </Stack>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, lg: 5 }}>
              <Box className="neo" sx={{ p: 3, borderRadius: 2, height: "100%" }}>
                <Typography variant="h6" fontWeight={900}>Complaint aging</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Unresolved complaints by age.</Typography>
                <Stack spacing={1.3}>
                  {agingItems.map((item) => (
                    <Box key={item.label}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography fontWeight={750}>{item.label}</Typography>
                        <Typography fontWeight={850}>{item.count}</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={agingTotal ? (item.count / agingTotal) * 100 : 0} sx={{ height: 8, borderRadius: 4 }} />
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}
