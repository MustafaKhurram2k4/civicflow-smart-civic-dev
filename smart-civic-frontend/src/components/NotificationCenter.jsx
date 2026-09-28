// -----------------------------------------------------------------------------
// NotificationCenter.jsx — Small notification inbox for the header
// -----------------------------------------------------------------------------
// This is currently seeded with mock notifications. The backend team can later
// replace the array with GET /notifications and mark-read API calls.
// -----------------------------------------------------------------------------

import { useState } from "react";
import { Badge, Box, Divider, IconButton, Popover, Typography } from "@mui/material";
import NotificationsNoneRounded from "@mui/icons-material/NotificationsNoneRounded";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import AssignmentLateRounded from "@mui/icons-material/AssignmentLateRounded";
import InfoOutlined from "@mui/icons-material/InfoOutlined";

const notifications = [
  { id: 1, icon: <AssignmentLateRounded />, title: "Complaint needs attention", text: "CIV-2026-1048 is approaching its SLA deadline.", tone: "#d58b32" },
  { id: 2, icon: <CheckCircleRounded />, title: "Complaint resolved", text: "CIV-2026-1044 has been marked resolved.", tone: "#2e8b72" },
  { id: 3, icon: <InfoOutlined />, title: "Service update", text: "Water supply reports are being reviewed this morning.", tone: "#315f8c" }
];

export default function NotificationCenter() {
  const [anchor, setAnchor] = useState(null);
  const open = Boolean(anchor);
  return (
    <>
      <IconButton onClick={(e) => setAnchor(e.currentTarget)} aria-label="Notifications">
        <Badge badgeContent={notifications.length} color="error">
          <NotificationsNoneRounded />
        </Badge>
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{ sx: { mt: 1, width: 360, maxWidth: "calc(100vw - 24px)", borderRadius: 2, p: 1 } }}
      >
        <Box sx={{ px: 1.5, py: 1 }}>
          <Typography fontWeight={900}>Notifications</Typography>
          <Typography variant="caption" color="text.secondary">Recent activity across CivicFlow</Typography>
        </Box>
        <Divider />
        {notifications.map((item) => (
          <Box key={item.id} sx={{ display: "flex", gap: 1.25, p: 1.5, alignItems: "flex-start" }}>
            <Box sx={{ width: 34, height: 34, borderRadius: 1.5, display: "grid", placeItems: "center", bgcolor: `${item.tone}18`, color: item.tone, flexShrink: 0 }}>
              {item.icon}
            </Box>
            <Box>
              <Typography fontWeight={800} fontSize={14}>{item.title}</Typography>
              <Typography variant="body2" color="text.secondary">{item.text}</Typography>
            </Box>
          </Box>
        ))}
      </Popover>
    </>
  );
}
