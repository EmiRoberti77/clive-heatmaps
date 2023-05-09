import React, { useState } from 'react';
import './css/heatmap.css';
import h337 from 'heatmap.js';
import {getHeatMapendpoint, getheatmapdata} from './endpoint'

var heatmapInstance;
var points=[];

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
        radius: 15,
        maxOpacity: .5,
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
      canvas.style.width="720px";
      canvas.style.height="480px";
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
        if(points.length==1){
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
     <label>Upload Image</label><br/>
    <input className="imageuploadbutton" type="file" accept="image/*" onChange={handleImageUpload} />
    <div className="preview" id="HeatMapCanvas">
    <canvas id="drawerPoint">
    </canvas>
    </div>
      
      <button id="clearButton" onClick={clearData}>Clear</button>
      <button id="fillButton" onClick={complete}>Fill</button>
      </div>

  ); //{image && <img className='imageclass' src={image} alt="Uploaded Image" />} 

  }

  function HeatMapButton() {
    const [count, setCount] = useState(0); // Here u can change the code to run heatmap code
    
  
    function handleClick() {
      setCount(state => state + 1);
     
      const endpoint = getHeatMapendpoint('localhost',5000,'12-12-2023','9000','11000',points)
      getheatmapdata(endpoint)
      .then((succes)=>{
        console.log(succes)
        for(var i=0;i<3;i++){
          heatmapInstance.addData(succes); //[i]
          }
      })
      .catch((err)=>{
        console.log(err)
      })
      
    }
    return (
      <div>
        <p> {count} </p>
        <button onClick={handleClick}>Generate Heatmap</button>
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
          Upload Metadata<br/>
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
  


  return (
    <div className='container'>
      <h3>Heatmap</h3>
      <UploadImage/>
      <div className="metaUpload">
      <UploadMetaFile />
      </div>
      <br></br>
      <HeatMapButton className="GenHeat"/>
    </div>
    
  );
}

export default Heatmap;