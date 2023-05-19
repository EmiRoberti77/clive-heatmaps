import React, { useEffect, useRef, useState } from 'react';
import './css/heatmap.css';
import h337 from 'heatmap.js';
// Added lib
import { Slider } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

//Drop down lib
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

// Date Picker
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import dayjs, { Dayjs } from 'dayjs';

//Endpoint
import { getHeatMapendpoint, getheatmapdata } from './endpoint'

//Slider
import 'toolcool-range-slider';

//Table
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

//Table comp
import { ZoneTablecontainer } from './Table/zoneTable';
// import { BasicTable } from './Table/peelOfTable';
import MaterialReactTable from 'material-react-table';
import img1 from "./images/image1.jpg";
import img2 from "./images/image2.jpg";
import img3 from "./images/image3.jpg";


// Paper JS


var heatmapInstance;
var points = [[]];
var strength = 50;
var dwellTime = [0, 24];
var data = {};
var peelOf = {};
var fromdate;
var Todate;
var siteval = 4;
var cameraval = 1;
var dates = ["27-04-2023", "09-05-2023", "08-05-2023"];
var tables = ['Heatmapstore', 'Heatmapstore1', 'Heatmapstore2'];
const _created = (e) => console.log(e);
var images=[img1,img2,img3];
//slider
var sliderStrength;
var row_data_default = { Conversion: "None",
  Entered: {
      A: 0,
      B: 0,
      total: 0
  },
  Exited: {
      A: 0,
      B: 0,
      total: 0
  },
  Passerby: {
      AB: 0,
      BA: 0,
      total: 0
  }};

console.log(img1);

// Heatmap Canvas 
function clearData() {
  points = [[]];
  console.log(points);
  var drawerP = document.getElementById("drawerPoint");
  var ctx = drawerP.getContext('2d');
  ctx.reset();
  if(heatmapInstance!=null){
    heatmapInstance.setData({ max: 100, data: [{ x: 0, y: 0, value: 0 }] });
  }
  //heatmapInstance = h337.addData(config);
}

