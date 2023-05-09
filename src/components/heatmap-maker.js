import React, { useState } from 'react';
import './css/heatmap.css';
import h337 from 'heatmap.js';
// Added lib
import { Slider } from '@mui/material';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
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

import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useDemoData } from '@mui/x-data-grid-generator';

import dayjs, { Dayjs } from 'dayjs';

//Endpoint
import {getHeatMapendpoint, getheatmapdata} from './endpoint'

//Slider
import 'toolcool-range-slider';




var heatmapInstance;
var points=[];

//slide
var sliderStrength;

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
      var canvas=document.getElementById("HeatMapCanvas");
      canvas.style.backgroundImage = 'url(' + reader.result + ')';
      canvas.style.width="720p";
      canvas.style.height="480px";
      canvas.style.objectFit="contain"
      canvas.style.backgroundSize="100%";
      heatmapInstance = h337.create(config);
      //var dataPoint = [{ x: 13, y: 10,value: 86 }];
      //heatmapInstance.addData(dataPoint);
      console.log(reader);
      console.log(file);
      var drawerP=document.getElementById("drawerPoint");
        drawerP.width="720";
        drawerP.height="480";
        var ctx = drawerP.getContext('2d');
        ctx.beginPath();
      canvas.onclick = function(e) {
        var x = e.layerX;
        var y = e.layerY;
        //heatmapInstance.addData({ x: x, y: y, value: 100 });
        console.log([x,y]);
        points.push([x,y]);
        console.log(points);
        var drawerP=document.getElementById("drawerPoint");
        //drawerP.style.maxWidth="720px";
        //drawerP.style.maxHeight="480px";
        if(points.length===1){
          var ctx = drawerP.getContext('2d');
          ctx.beginPath();
          var dest=points[0]
          ctx.moveTo(dest[0],dest[1])
        }
        if(points.length>1){
          var ctx = drawerP.getContext('2d');
          //ctx.beginPath();
          //var dest=points[0]
          //ctx.moveTo(dest[0],dest[1])
          //for(var i = 0; i < points.length-1;i += 1){
            dest=points[points.length-1]
            ctx.lineTo(dest[0],dest[1]);
          //}
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 5;
          ctx.stroke();
        }
      };
    };

    reader.readAsDataURL(file);
  }
  function clearData (){
    points=[];
    console.log(points);
    var drawerP=document.getElementById("drawerPoint");
    var ctx = drawerP.getContext('2d');
    ctx.reset();
    heatmapInstance.setData({max:100,data:[{x:0,y:0,value:0}]});
    //heatmapInstance = h337.addData(config);
  }
  function complete (){
    if(points.length>2){
      var drawerP=document.getElementById("drawerPoint");
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

  return(
    <div>
     {/* <label>Upload Image</label><br/> */}
    <input className="imageuploadbutton" type="file" accept="image/*" onChange={handleImageUpload} />
    <div className="preview" id="HeatMapCanvas">
    <canvas id="drawerPoint">
    </canvas>
    </div>
      
      <Button variant="contained" id="clearButton" onClick={clearData}>Clear</Button>
      <Button variant="outlined" id="fillButton" onClick={complete}>Fill</Button>
      </div>

  ); //{image && <img className='imageclass' src={image} alt="Uploaded Image" />} 

  }
  


  function HeatMapButton() {
    const [count, setCount] = useState(0); // Here u can change the code to run heatmap code
    
  
    async function handleClick() {
     
        setCount(state => state + 1);
        var data={};
        const endpoint = getHeatMapendpoint('localhost',5000,'27-04-2023','120000','130000',points, strength,'Heatmapstore')
        //const endpoint = getHeatMapendpoint('localhost',5000,'09-05-2023','35710','40513',points, strength,'Heatmapstore1')
        //const endpoint = getHeatMapendpoint('localhost',5000,'08-05-2023','182300','182400',points, strength,'Heatmapstore2')
        const success = await getheatmapdata(endpoint);
        console.log({data:success})
        heatmapInstance.setData({max:100,data:success});
    }
    return (
      <div>
        {/* <p> {count} </p> */}
        <Button variant="contained" onClick={handleClick}>Generate Heatmap</Button>
      </div>
    );
  }

function UploadMetaFile() {
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState({ axis : [[0,0]] , person : 0, cameraId: '' });

  function handleFileChange(event) {
    let file = event.target.files[0];
    setFile(file);
    setMetadata({ axis: file.axis, person: file.person, cameraId: file.cameraId });
  }

  function handleSubmit(event) {
    event.preventDefault();

    let formData = new FormData();
    formData.append('file', file);

    // TODO: submit formData to server
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          <br/>
          <input className="metauploadbutton" type="file" onChange={handleFileChange} />
        </label>
        <button type="submit">Upload</button>
      </form>
      {file && (
        <div className='result'>
          <p>Axis: {metadata.axis}</p>
          <p>Person: {metadata.person} bytes</p>
          <p>Camera ID: {metadata.cameraId}</p>
        </div>
      )}
    </div>
  );
}


// Left Pannel 

// Dwell Time Slider
  function MyRangeSlider() {
    const [value, setValue] = React.useState([0, 24]);
  
    const handleChange = (event, newValue) => {
      setValue(newValue);
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
            { value: 0, label: '00' },
            { value: 3, label: '03' },
            { value: 6, label: '06' },
            { value: 9, label: '09' },
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



  const [strength, setStrength] = useState(20);

  const onStrengthChange = (e) =>{
    setStrength(state => e.target.value)
  }
  
  function StrengthSlider() {
    return (
      <Box width={300}>
        {/* <Slider
          size="small"
          defaultValue={70}
          aria-label="Small"
          valueLabelDisplay="auto"
        /> */}
        <Slider value={strength} onChange={onStrengthChange} defaultValue={50} aria-label="Default" valueLabelDisplay="auto" />
        
      </Box>
      
      
    );

   
    
  }

  // Dropdown Function
  function SelectSite() {
  const [site, setSite] = React.useState('');

  function handleChange(event) {
    setSite(event.target.value);
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
        React.createElement(MenuItem, { value: "" },
          React.createElement("em", null, "None")
        ),
        React.createElement(MenuItem, { value: 10 }, "Nike"),
        React.createElement(MenuItem, { value: 20 }, "Demo1"),
        React.createElement(MenuItem, { value: 30 }, "Demo2")
      )
    )
  );
}

function SelectCamera() {
  const [camera, setCamera] = React.useState('');

  function handleChange(event) {
    setCamera(event.target.value);
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
        React.createElement(MenuItem, { value: 10 }, "CCTV1"),
        React.createElement(MenuItem, { value: 20 }, "CCTV2"),
        React.createElement(MenuItem, { value: 30 }, "CCTV3")
      )
    )
  );
}


