import { useState } from "react";
import { Alert, Box, Button, Chip, CircularProgress, Typography } from "@mui/material";
import AutoAwesomeRounded from "@mui/icons-material/AutoAwesomeRounded";

const API_ROOT = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");
const API_BASE = `${API_ROOT}/api`;

export default function SmartAssistCard({ description, onApply }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const analyze = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${API_BASE}/ai/classify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });

      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.detail || "AI summary failed.");
      }

      setResult(body);
    } catch (err) {
      setError(err.message || "AI summary failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="neo-soft" sx={{ mt: 1.5, p: 1.7, borderRadius: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AutoAwesomeRounded sx={{ color: "secondary.main" }} />
          <Box>
            <Typography fontWeight={850}>Smart Assist</Typography>
            <Typography variant="caption" color="text.secondary">
              Use Gemini to make the description short and crisp.
            </Typography>
          </Box>
        </Box>
        <Button
          size="small"
          variant="contained"
          disabled={!description.trim() || loading}
          onClick={analyze}
          startIcon={loading ? <CircularProgress size={15} color="inherit" /> : <AutoAwesomeRounded />}
        >
          {loading ? "Summarizing..." : "Summarize with AI"}
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mt: 1.5, borderRadius: 1.5 }}>{error}</Alert>}

      {result && (
        <Alert severity="info" sx={{ mt: 1.5, borderRadius: 1.5 }}>
          <Box sx={{ display: "flex", gap: 0.7, flexWrap: "wrap", mb: 0.6 }}>
            <Chip size="small" label={`Category: ${result.category}`} />
            <Chip size="small" label={`Urgency: ${result.urgency}`} />
          </Box>
          <Typography variant="body2"><strong>Summary:</strong> {result.summary}</Typography>
          <Button size="small" sx={{ mt: 0.7 }} onClick={() => onApply?.(result)}>
            Apply suggestions
          </Button>
        </Alert>
      )}
    </Box>
  );
}
