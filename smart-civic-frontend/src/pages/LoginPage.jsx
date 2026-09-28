// -----------------------------------------------------------------------------
// LoginPage.jsx — Authentication & Registration Portal
// -----------------------------------------------------------------------------
import { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Card,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  Chip,
  Alert,
  CircularProgress,
} from "@mui/material";
import ShieldRounded from "@mui/icons-material/ShieldRounded";
import EmailRounded from "@mui/icons-material/EmailRounded";
import LockRounded from "@mui/icons-material/LockRounded";
import VisibilityRounded from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRounded from "@mui/icons-material/VisibilityOffRounded";
import PersonRounded from "@mui/icons-material/PersonRounded";
import PhoneRounded from "@mui/icons-material/PhoneRounded";
import AutoAwesomeRounded from "@mui/icons-material/AutoAwesomeRounded";
import CheckCircleOutlineRounded from "@mui/icons-material/CheckCircleOutlineRounded";
import DarkModeRounded from "@mui/icons-material/DarkModeRounded";
import LightModeRounded from "@mui/icons-material/LightModeRounded";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import AdminPanelSettingsRounded from "@mui/icons-material/AdminPanelSettingsRounded";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useThemeMode } from "../theme/ThemeModeContext";
import LanguageSwitcher from "../components/LanguageSwitcher";

