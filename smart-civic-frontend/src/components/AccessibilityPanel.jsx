import { cloneElement } from "react";
import { Box, Button, Grid, Slider, Switch, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import AccessibilityNewRounded from "@mui/icons-material/AccessibilityNewRounded";
import RecordVoiceOverRounded from "@mui/icons-material/RecordVoiceOverRounded";
import VisibilityRounded from "@mui/icons-material/VisibilityRounded";
import HearingRounded from "@mui/icons-material/HearingRounded";
import KeyboardRounded from "@mui/icons-material/KeyboardRounded";
import PsychologyRounded from "@mui/icons-material/PsychologyRounded";
import RestartAltRounded from "@mui/icons-material/RestartAltRounded";
import { useAccessibility } from "../accessibility/AccessibilityContext";
import { useThemeMode } from "../theme/ThemeModeContext";

const stageLabels = ["Normal", "Slight", "Large", "Larger", "Extra", "Very Large", "Maximum"];
const stageValues = ["100%", "110%", "125%", "140%", "160%", "180%", "200%"];

function SettingRow({ icon, title, description, children }) {
  const control = children && children.props
    ? cloneElement(children, {
        inputProps: {
          ...(children.props.inputProps || {}),
          "aria-label": title,
        },
        "aria-label": title,
      })
    : children;

  return <Box className="access-setting-row" data-narrate-label={title} sx={{ p: 1.7, borderRadius: 2, display: "flex", gap: 1.5, alignItems: "center" }}>
    <Box sx={{ color: "primary.main", display: "grid", placeItems: "center", flex: "0 0 auto" }}>{icon}</Box>
    <Box sx={{ flex: 1, minWidth: 0 }}><Typography className="access-setting-title" fontWeight={850}>{title}</Typography><Typography variant="body2" color="text.secondary">{description}</Typography></Box>
    {control}
  </Box>;
}

export default function AccessibilityPanel() {
  const { settings, update, reset, showNarrator, dismissNarrator } = useAccessibility();
  const { preference, setPreference } = useThemeMode();
  const narrateNow = () => showNarrator("The accessibility narrator is active. Click a control once to hear its name and what it does. Click the same control a second time to activate it. You can turn the narrator off here at any time.");

  return <Box sx={{ mt: 3 }}>
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><AccessibilityNewRounded color="primary"/><Typography variant="h5" fontWeight={900}>Accessibility</Typography></Box>
      <Typography color="text.secondary" sx={{ mt: .5 }}>Tools for visual, auditory, motor and cognitive accessibility. Your choices are saved on this device.</Typography>
    </Box>

    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 7 }}>
        <Box className="neo" sx={{ p: 2.3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={900}>Theme & display</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Choose the base appearance independently from accessibility contrast.</Typography>
          <ToggleButtonGroup fullWidth exclusive value={preference} onChange={(_, v) => v && setPreference(v)} aria-label="Theme preference" sx={{ mb: 2 }}>
            <ToggleButton value="light">White</ToggleButton><ToggleButton value="system">System</ToggleButton><ToggleButton value="dark">Dark</ToggleButton>
          </ToggleButtonGroup>
          <SettingRow icon={<VisibilityRounded />} title="High contrast" description="Use explicit high-contrast colors without applying a filter to the whole page.">
            <Switch checked={settings.highContrast} onChange={e => update("highContrast", e.target.checked)} />
          </SettingRow>
          <Box sx={{ mt: 1.2 }}>
            <Typography fontWeight={850}>Text size: {stageValues[settings.textStage]}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Seven fixed stages from Normal to Maximum. Icons keep their intended size.</Typography>
            <ToggleButtonGroup fullWidth exclusive value={settings.textStage} onChange={(_, v) => v !== null && update("textStage", v)} aria-label="Text size">
              {stageLabels.map((label, i) => <ToggleButton key={label} value={i} sx={{ minWidth: 0, px: .4, flex: 1, flexDirection: "column", lineHeight: 1.15 }}><strong>{stageValues[i]}</strong><small>{label}</small></ToggleButton>)}
            </ToggleButtonGroup>
          </Box>
        </Box>
      </Grid>

      <Grid size={{ xs: 12, md: 5 }}>
        <Box className="neo" sx={{ p: 2.3, borderRadius: 2, height: "100%" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><RecordVoiceOverRounded color="primary"/><Typography variant="h6" fontWeight={900}>Narrator</Typography></Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>The narrator starts on first entry to the application. One click describes a control; the second click activates it.</Typography>
          <SettingRow icon={<RecordVoiceOverRounded />} title="Narrator" description="Reads accessibility guidance aloud in the selected language.">
            <Switch checked={settings.narrator} onChange={e => e.target.checked ? update("narrator", true) : (dismissNarrator(), update("narrator", false))} />
          </SettingRow>
          <Button fullWidth variant="outlined" sx={{ mt: 1.3 }} onClick={narrateNow} disabled={!settings.narrator}>Test narrator</Button>
          {settings.audioControls && <Box sx={{ mt: 1.5 }}>
            <Typography fontWeight={800}>Volume: {Math.round(settings.narratorVolume * 100)}%</Typography>
            <Slider value={settings.narratorVolume} min={0} max={1} step={.05} onChange={(_, v) => update("narratorVolume", v)} aria-label="Narrator volume" />
            <Typography fontWeight={800}>Speech speed: {settings.narratorRate.toFixed(1)}×</Typography>
            <Slider value={settings.narratorRate} min={.6} max={1.4} step={.1} onChange={(_, v) => update("narratorRate", v)} aria-label="Narrator speed" />
          </Box>}
        </Box>
      </Grid>

      <Grid size={{ xs: 12 }}><Box className="neo" sx={{ p: 2.3, borderRadius: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}><HearingRounded color="primary"/><Typography variant="h6" fontWeight={900}>Auditory accessibility</Typography></Box>
        <Grid container spacing={1.2}>
          <Grid size={{ xs: 12, md: 4 }}><SettingRow icon={<HearingRounded />} title="Closed captions" description="Show the narrator's current spoken message on screen."><Switch checked={settings.captions} onChange={e => update("captions", e.target.checked)} /></SettingRow></Grid>
          <Grid size={{ xs: 12, md: 4 }}><SettingRow icon={<HearingRounded />} title="Transcripts" description="Keep recent narrator messages visible as text."><Switch checked={settings.transcripts} onChange={e => update("transcripts", e.target.checked)} /></SettingRow></Grid>
          <Grid size={{ xs: 12, md: 4 }}><SettingRow icon={<HearingRounded />} title="Audio controls" description="Allow volume and speech-speed adjustments."><Switch checked={settings.audioControls} onChange={e => update("audioControls", e.target.checked)} /></SettingRow></Grid>
        </Grid>
      </Box></Grid>

      <Grid size={{ xs: 12 }}><Box className="neo" sx={{ p: 2.3, borderRadius: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}><KeyboardRounded color="primary"/><Typography variant="h6" fontWeight={900}>Motor & physical accessibility</Typography></Box>
        <Grid container spacing={1.2}>
          <Grid size={{ xs: 12, md: 4 }}><SettingRow icon={<KeyboardRounded />} title="Keyboard navigation" description="Keep controls reachable with Tab, Shift+Tab, Enter and Space."><Switch checked={settings.keyboard} onChange={e => update("keyboard", e.target.checked)} /></SettingRow></Grid>
          <Grid size={{ xs: 12, md: 4 }}><SettingRow icon={<KeyboardRounded />} title="Focus indicators" description="Show a strong outline around the active keyboard element."><Switch checked={settings.focus} onChange={e => update("focus", e.target.checked)} /></SettingRow></Grid>
          <Grid size={{ xs: 12, md: 4 }}><SettingRow icon={<AccessibilityNewRounded />} title="Larger click targets" description="Give controls more comfortable touch/click areas."><Switch checked={settings.largeTargets} onChange={e => update("largeTargets", e.target.checked)} /></SettingRow></Grid>
        </Grid>
      </Box></Grid>

      <Grid size={{ xs: 12 }}><Box className="neo" sx={{ p: 2.3, borderRadius: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}><PsychologyRounded color="primary"/><Typography variant="h6" fontWeight={900}>Cognitive & learning accessibility</Typography></Box>
        <Grid container spacing={1.2}>
          <Grid size={{ xs: 12, md: 4 }}><SettingRow icon={<PsychologyRounded />} title="Predictable layout" description="Keep navigation and interaction behavior consistent."><Switch checked={settings.predictable} onChange={e => update("predictable", e.target.checked)} /></SettingRow></Grid>
          <Grid size={{ xs: 12, md: 4 }}><SettingRow icon={<PsychologyRounded />} title="Clear language" description="Increase reading space and line-height for easier scanning."><Switch checked={settings.clearLanguage} onChange={e => update("clearLanguage", e.target.checked)} /></SettingRow></Grid>
          <Grid size={{ xs: 12, md: 4 }}><SettingRow icon={<AccessibilityNewRounded />} title="Reduced motion" description="Minimize animations and transitions."><Switch checked={settings.reducedMotion} onChange={e => update("reducedMotion", e.target.checked)} /></SettingRow></Grid>
        </Grid>
      </Box></Grid>

      <Grid size={{ xs: 12 }}><Box className="neo-soft" sx={{ p: 2, borderRadius: 2, display: "flex", gap: 1.2, alignItems: "center" }}>
        <Box sx={{ flex: 1 }}><Typography fontWeight={850}>Alternative text</Typography><Typography variant="body2" color="text.secondary">Descriptive text remains available for images and non-text content.</Typography></Box>
        <Button startIcon={<RestartAltRounded />} onClick={reset}>Reset accessibility</Button>
      </Box></Grid>
    </Grid>
  </Box>;
}
