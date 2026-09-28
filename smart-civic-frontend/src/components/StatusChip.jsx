// -----------------------------------------------------------------------------
// StatusChip.jsx — Consistent status indicator
// -----------------------------------------------------------------------------
// All complaint statuses should use this component so the meaning and styling
// stay consistent throughout citizen and admin views.
//
// Supported workflow:
// New | Assigned | In Progress | Resolved
// -----------------------------------------------------------------------------

import { Chip } from "@mui/material";

export default function StatusChip({ status }) {
  const map = {
    New: ["#e8eef7", "#315f8c"],
    Assigned: ["#eeeafb", "#6255c9"],
    "In Progress": ["#fff3df", "#a86a1e"],
    Resolved: ["#e2f4ed", "#28765f"]
  };
  const [bg, color] = map[status] || map.New;
  return <Chip size="small" label={status} sx={{ bgcolor:bg, color, fontWeight:800, borderRadius:2.5 }} />;
}