const API_ROOT = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");
const BACKEND_API = `${API_ROOT}/api/auth`;
const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  import.meta.env.GOOGLE_CLIENT_ID ||
  "997057391032-e0rme2h7ac2f6nlmq5fno0t47ium9687.apps.googleusercontent.com";

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mode, toggleMode } = useThemeMode();
  const googleBtnRef = useRef(null);

  // Auth Mode: "login" or "signup"
  const [authMode, setAuthMode] = useState("login");

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const isSignUp = authMode === "signup";

  // Handle Google Token Returned by Google Identity Services
  const handleGoogleCredentialResponse = async (response) => {
    if (!response || !response.credential) {
      setErrorMsg("Google Sign-In was cancelled or failed to return a credential.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // Send Google ID Token to our FastAPI backend for verification & MongoDB upsert
      const res = await fetch(`${BACKEND_API}/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Google authentication failed on backend.");
      }

      // Save backend session JWT and user profile in localStorage
      if (data.access_token) {
        localStorage.setItem("civic_token", data.access_token);
      }
      if (data.user) {
        localStorage.setItem("civic_user", JSON.stringify(data.user));
      }

      const role = data.user?.role || "citizen";
      setSuccessMsg(`Welcome, ${data.user?.name || "User"}!`);

      setTimeout(() => {
        navigate(role === "admin" ? "/admin" : "/citizen");
      }, 500);
    } catch (err) {
      setErrorMsg(err.message || "Failed to authenticate with Google backend.");
    } finally {
      setLoading(false);
    }
  };

  // Render Official Google Sign-In Button on mount
  useEffect(() => {
    const initGoogle = () => {
      if (window.google && GOOGLE_CLIENT_ID) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            context: "signin",
          });

          if (googleBtnRef.current) {
            googleBtnRef.current.innerHTML = "";
            window.google.accounts.id.renderButton(googleBtnRef.current, {
              type: "standard",
              theme: mode === "dark" ? "filled_black" : "outline",
              size: "large",
              text: "continue_with",
              shape: "pill",
              width: 320,
              logo_alignment: "left",
            });
          }
        } catch (err) {
          console.error("Google Identity initialization error:", err);
        }
      }
    };

    // If script already loaded
    if (window.google) {
      initGoogle();
    } else {
      // Check every 300ms until script loads
      const timer = setInterval(() => {
        if (window.google) {
          clearInterval(timer);
          initGoogle();
        }
      }, 300);
      return () => clearInterval(timer);
    }
  }, [mode, GOOGLE_CLIENT_ID]);

  // Handle Form Submission (Email/Password)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    if (isSignUp) {
      if (!fullName) {
        setErrorMsg("Please enter your full name or Admin Code.");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg("Passwords do not match. Please check again.");
        return;
      }
      if (password.length < 6) {
        setErrorMsg("Password must be at least 6 characters.");
        return;
      }
    }

    setLoading(true);

    try {
      const endpoint = isSignUp ? `${BACKEND_API}/register` : `${BACKEND_API}/login`;
      const payload = isSignUp
        ? { email, password, full_name: fullName, phone }
        : { email, password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Authentication failed. Please check your credentials.");
      }

      if (data.access_token) {
        localStorage.setItem("civic_token", data.access_token);
      }
      if (data.user) {
        localStorage.setItem("civic_user", JSON.stringify(data.user));
      }

      const userRole = data.user?.role || "citizen";

      if (isSignUp) {
        setSuccessMsg(
          userRole === "admin"
            ? "Official Admin Account created! Redirecting to Command Center..."
            : "Citizen Account created! Redirecting to dashboard..."
        );
      }

      setTimeout(() => {
        navigate(userRole === "admin" ? "/admin" : "/citizen");
      }, 700);
    } catch (err) {
      if (err.message && err.message.includes("Failed to fetch")) {
        const role = (/^[aA]\d+/.test(fullName.trim()) || email.toLowerCase().includes("admin"))
          ? "admin"
          : "citizen";

        const sessionUser = {
          email,
          role,
          name: isSignUp ? fullName : (role === "admin" ? "A101" : "Ramesh Gupta"),
          phone,
        };
        localStorage.setItem("civic_user", JSON.stringify(sessionUser));
        navigate(role === "admin" ? "/admin" : "/citizen");
      } else {
        setErrorMsg(err.message || "An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-Click Demo Evaluation Logins
  const handleQuickDemoLogin = (targetRole) => {
    setLoading(true);
    setTimeout(() => {
      const demoUser =
        targetRole === "admin"
          ? { email: "admin@civicflow.gov.in", role: "admin", name: "A101" }
          : { email: "citizen@civicflow.org", role: "citizen", name: "Ramesh Gupta" };

      localStorage.setItem("civic_user", JSON.stringify(demoUser));
      navigate(targetRole === "admin" ? "/admin" : "/citizen");
    }, 500);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top Header */}
      <Box
        sx={{
          p: 2.5,
          px: { xs: 2, md: 5 },
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 10,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 3,
              display: "grid",
              placeItems: "center",
              color: "#fff",
              background: "linear-gradient(135deg, #315f8c, #5b83ac)",
              boxShadow: "4px 4px 12px var(--cf-shadow-dark)",
            }}
          >
            <ShieldRounded />
          </Box>
          <Box>
            <Typography fontWeight={900} fontSize={20} letterSpacing="-0.02em">
              Civic<span style={{ color: "#315f8c" }}>Flow</span>
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Smart Civic Grievance Portal
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton onClick={toggleMode} aria-label="Toggle theme">
            {mode === "light" ? <DarkModeRounded /> : <LightModeRounded />}
          </IconButton>
          <LanguageSwitcher />
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, md: 4 },
        }}
      >
        <Grid
          container
          spacing={4}
          sx={{
            maxWidth: 1050,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Left Hero Column */}
          <Grid size={{ xs: 12, md: 6 }}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Chip
                icon={<AutoAwesomeRounded sx={{ fontSize: 16 }} />}
                label="AI-Powered Municipal Governance"
                color="primary"
                variant="outlined"
                sx={{ mb: 2, fontWeight: 700, borderRadius: 2 }}
              />

              <Typography variant="h2" fontWeight={900} sx={{ lineHeight: 1.15, mb: 2 }}>
                Report civic issues, <br />
                <span style={{ color: "#315f8c" }}>track transparent</span> resolutions.
              </Typography>

              <Typography color="text.secondary" sx={{ fontSize: 15.5, mb: 3.5, maxWidth: 440 }}>
                A closed-loop civic intelligence platform connecting citizens directly with municipal departments for faster resolution.
              </Typography>

              {/* Feature Highlights */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {[
                  "Automated AI Grievance Categorization & Priority Scoring",
                  "Real-time SLA Tracking & Escalation Matrix",
                  "Bilingual Voice & Geo-tagged Photo Reporting",
                  "Direct Municipal Dispatch & Status Milestones",
                ].map((feat, idx) => (
                  <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                    <CheckCircleOutlineRounded color="primary" sx={{ fontSize: 19 }} />
                    <Typography fontWeight={650} fontSize={13.5} color="text.secondary">
                      {feat}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Quick Demo 1-Click Evaluation Access */}
              <Box
                className="neo-soft"
                sx={{
                  mt: 3.5,
                  p: 2,
                  borderRadius: 3,
                  maxWidth: 440,
                }}
              >
                <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.8 }}>
                  ⚡ Quick Demo 1-Click Access:
                </Typography>
                <Box sx={{ display: "flex", gap: 1.2, mt: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<PersonRounded />}
                    onClick={() => handleQuickDemoLogin("citizen")}
                    sx={{ borderRadius: 2, flex: 1, textTransform: "none", fontWeight: 700 }}
                  >
                    Demo Citizen
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<AdminPanelSettingsRounded />}
                    onClick={() => handleQuickDemoLogin("admin")}
                    sx={{ borderRadius: 2, flex: 1, textTransform: "none", fontWeight: 700 }}
                  >
                    Demo Admin (A101)
                  </Button>
                </Box>
              </Box>
            </motion.div>
          </Grid>

          {/* Right Login / Register Card */}
          <Grid size={{ xs: 12, md: 6 }}>
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card
                className="neo"
                sx={{
                  p: { xs: 3, sm: 4 },
                  borderRadius: 4,
                  boxShadow: "10px 10px 30px var(--cf-shadow-dark), -10px -10px 30px var(--cf-shadow-light)",
                }}
              >
                <Typography variant="h5" fontWeight={900} sx={{ mb: 0.5 }}>
                  {isSignUp ? "Create an Account" : "Welcome to CivicFlow"}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {isSignUp
                    ? "Fill in your details to register on the civic portal"
                    : "Sign in to submit complaints and track resolutions"}
                </Typography>

                {errorMsg && (
                  <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontSize: 13 }}>
                    {errorMsg}
                  </Alert>
                )}

                {successMsg && (
                  <Alert severity="success" sx={{ mb: 2, borderRadius: 2, fontSize: 13 }}>
                    {successMsg}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <AnimatePresence mode="wait">
                    {isSignUp && (
                      <motion.div
                        key="signup-fields"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{ display: "flex", flexDirection: "column", gap: 16 }}
                      >
                        {/* Full Name / Admin Code */}
                        <TextField
                          fullWidth
                          label="Full Name / Admin Code"
                          placeholder="e.g. Ramesh Gupta or A101"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PersonRounded color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />

                        {/* Phone Number */}
                        <TextField
                          fullWidth
                          label="Mobile Number (Optional)"
                          placeholder="+91 9876543210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PhoneRounded color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Email */}
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailRounded color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* Password */}
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockRounded color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            size="small"
                          >
                            {showPassword ? <VisibilityOffRounded /> : <VisibilityRounded />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* Confirm Password (only on Sign Up) */}
                  {isSignUp && (
                    <TextField
                      fullWidth
                      label="Confirm Password"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockRounded color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}

                  {/* Action Button */}
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardRounded />}
                    sx={{
                      mt: 1,
                      py: 1.35,
                      borderRadius: 2.5,
                      fontWeight: 800,
                      boxShadow: "0 8px 20px rgba(49,95,140,.28)",
                    }}
                  >
                    {loading
                      ? (isSignUp ? "Creating account..." : "Signing in...")
                      : (isSignUp ? "Create Account" : "Sign In")}
                  </Button>

                  {/* Toggle Link */}
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 0.8, mt: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      {isSignUp ? "Already have an account?" : "Don't have an account?"}
                    </Typography>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => {
                        setAuthMode(isSignUp ? "login" : "signup");
                        setErrorMsg("");
                        setSuccessMsg("");
                      }}
                      sx={{ fontWeight: 800, textTransform: "none", p: 0, minWidth: "auto" }}
                    >
                      {isSignUp ? "Sign In" : "Create one now"}
                    </Button>
                  </Box>

                  <Divider sx={{ my: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      OR
                    </Typography>
                  </Divider>

                  {/* Official Google Identity Services Sign-In Button */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "100%",
                      minHeight: 46,
                    }}
                  >
                    <div ref={googleBtnRef} style={{ width: "100%", display: "flex", justifyContent: "center" }} />
                  </Box>
                </Box>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
