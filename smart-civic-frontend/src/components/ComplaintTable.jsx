// -----------------------------------------------------------------------------
// ComplaintTable.jsx — Reusable complaint list
// -----------------------------------------------------------------------------
// Presentation-only component. Filtering, sorting and API calls stay outside.
// Desktop: accessible data table.
// Mobile: compact complaint cards for narrow screens.
// -----------------------------------------------------------------------------

import {
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import StatusChip from "./StatusChip";
import { useTranslation } from "react-i18next";

const priorityColor = (priority) => {
  if (priority === "Critical") return "error";
  if (priority === "High") return "warning";
  return "default";
};

export default function ComplaintTable({ rows, onSelect }) {
  const { t } = useTranslation();

  return (
    <>
      {/* Desktop / tablet table */}
      <TableContainer className="neo civicflow-complaints-table-wrap">
        <Table size="small" aria-label={t("recent")}>
          <TableHead>
            <TableRow>
              {["complaintId", "category", "location", "priority", "status", "reported"].map((key) => (
                <TableCell
                  key={key}
                  sx={{
                    fontWeight: 850,
                    color: "text.secondary",
                    py: 1.7,
                  }}
                >
                  {t(key)}
                </TableCell>
              ))}
              <TableCell aria-hidden="true" />
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.id}
                hover
                onClick={() => onSelect?.(row)}
                sx={{ cursor: onSelect ? "pointer" : "default" }}
              >
                <TableCell>
                  <Typography fontWeight={850}>{row.id}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {row.title}
                  </Typography>
                </TableCell>
                <TableCell>
                  {row.category === "Other" && row.custom_category
                    ? `Other: ${row.custom_category}`
                    : row.category}
                </TableCell>
                <TableCell>{row.location}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={`${row.priority} · ${row.score}`}
                    color={priorityColor(row.priority)}
                    variant={row.priority === "Low" ? "outlined" : "filled"}
                    sx={{ fontWeight: 800, borderRadius: 1.5 }}
                  />
                </TableCell>
                <TableCell>
                  <StatusChip status={row.status} />
                </TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>{row.time}</TableCell>
                <TableCell>
                  <ArrowForwardRounded fontSize="small" aria-hidden="true" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Mobile cards */}
      <Box
        className="civicflow-complaints-mobile"
        aria-label={t("recent")}
      >
        {rows.map((row) => {
          const category =
            row.category === "Other" && row.custom_category
              ? `Other: ${row.custom_category}`
              : row.category;

          return (
            <Box
              key={row.id}
              component="button"
              type="button"
              className="civicflow-complaint-mobile-card"
              onClick={() => onSelect?.(row)}
              disabled={!onSelect}
              aria-label={`View complaint ${row.id}`}
            >
              <Box className="civicflow-complaint-mobile-top">
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    className="civicflow-complaint-mobile-id"
                    component="div"
                    fontWeight={900}
                  >
                    {row.id}
                  </Typography>
                  <Typography
                    component="div"
                    variant="caption"
                    color="text.secondary"
                    noWrap
                  >
                    {row.time}
                  </Typography>
                </Box>

                <Chip
                  size="small"
                  label={`${row.priority} · ${row.score}`}
                  color={priorityColor(row.priority)}
                  variant={row.priority === "Low" ? "outlined" : "filled"}
                  sx={{ fontWeight: 850, borderRadius: 1.5, flexShrink: 0 }}
                />
              </Box>

              <Box className="civicflow-complaint-mobile-category">
                <Typography fontWeight={850}>{category}</Typography>
                <StatusChip status={row.status} />
              </Box>

              <Box className="civicflow-complaint-mobile-location">
                <LocationOnOutlined fontSize="small" aria-hidden="true" />
                <Typography variant="body2" color="text.secondary">
                  {row.location}
                </Typography>
              </Box>

              {row.title && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  className="civicflow-complaint-mobile-title"
                >
                  {row.title}
                </Typography>
              )}

              <Box className="civicflow-complaint-mobile-action">
                <Typography variant="body2" fontWeight={850}>
                  View complaint
                </Typography>
                <ArrowForwardRounded fontSize="small" aria-hidden="true" />
              </Box>
            </Box>
          );
        })}
      </Box>
    </>
  );
}
