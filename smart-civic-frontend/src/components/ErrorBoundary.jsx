// -----------------------------------------------------------------------------
// ErrorBoundary.jsx — Development-friendly crash screen
// -----------------------------------------------------------------------------
// If a React component throws during rendering, React can otherwise leave the
// browser looking like a blank page. This component gives the team a useful
// visible error instead, including the stack trace in development.
//
// Remove or replace the detailed stack display before a public production launch
// if the team does not want implementation details exposed to end users.
// -----------------------------------------------------------------------------

import React from "react";
import { Box, Button, Typography } from "@mui/material";
import RefreshRounded from "@mui/icons-material/RefreshRounded";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("CivicFlow React error:", error, info);
  }

  handleReload = () => window.location.reload();

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          p: 3,
          bgcolor: "#e9eef5",
        }}
      >
        <Box
          sx={{
            maxWidth: 720,
            width: "100%",
            p: 4,
            borderRadius: 4,
            bgcolor: "#e9eef5",
            boxShadow:
              "12px 12px 28px rgba(163,177,198,.5), -12px -12px 28px rgba(255,255,255,.95)",
          }}
        >
          <Typography variant="h4" fontWeight={900} gutterBottom>
            CivicFlow could not start
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            A frontend JavaScript error occurred. Check the browser Console
            (F12 → Console) for the full error.
          </Typography>

          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: "#dde4ec",
              overflow: "auto",
              fontFamily: "monospace",
              fontSize: 13,
            }}
          >
            {String(this.state.error?.message || this.state.error)}
          </Box>

          <Button
            sx={{ mt: 2 }}
            variant="contained"
            startIcon={<RefreshRounded />}
            onClick={this.handleReload}
          >
            Reload application
          </Button>
        </Box>
      </Box>
    );
  }
}
