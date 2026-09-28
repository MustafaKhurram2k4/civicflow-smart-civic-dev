// -----------------------------------------------------------------------------
// AppShell.jsx — Shared application frame
// -----------------------------------------------------------------------------
// This component owns the navigation shell used by both experiences:
//
// Citizen:
//   /citizen
//
// Admin:
//   /admin
//
// It automatically detects which side of the application the user is viewing
// and changes the sidebar navigation accordingly.
//
// Backend integration should generally NOT be placed here. This component is
// presentation/navigation infrastructure, not business logic.
// -----------------------------------------------------------------------------

import { NavLink, useLocation, useNavigate } from "react-router-dom";

import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
  Divider,
  Button,
} from "@mui/material";

import MenuRounded from "@mui/icons-material/MenuRounded";
import HomeRounded from "@mui/icons-material/HomeRounded";
import ReportProblemRounded from "@mui/icons-material/ReportProblemRounded";
import AssignmentRounded from "@mui/icons-material/AssignmentRounded";
import AnalyticsRounded from "@mui/icons-material/AnalyticsRounded";
import SettingsRounded from "@mui/icons-material/SettingsRounded";
import LogoutRounded from "@mui/icons-material/LogoutRounded";
import AddCircleOutlineRounded from "@mui/icons-material/AddCircleOutlineRounded";

import LanguageSwitcher from "./LanguageSwitcher";
import NotificationCenter from "./NotificationCenter";

import DarkModeRounded from "@mui/icons-material/DarkModeRounded";
import LightModeRounded from "@mui/icons-material/LightModeRounded";
import RecordVoiceOverRounded from "@mui/icons-material/RecordVoiceOverRounded";

import { useThemeMode } from "../theme/ThemeModeContext";
import { useTranslation } from "react-i18next";
import { useAccessibility } from "../accessibility/AccessibilityContext";

import { useState } from "react";

