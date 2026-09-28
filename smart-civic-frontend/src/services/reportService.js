const API_ROOT = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");
const API_BASE = `${API_ROOT}/api`;

export async function fetchAnalytics(period = "weekly") {
  const response = await fetch(`${API_BASE}/analytics/report?period=${encodeURIComponent(period)}`);
  if (!response.ok) {
    let message = `Analytics request failed (${response.status})`;
    try {
      const body = await response.json();
      message = body.detail || message;
    } catch {}
    throw new Error(message);
  }
  return response.json();
}

export async function generateAIReport(period = "monthly") {
  const response = await fetch(`${API_BASE}/reports/generate?period=${encodeURIComponent(period)}`, {
    method: "POST",
  });

  if (!response.ok) {
    let message = `Report generation failed (${response.status})`;
    try {
      const body = await response.json();
      message = body.detail || message;
    } catch {}
    throw new Error(message);
  }

  const blob = await response.blob();
  const disposition = response.headers.get("content-disposition") || "";
  const match = disposition.match(/filename="?([^";]+)"?/i);
  const filename = match?.[1] || `CivicFlow_${period}_Municipal_Intelligence_Report.pdf`;

  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}
