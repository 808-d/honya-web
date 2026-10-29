import type { ReactNode } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

export interface AdminColumn<T> {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
  width?: number | string;
  render: (row: T) => ReactNode;
}

export function AdminTable<T>({
  columns,
  rows,
  getKey,
  loading,
  error,
  empty = "Nothing here yet.",
}: {
  columns: Array<AdminColumn<T>>;
  rows: T[];
  getKey: (row: T) => string;
  loading?: boolean;
  error?: string | null;
  empty?: string;
}) {
  if (error) {
    return <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>;
  }

  return (
    <TableContainer
      sx={{
        bgcolor: "var(--honya-foam)",
        border: "1px solid var(--honya-line)",
        boxShadow: "5px 5px 0 var(--honya-shadow)",
      }}
    >
      {loading && <LinearProgress />}
      <Table size="small">
        <TableHead>
          <TableRow sx={{ "& th": { fontWeight: 700, whiteSpace: "nowrap", borderColor: "var(--honya-line)" } }}>
            {columns.map((column) => (
              <TableCell key={column.key} align={column.align} width={column.width}>
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 && !loading ? (
            <TableRow>
              <TableCell colSpan={columns.length} sx={{ py: 5, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">{empty}</Typography>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow
                key={getKey(row)}
                hover
                sx={{ "& td": { borderColor: "var(--honya-line-soft)", verticalAlign: "middle" } }}
              >
                {columns.map((column) => (
                  <TableCell key={column.key} align={column.align}>
                    {column.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
