// -----------------------------------------------------------------------------
// LanguageSwitcher.jsx — Indian language selector
// -----------------------------------------------------------------------------
// This component is shared by the sidebar, top bar and settings page.
//
// Changing the selection calls i18next.changeLanguage(). Because the translation
// provider wraps the whole application, every translated label updates together.
//
// To add a language, add:
//   1. A translation resource in src/i18n/i18n.js
//   2. Its code + display name to the languages array below.
// -----------------------------------------------------------------------------

import { FormControl, MenuItem, Select } from "@mui/material";
import TranslateRounded from "@mui/icons-material/TranslateRounded";
import { useTranslation } from "react-i18next";

const languages = [
  ["en","English"],["hi","हिन्दी"],["bn","বাংলা"],["mr","मराठी"],["ta","தமிழ்"],
  ["te","తెలుగు"],["kn","ಕನ್ನಡ"],["ml","മലയാളം"],["gu","ગુજરાતી"],["pa","ਪੰਜਾਬੀ"]
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  return (
    <FormControl size="small" sx={{ minWidth: 145 }}>
      <Select
        value={i18n.language}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        displayEmpty
        startAdornment={<TranslateRounded size={18} style={{marginRight:8}} />}
        sx={{
          borderRadius: 1.8,
          bgcolor: "background.paper",
          boxShadow: "inset 3px 3px 7px rgba(163,177,198,.25), inset -3px -3px 7px rgba(255,255,255,.85)",
          "& fieldset": { border: "none" }
        }}
      >
        {languages.map(([code,label]) => <MenuItem key={code} value={code}>{label}</MenuItem>)}
      </Select>
    </FormControl>
  );
}