function Heatmap() {

  function UploadImage() {
    const [image, setImage] = useState(null);
    function handleImageUpload(event) {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        setImage(reader.result);
        //console.log(document.getElementById('HeatMapCanvas'));
        var config = {
          container: document.getElementById('HeatMapCanvas'),
          radius: 20,
          maxOpacity: .8,
          minOpacity: 0,
          blur: .5,
          /*gradient: {
            // enter n keys between 0 and 1 here
            // for gradient color customization
            '.5': 'blue',
            '.8': 'red',
            '.95': 'white'
          }*/
        };
        var canvas = document.getElementById("HeatMapCanvas");
        canvas.style.backgroundImage = 'url(' + reader.result + ')';
        canvas.style.width = "720p";
        canvas.style.height = "480px";
        canvas.style.objectFit = "contain"
        canvas.style.backgroundSize = "100%";
        heatmapInstance = h337.create(config);
        //var dataPoint = [{ x: 13, y: 10,value: 86 }];
        //heatmapInstance.addData(dataPoint);
        console.log(reader);
        console.log(file);
        var drawerP = document.getElementById("drawerPoint");
        drawerP.width = "720";
        drawerP.height = "480";
        var ctx = drawerP.getContext('2d');
        ctx.beginPath();

        canvas.onclick = function (e) {
          var pointz = points[points.length - 1];
          var x = e.layerX;
          var y = e.layerY;
          //heatmapInstance.addData({ x: x, y: y, value: 100 });
          console.log([x, y]);
          pointz.push([x, y]);

          var drawerP = document.getElementById("drawerPoint");
          //drawerP.style.maxWidth="720px";
          //drawerP.style.maxHeight="480px";
          var ctx = drawerP.getContext('2d');
          if (pointz.length === 1) {
            ctx.beginPath();
            var dest = pointz[0]
            ctx.moveTo(dest[0], dest[1])
          }
          if (pointz.length > 1) {
            console.log({ pointz: pointz });
            //ctx.beginPath();
            //var dest=points[0]
            //ctx.moveTo(dest[0],dest[1])
            //for(var i = 0; i < points.length-1;i += 1){
            dest = pointz[pointz.length - 1]
            ctx.lineTo(dest[0], dest[1]);
            //}

            ctx.strokeStyle = "#7FFFD4";
            ctx.lineWidth = 5;
            ctx.stroke();
          }
          points[points.length - 1] = pointz;
        };
      };

      reader.readAsDataURL(file);
    }

    function complete() {
      var pointz = points[points.length - 1];
      if (pointz.length > 2) {
        var drawerP = document.getElementById("drawerPoint");
        var ctx = drawerP.getContext('2d');
        //var dest=points[0]
        //ctx.moveTo(dest[0],dest[1])
        //ctx.lineTo(dest[0],dest[1]);
        //var dest=points[points.length-1]
        //ctx.lineTo(dest[0],dest[1]);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.fill();

      }
    }
    function new_poly() {
      //heatmapInstance = h337.addData(config);
      var pointz = points[points.length - 1];
      if (pointz.length > 2) {
        var drawerP = document.getElementById("drawerPoint");
        var ctx = drawerP.getContext('2d');
        complete();
        ctx.beginPath();
        points.push([]);
      }

    }



    return (
      <div>
        {/* <label>Upload Image</label><br/> */}
        {/* {<input className="imageuploadbutton" type="file" accept="image/*" onChange={handleImageUpload} />} */}
        <div className="preview" id="HeatMapCanvas">
          <canvas id="drawerPoint">

          </canvas>

        </div>

        <Button variant="contained" id="clearButton" onClick={clearData}>Clear</Button>
        <Button variant="outlined" id="fillButton" onClick={complete}>Fill</Button>
        <Button variant="outlined" id="fillButton" onClick={new_poly}>New Zone</Button>
        <Button variant="outlined" id="fillButton" onClick={new_poly}>Peel Off Zone</Button>
      </div>

    ); //{image && <img className='imageclass' src={image} alt="Uploaded Image" />} 

  }


  // peel of line 
  const LineDrawer = () => {
    const [lines, setLines] = useState([]);
    const [startPoint, setStartPoint] = useState(null);
    const [endPoint, setEndPoint] = useState(null);
    const canvasRef = useRef(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw existing lines
      lines.forEach((line) => {
        ctx.beginPath();
        ctx.moveTo(line.start.x, line.start.y);
        ctx.lineTo(line.end.x, line.end.y);
        ctx.stroke();

        // Draw perpendicular line aligned to the center
        const dx = line.end.x - line.start.x;
        const dy = line.end.y - line.start.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const offsetX = (dy / length) * (length / 2);
        const offsetY = (-dx / length) * (length / 2);

        const perpendicularLineStart = {
          x: line.end.x + offsetX,
          y: line.end.y + offsetY,
        };
        const perpendicularLineEnd = {
          x: line.end.x - offsetX,
          y: line.end.y - offsetY,
        };

        ctx.beginPath();
        ctx.moveTo(perpendicularLineStart.x, perpendicularLineStart.y);
        ctx.lineTo(perpendicularLineEnd.x, perpendicularLineEnd.y);
        ctx.stroke();
      });



      // Draw current line
      if (startPoint && endPoint) {
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(endPoint.x, endPoint.y);
        ctx.stroke();
      }
    }, [lines, startPoint, endPoint]);

    const handleMouseDown = (event) => {
      const rect = event.target.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const point = { x, y };

      if (!startPoint) {
        setStartPoint(point);
      } else if (!endPoint) {
        setEndPoint(point);

        const newLine = {
          start: startPoint,
          end: point,
        };


        setLines((prevLines) => [...prevLines, newLine]);
      }
    };

    const handleClear = () => {
      if (setLines.length = 0) {
        console.log("Error");
      } else {
        setLines([]);
        setStartPoint(null);
        setEndPoint(null);
      }

    };

    return (
      <div>
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          style={{ border: "1px solid white" }}
          onMouseDown={handleMouseDown}
        ></canvas>
        <button onClick={handleClear}>Clear</button>
      </div>
    );
  };



  //Heat Map

  function HeatMapButton() {
    const [count, setCount] = useState(0); // Here u can change the code to run heatmap code


    async function handleClick() {

      setCount(state => state + 1);
      console.log({ date: fromDate.format('DD-MM-YYYY'), dwellTime: dwellTime, sliderStrength: strength, points: points })
      //const endpoint = getHeatMapendpoint('localhost', 5000, dates[cameraval], dwellTime[0] * 10000, dwellTime[1] * 10000, JSON.stringify(points), strength, tables[cameraval])
      const endpoint = getHeatMapendpoint('localhost', 5000, fromDate.format('DD-MM-YYYY'), dwellTime[0] * 10000, dwellTime[1] * 10000, JSON.stringify(points), 
                                            strength, tables[cameraval])
      //const endpoint = getHeatMapendpoint('localhost',5000,'27-04-2023','120000','130000',JSON.stringify(points), strength,'Heatmapstore')
      //const endpoint = getHeatMapendpoint('localhost',5000,'09-05-2023','35710','40513',points, strength,'Heatmapstore1')
      //const endpoint = getHeatMapendpoint('localhost',5000,'08-05-2023','182300','182400',points, strength,'Heatmapstore2')
      const success = await getheatmapdata(endpoint);
      data = success.heatmap_data;
      peelOf = success.peeloff_data;
      console.log({ heatmap_data: data, peelof_data: peelOf })

      console.log('before setData');
      heatmapInstance.setData({max:100,data:data});
      console.log('after setData');
      //BasicTable();

      // Update rows array with peelof data
      //const updatedRows = peelOf.map(item => createData(item.direction, item.desc, item.count, item.total, item.conversion));
      //rows.splice(0, rows.length, ...updatedRows);

      // Trigger re-render of BasicTable component
      setCount(state => state + 1);


    }
    return (
      <div>
        {/* <p> {count} </p> */}
        <Button variant="contained" onClick={handleClick}>Generate Heatmap</Button>

      </div>
    );
  }



  // Right Pannel 

  // Dwell Time Slider
  function MyRangeSlider() {
    const [value, setValue] = React.useState(dwellTime);

    const handleChange = (event, newValue) => {
      setValue(newValue);
      dwellTime = newValue;
      console.log(newValue);
    };

    return (
      <>
        <Box sx={{ width: 300 }}>
          <Slider
            value={value} //value [1,24] to be take as time
            onChange={handleChange}
            valueLabelDisplay="auto"
            min={0}
            max={24}
            step={1}
            marks={[
              { value: 0, label: '0' },
              { value: 3, label: '3' },
              { value: 6, label: '6' },
              { value: 9, label: '9' },
              { value: 12, label: '12' },
              { value: 15, label: '15' },
              { value: 18, label: '18' },
              { value: 21, label: '21' },
              { value: 24, label: '24' }
            ]}

          />
        </Box>
      </>
    );
  }

  //Strength Slider
  function StrengthSlider() {

    const onStrengthChange = (event, Newstrength) => {
      //console.log(Newstrength);
      strength = Newstrength;
      if (data.length > 0) {
        for (var i = 0; i < data.length; i++) {
          data[i].value = strength;
        }
        heatmapInstance.setData({ max: 100, data: data });
      }

    }



    return (
      <Box width={300}>
        <Slider

          onChange={onStrengthChange}
          defaultValue={50}

          valueLabelDisplay="auto" />
      </Box>
    );
  }

  // Dropdown Function
  function SelectSite() {
    const [site, setSite] = React.useState('');

    function handleChange(event) {
      setSite(event.target.value);
      siteval = event.target.value;
      console.log(siteval);
    }

    return (
      React.createElement(FormControl, { sx: { m: 1, minWidth: 120 }, size: "small" },
        React.createElement(InputLabel, { id: "demo-select-small-label" }, "Site"),
        React.createElement(Select, {
          labelId: "demo-select-small-label",
          id: "demo-select-small",
          value: site,
          label: "Site",
          onChange: handleChange
        },
          React.createElement(MenuItem, { value: 0 },
            React.createElement("em", null, "None")
          ),
          React.createElement(MenuItem, { value: 1 }, "Nike"),
          React.createElement(MenuItem, { value: 2 }, "Demo1"),
          React.createElement(MenuItem, { value: 3 }, "Demo2"),
          React.createElement(MenuItem, { value: 4 }, "Demo")
        )
      )
    );
  }

  function SelectCamera() {
    const [camera, setCamera] = React.useState('');

    function handleChange(event) {
      setCamera(event.target.value);
      cameraval = event.target.value;
      console.log({vlue:cameraval,image:images[cameraval]});
      clearData();
      var config = {
        container: document.getElementById('HeatMapCanvas'),
        radius: 20,
        maxOpacity: .8,
        minOpacity: 0,
        blur: .5,
        /*gradient: {
          // enter n keys between 0 and 1 here
          // for gradient color customization
          '.5': 'blue',
          '.8': 'red',
          '.95': 'white'
        }*/
      };
      var canvas = document.getElementById("HeatMapCanvas");
      canvas.style.backgroundImage = 'url(' + images[cameraval] + ')';
      canvas.style.width = "720p";
      canvas.style.height = "480px";
      canvas.style.objectFit = "contain"
      canvas.style.backgroundSize = "100%";
      heatmapInstance = h337.create(config);
      //var dataPoint = [{ x: 13, y: 10,value: 86 }];
      //heatmapInstance.addData(dataPoint);
      var drawerP = document.getElementById("drawerPoint");
      drawerP.width = "720";
      drawerP.height = "480";
      var ctx = drawerP.getContext('2d');
      ctx.beginPath();

      canvas.onclick = function (e) {
        var pointz = points[points.length - 1];
        var x = e.layerX;
        var y = e.layerY;
        //heatmapInstance.addData({ x: x, y: y, value: 100 });
        console.log([x, y]);
        pointz.push([x, y]);

        var drawerP = document.getElementById("drawerPoint");
        //drawerP.style.maxWidth="720px";
        //drawerP.style.maxHeight="480px";
        var ctx = drawerP.getContext('2d');
        if (pointz.length === 1) {
          ctx.beginPath();
          var dest = pointz[0]
          ctx.moveTo(dest[0], dest[1])
        }
        if (pointz.length > 1) {
          console.log({ pointz: pointz });
          //ctx.beginPath();
          //var dest=points[0]
          //ctx.moveTo(dest[0],dest[1])
          //for(var i = 0; i < points.length-1;i += 1){
          dest = pointz[pointz.length - 1]
          ctx.lineTo(dest[0], dest[1]);
          //}

          ctx.strokeStyle = "#7FFFD4";
          ctx.lineWidth = 5;
          ctx.stroke();
        }
        points[points.length - 1] = pointz;
      }; 
    }

    return (
      React.createElement(FormControl, { sx: { m: 1, minWidth: 120 }, size: "small" },
        React.createElement(InputLabel, { id: "demo-select-small-label" }, "Camera"),
        React.createElement(Select, {
          labelId: "demo-select-small-label",
          id: "demo-select-small",
          value: camera,
          label: "Camera",
          onChange: handleChange
        },
          React.createElement(MenuItem, { value: "" },
            React.createElement("em", null, "None")
          ),
          React.createElement(MenuItem, { value: 0 }, "CCTV1"),
          React.createElement(MenuItem, { value: 1 }, "CCTV2"),
          React.createElement(MenuItem, { value: 2 }, "CCTV3")
        )
      )
    );
  }


  //From Date Picker Function

  const [fromDate, setFromDate] = useState(dayjs());

  function FromDate() {
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>

        <DatePicker label="From" value={fromDate}
          onChange={(newValue) => setFromDate(state => newValue)} />
      </LocalizationProvider>
    );
  }

  const [toDate, setToDate] = useState(dayjs());

  function ToDate() {
    //const [value, setValue] = React.useState(dayjs());

    //console.log(toDate);
    //console.log(toDate.format('DD-MM-YYYY'));

    //Todate = value;

    //setToDate(toDate.format('DD-MM-YYYY'))

    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>

        <DatePicker label="To" value={toDate}
          onChange={(newValue) => setToDate(state => newValue)} />
      </LocalizationProvider>
    );
  }


  //Table Dynamic


  // Peel-off Data 



  function createData(direction, desc, count, total, conversion) {
    return { direction, desc, count, total, conversion };
  }
  const rows=[];
  var row_data = {
      Conversion: "None",
      Entered: {
          A: 0,
          B: 0,
          total: 0
      },
      Exited: {
          A: 0,
          B: 0,
          total: 0
      },
      Passerby: {
          AB: 0,
          BA: 0,
          total: 0
      }
  };
  

  function BasicTable() {
    var row_data=row_data_default;
    
    if(peelOf.Exited!=null){
      row_data=peelOf;
    }
    console.log({table_data: row_data ,peelof_data: peelOf});

    return (
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell colspan="2">Direction</TableCell>
            <TableCell rowspan="2">Desc</TableCell>
            <TableCell rowspan="2">Count</TableCell>
            <TableCell rowspan="2">Total</TableCell>
            <TableCell rowspan="2">Conversion</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>From</TableCell>
            <TableCell>To</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>A</TableCell>
            <TableCell>B</TableCell>
            <TableCell rowspan="2">Passed By</TableCell>
            <TableCell>{row_data.Passerby.AB}</TableCell>
            <TableCell rowspan="2">{row_data.Passerby.total}</TableCell>
            <TableCell rowspan="4">{row_data.Conversion}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>B</TableCell>
            <TableCell>A</TableCell>
            <TableCell>{row_data.Passerby.BA}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>A</TableCell>
            <TableCell>C</TableCell>
            <TableCell rowspan="2">Entered</TableCell>
            <TableCell>{row_data.Entered.A}</TableCell>
            <TableCell rowspan="2">{row_data.Entered.total}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>B</TableCell>
            <TableCell>C</TableCell>
            <TableCell>{row_data.Entered.B}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>C</TableCell>
            <TableCell>A</TableCell>
            <TableCell rowspan="2">Exited</TableCell>
            <TableCell>{row_data.Exited.A}</TableCell>
            <TableCell rowspan="2">{row_data.Exited.total}</TableCell>
            <TableCell rowspan="2"></TableCell>
          </TableRow>
          <TableRow>
            <TableCell>C</TableCell>
            <TableCell>B</TableCell>
            <TableCell>{row_data.Exited.B}</TableCell>
          </TableRow>
        </TableBody>
        </Table>
      </TableContainer>
    );
  }


  // Main Return

  return (

    //New Design
    <div className='HeatmapPage'>

      <div className='TopContainer'>
        <div className='TopContent'>
          <div className='Title'>
            <h2>Heat Map</h2>
          </div>
        </div>
        <div className='SelectSiteDropDown'>
          <SelectSite />
          <SelectCamera />
        </div>
      </div>

      <div className='MainContainer'>

        <div className='MainContent'>

          <div className='Canvas_Preview'>
            <UploadImage />
            {/* <LineDrawer /> */}
          </div>


          <div className='config_pannel'>


            <div className='date'>
              {/* FRom Date */}
              <div class="FromDate"><FromDate /></div>
              {/* To date */}
              <div class="Fromto"><ToDate /></div>
              {/* Heat Map Button */}
              <div className="GenHeat">
                <HeatMapButton />
              </div>
            </div>


            {/* Dwell Time  */}
            <div className='DwellTimeBox'>
              <div className='DwellTimeContent'>
                <div className='dwell_header'>
                  <p>Set Dwell Time in Min</p></div>
                <p className='right_dp'>Total Tracks </p>

                <MyRangeSlider />
                <p>Strength</p>
                <StrengthSlider />
              </div>
            </div>


            {/* Zone Selection Table */}
            <div className='ZoneTableArea'>
              <p>Selection Zone</p>
              <ZoneTablecontainer />
            </div>

            {/* Peel of Table */}

            <div className='PeelOfTableArea'>
              <p>Peel Of</p>
              <BasicTable />

            </div>




          </div>

        </div>
      </div>




    </div>

  );
}

export default Heatmap;