//From Date Picker Function


function FromDate() {
  
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <p>From</p>
      <DatePicker/>
    </LocalizationProvider>
  );
}

function ToDate() {
  
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <p>To</p>
      <DatePicker 
       />
    </LocalizationProvider>
  );
}


//Table
// function DataLog() {
//   const { data } = useDemoData({
//     dataSet: "none",
//     rowLength: 100,
//     maxColumns: 6,
//   });

//   return (
    
//     <div className='table' style={{ height: 400, width: "100%" }}>
//       <DataGrid {...data} slots={{ toolbar: GridToolbar }} />
//     </div>
//   );
// }




// Main Return

  return (
    <div id='fullcontainer'>
      {/* Left Container */}
    <div className='container left'>
      {/* Title */}
      <h3>Heat Map</h3>
      {/* DropDown */}
     <div className="selectcamera">
      <SelectSite /> 
      <SelectCamera />
      <UploadImage/>
      </div>
    </div>

    <div className='center'>

    </div>

    <div className='rightPannel right'>
    <div className='rightPannelContent'>
    <h3>Analysis Config</h3>
    <div className='date'>
    <div class="FromDate"><FromDate/></div>
    <div class="Fromto"><ToDate/></div>
    </div>
    <div className="RangeSlider">
     <p>Set Dwell Time in Min</p>
     <MyRangeSlider />
     <div className='SmallText'>
      <div>{sliderStrength}</div>
     <p>Total Tracks </p>
     <p>Total Dwell Points</p>
     </div>
     </div>
     <div className="StrengthSlider">
     <p>Strength</p>
     <StrengthSlider/>
     </div>
     {/* <div className='datalogtable'>
      <DataLog/>
      </div> */}
     <div className="GenHeat">
     <HeatMapButton/>
     </div>



    </div>
    
    </div>

    </div>
    
  );
}

export default Heatmap;
