// -----------------------------------------------------------------------------
// StatCard.jsx — Reusable KPI / metric card
// -----------------------------------------------------------------------------
// Dashboard numbers should use this component instead of creating four or five
// slightly different card implementations.
//
// `tone` changes the small accent color only.
// The card itself follows the project's neomorphic visual system.
// -----------------------------------------------------------------------------

import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";

export default function StatCard({ icon, label, value, hint, tone="blue" }) {
  const tones = {
    blue:"#315f8c", green:"#2e8b72", amber:"#b87826", purple:"#6557ca"
  };
  return (
    <motion.div whileHover={{ y:-3 }} transition={{ duration:.18 }}>
      <Box className="neo" sx={{ p:2.25, borderRadius:2.5, height:"100%" }}>
        <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <Box sx={{ width:44, height:44, borderRadius:2, display:"grid", placeItems:"center",
            color:tones[tone], bgcolor:"#edf2f7", boxShadow:"inset 3px 3px 7px rgba(163,177,198,.28), inset -3px -3px 7px #fff" }}>
            {icon}
          </Box>
          <Typography variant="caption" sx={{ fontWeight:800, color:tones[tone] }}>{hint}</Typography>
        </Box>
        <Typography sx={{ mt:2, fontSize:30, fontWeight:850, letterSpacing:"-.04em" }}>{value}</Typography>
        <Typography color="text.secondary" fontWeight={650}>{label}</Typography>
      </Box>
    </motion.div>
  );
}