import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import React, { useState } from 'react';
import './css/zoneTable.css';

export function ZoneTablecontainer()
{
    function createData(
      ZoneName,
      CornerZoneType,
      Sequence,
      Action,
     
    ) {
      return { ZoneName, CornerZoneType, Sequence, Action };
    }
    
    const rows = [  createData('Zone A', 'Dwell', 1, 'Action'), 
                    createData('Zone B', 'Dwell', 2, 'Action'),
                    createData('Zone C', 'Exclude', " ", 'Action'),
                    createData('Coffee Shop', 'Peel-Of Kite', " ", 'Action'),];
    
    function ZoneTable() {
      return (
        React.createElement(TableContainer, { component: Paper },
          React.createElement(Table, { sx: { minWidth: 650 }, 'aria-label': 'simple table' },
            React.createElement(TableHead, null,
              React.createElement(TableRow, null,
                React.createElement(TableCell, { align: 'left' }, 'Zone Name'),
                React.createElement(TableCell, { align: 'left' }, 'Zone Type'),
                React.createElement(TableCell, { align: 'left' }, 'Sequence'),
                React.createElement(TableCell, { align: 'left' }, 'Action'), 
                
              ),
             
            ),
            React.createElement(TableBody, null,
              rows.map((row) =>
                React.createElement(TableRow, {
                  key: row.ZoneName,
                  sx: { '&:last-child td, &:last-child th': { border: 0 } },
                },
                  React.createElement(TableCell, { component: 'th', scope: 'row' }, row.ZoneName),
                  React.createElement(TableCell, { align: 'left' }, row.CornerZoneType),
                  React.createElement(TableCell, { align: 'left' }, row.Sequence),
                  React.createElement(TableCell, { align: 'left' }, row.Action),
                )
              ),
            ),
          ),
        )
      );
    }
    return ZoneTable();
    }

    