export default function AppShell({ children }) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { mode, toggleMode } = useThemeMode();

  const {
    narratorVisible,
    narratorMessage,
    transcript,
    dismissNarrator,
    speak,
    settings,
  } = useAccessibility();

  const isAdmin = location.pathname.startsWith("/admin");
  const base = isAdmin ? "/admin" : "/citizen";

  const nav = isAdmin
    ? [
        ["/admin", "dashboard", <HomeRounded key="dashboard" />],
        [
          "/admin/complaints",
          "complaints",
          <AssignmentRounded key="complaints" />,
        ],
        [
          "/admin/analytics",
          "analytics",
          <AnalyticsRounded key="analytics" />,
        ],
        [
          "/admin/settings",
          "settings",
          <SettingsRounded key="settings" />,
        ],
      ]
    : [
        ["/citizen", "dashboard", <HomeRounded key="dashboard" />],
        [
          "/citizen/report",
          "newComplaint",
          <AddCircleOutlineRounded key="report" />,
        ],
        [
          "/citizen/complaints",
          "myComplaints",
          <ReportProblemRounded key="complaints" />,
        ],
        [
          "/citizen/settings",
          "settings",
          <SettingsRounded key="settings" />,
        ],
      ];

  const drawer = (
    <Box
      sx={{
        height: "100%",
        p: 2,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        className="civicflow-logo-lockup civicflow-shell-logo-lockup"
        aria-label="CivicFlow — Smart Civic Grievance Portal"
      >
        <img
          src="/civicflow-logo-light.png"
          alt="CivicFlow — Smart Civic Grievance Portal"
          className="civicflow-logo civicflow-shell-logo civicflow-logo-light"
          draggable="false"
        />
        <img
          src="/civicflow-logo-dark.png"
          alt="CivicFlow — Smart Civic Grievance Portal"
          className="civicflow-logo civicflow-shell-logo civicflow-logo-dark"
          draggable="false"
        />
      </Box>

      <Divider
        sx={{
          my: 1.5,
          borderColor:
            mode === "dark"
              ? "rgba(255,255,255,.10)"
              : "rgba(35,48,68,.07)",
        }}
      />

      <List sx={{ flex: 1 }}>
        {nav.map(([to, key, icon]) => (
          <ListItemButton
            key={to}
            component={NavLink}
            to={to}
            end={to === base}
            onClick={() => setMobileOpen(false)}
            sx={{
              mb: 0.7,
              borderRadius: 2.2,
              color: mode === "dark" ? "rgba(255,255,255,.70)" : "#617187",
              "&.active": {
                color: mode === "dark" ? "#8ec5ff" : "#315f8c",
                bgcolor:
                  mode === "dark" ? "rgba(121,181,238,.10)" : "action.hover",
                boxShadow:
                  mode === "dark"
                    ? "inset 4px 4px 8px rgba(0,0,0,.18), inset -4px -4px 8px rgba(70,86,105,.10)"
                    : "inset 4px 4px 8px var(--cf-shadow-dark), inset -4px -4px 8px var(--cf-shadow-light)",
              },
              "&:hover": {
                bgcolor:
                  mode === "dark" ? "rgba(255,255,255,.06)" : "action.hover",
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
              {icon}
            </ListItemIcon>
            <ListItemText
              primary={t(key)}
              primaryTypographyProps={{ fontWeight: 750 }}
            />
          </ListItemButton>
        ))}
      </List>

      <ListItemButton
        sx={{
          borderRadius: 2,
          minHeight: 44,
          px: 1.2,
          mb: 0.5,
          color: mode === "dark" ? "rgba(255,255,255,.68)" : "#526176",
          "&:hover": {
            bgcolor:
              mode === "dark" ? "rgba(255,255,255,.06)" : "#e3eaf2",
          },
        }}
        onClick={() => {
          localStorage.removeItem("civic_user");
          navigate("/login");
        }}
      >
        <ListItemIcon sx={{ minWidth: 38, color: "inherit" }}>
          <LogoutRounded />
        </ListItemIcon>
        <ListItemText
          primary={t("logout")}
          primaryTypographyProps={{ fontWeight: 700 }}
        />
      </ListItemButton>
    </Box>
  );

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          "--cf-surface": mode === "dark" ? "#1b2430" : "#e7edf4",
          "--cf-shadow-dark":
            mode === "dark"
              ? "rgba(0,0,0,.34)"
              : "rgba(163,177,198,.40)",
          "--cf-shadow-light":
            mode === "dark"
              ? "rgba(70,86,105,.16)"
              : "rgba(255,255,255,.88)",
        }}
      >
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            width: 270,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: 270,
              boxSizing: "border-box",
              border: 0,
              bgcolor: "background.default",
              p: 1.5,
            },
          }}
        >
          {drawer}
        </Drawer>

        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{
            "& .MuiDrawer-paper": {
              width: 285,
              bgcolor: "background.default",
              border: 0,
            },
          }}
        >
          {drawer}
        </Drawer>

        <Box component="main" id="main-content" sx={{ flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              height: 72,
              px: { xs: 2, md: 4 },
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              position: "sticky",
              top: 0,
              zIndex: 10,
              bgcolor: "background.default",
              backdropFilter: "blur(16px)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton
                onClick={() => setMobileOpen(true)}
                sx={{ display: { md: "none" }, mr: 0.5 }}
                aria-label="Open navigation menu"
              >
                <MenuRounded />
              </IconButton>

              <Typography
                sx={{
                  display: { xs: "none", sm: "block" },
                  fontWeight: 700,
                  color: "text.secondary",
                }}
              >
                {t("appTag")}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
              <NotificationCenter />

              <Tooltip
                title={mode === "light" ? "Use dark mode" : "Use light mode"}
              >
                <IconButton
                  onClick={toggleMode}
                  aria-label={
                    mode === "light"
                      ? "Switch to dark mode"
                      : "Switch to light mode"
                  }
                >
                  {mode === "light" ? (
                    <DarkModeRounded />
                  ) : (
                    <LightModeRounded />
                  )}
                </IconButton>
              </Tooltip>

              <LanguageSwitcher />
            </Box>
          </Box>

          <Box
            sx={{
              px: { xs: 2, md: 4 },
              pb: 5,
              maxWidth: 1500,
              mx: "auto",
            }}
          >
            {children}
          </Box>
        </Box>

        {settings.captions && narratorVisible && narratorMessage && (
          <Box
            className="narrator-caption"
            role="status"
            aria-live="polite"
          >
            {narratorMessage}
          </Box>
        )}

        {settings.transcripts && transcript.length > 0 && (
          <Box
            className="narrator-transcript"
            role="log"
            aria-label="Narrator transcript"
          >
            <Typography
              variant="caption"
              fontWeight={900}
              sx={{ display: "block", mb: 0.5 }}
            >
              Narrator transcript
            </Typography>

            {transcript.map((line, index) => (
              <Typography
                key={`${index}-${line}`}
                variant="body2"
                sx={{ lineHeight: 1.5, mb: 0.3 }}
              >
                {line}
              </Typography>
            ))}
          </Box>
        )}

        {narratorVisible && settings.narrator && (
          <Box
            role="dialog"
            aria-label="Accessibility narrator"
            className="narrator-bubble"
            data-narrator-control="true"
          >
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.2 }}>
              <RecordVoiceOverRounded color="primary" />

              <Box sx={{ flex: 1 }}>
                <Typography fontWeight={900}>
                  Accessibility Narrator
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {narratorMessage}
                </Typography>
              </Box>

              <Button
                size="small"
                onClick={dismissNarrator}
                data-narrator-control="true"
              >
                Turn off
              </Button>
            </Box>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 0.8 }}
            >
              Click a control once to hear it. Click the same control again to
              activate it.
            </Typography>

            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 1 }}
              onClick={() => {
                speak(narratorMessage);
                dismissNarrator();
              }}
              data-narrator-control="true"
            >
              Narrate
            </Button>
          </Box>
        )}
      </Box>
    </>
  );
}
