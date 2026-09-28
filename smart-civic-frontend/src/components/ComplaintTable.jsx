// -----------------------------------------------------------------------------
// ComplaintTable.jsx — Reusable complaint list
// -----------------------------------------------------------------------------
// Presentation-only component. Filtering, sorting and API calls stay outside.
// ----------------------------------------------------------------------------

import { Box, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import StatusChip from "./StatusChip";
import { useTranslation } from "react-i18next";

export default function ComplaintTable({ rows, onSelect }) {
  const { t } = useTranslation();
  return (
    <TableContainer className="neo" sx={{ borderRadius:2, overflow:"hidden" }}>
      <Table size="small">
        <TableHead><TableRow>{["complaintId","category","location","priority","status","reported"].map(k => <TableCell key={k} sx={{fontWeight:850,color:"text.secondary",py:1.7}}>{t(k)}</TableCell>)}<TableCell /></TableRow></TableHead>
        <TableBody>
          {rows.map(row => <TableRow key={row.id} hover onClick={()=>onSelect?.(row)} sx={{cursor:onSelect?"pointer":"default"}}>
            <TableCell><Typography fontWeight={850}>{row.id}</Typography><Typography variant="caption" color="text.secondary">{row.title}</Typography></TableCell>
            <TableCell>{row.category === "Other" && row.custom_category ? `Other: ${row.custom_category}` : row.category}</TableCell><TableCell>{row.location}</TableCell>
            <TableCell><Chip size="small" label={`${row.priority} · ${row.score}`} sx={{fontWeight:800,borderRadius:1.5}} /></TableCell>
            <TableCell><StatusChip status={row.status} /></TableCell><TableCell sx={{whiteSpace:"nowrap"}}>{row.time}</TableCell>
            <TableCell><ArrowForwardRounded fontSize="small" /></TableCell>
          </TableRow>)}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
