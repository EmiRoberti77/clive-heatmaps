import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import './css/peelOfTable.css';




function createData(Direction, Desc, Count, Total, Conversion) {
  return { Direction, Desc, Count, Total, Conversion };
}

const rows = [
  createData('A - B', 'Passed By', 100, 300, "40%"),
  createData('B - A', 'Passed By', 200, " ", " "),
  createData('A - C', 'Entered', 250, 250, " "),
  createData('C - B', 'Exited', 240, 240, " "),
];

export function BasicTable() {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Direction</TableCell>
            <TableCell align="right">Desc</TableCell>
            <TableCell align="right">Count</TableCell>
            <TableCell align="right">Total</TableCell>
            <TableCell align="right">Conversion</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.name}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.Direction}
              </TableCell>
              <TableCell align="right">{row.Desc}</TableCell>
              <TableCell align="right">{row.Count}</TableCell>
              <TableCell align="right">{row.Total}</TableCell>
              <TableCell align="right">{row.Conversion}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
