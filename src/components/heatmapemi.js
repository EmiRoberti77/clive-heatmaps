import React, { useEffect, useState } from 'react';
//import './css/heatmap.css';
import h337 from 'heatmap.js';
import {getHeatMapendpoint, getheatmapdata} from './endpoint'

//import {getHeatMapendpoint, getheatmapdata} from './endpoint'

//var heatmapInstance;
//var points=[];

function Heatmapemi() {
  const clickButton = ()=> {
    var heatmapInstance = h337.create({
      // only container is required, the rest will be defaults
      container: document.querySelector('.App'),
    });
    // now generate some random data
    var points = [];
    var max = 0;
    var width = 700;
    var height = 400;
    var len = 600;

    while (len--) {
      var val = Math.floor(Math.random()*100);
      max = Math.max(max, val);
      var point = {
        x: Math.floor(Math.random()*width),
        y: Math.floor(Math.random()*height),
        //value: val
        value:10
      };
      points.push(point);
    }
    // heatmap data format
    var data = {
      max: max,
      data: points
    };
    // if you have a set of datapoints always use setData instead of addData
    // for data initialization
    console.log(data.data)
    const endpoint = getHeatMapendpoint('localhost',5000,'27-04-2023','120000','130000',[])
        getheatmapdata(endpoint)
        .then((succes)=>{
          console.log(succes)
          
            data = {
              max: 30,
              data: succes
            };
            //for(var i=0;i<3;i++){
            
            //heatmapInstance.addData(data); //[i]
            //}
        })
        .catch((err)=>{
          console.log(err)
        })
    console.log(data)
    heatmapInstance.setData(data);

  }
  //useEffect(() => {})
      
  return (
    <div className="App" height='500px'  width='500px'>
      <img src='https://0201.nccdn.net/4_2/000/000/008/486/2--2--1920x1280.jpg#RDAMDAID22628720' height={400} width={700} />
      <button id="button1" onClick={()=>{clickButton()}}></button>
    </div>
  );
}

export default Heatmapemi;