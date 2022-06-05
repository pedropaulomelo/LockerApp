const { response } = require('express');
const express = require('express');
const res = require('express/lib/response');

const {SerialPort} = require("serialport");
//const {Readline} = require("@serialport/parser-readline");

const port = new SerialPort({path: "COM9", baudRate: 9600});

//const parser = new Readline();
//port.pipe(parser);


const app = express();

app.listen(3000, () => console.log('listening at 3000'));


//app.post('/status', async (request, response) => {
  //const data = request.body;
  //const comp = data.open;
  //port.write("status:"+comp);
  //console.log("status:"+comp);
  //parser.on("data", (line) => {
  //  const status = line;
  //  console.log(status);
  //  if(status === "open"){
  //    console.log("Já está aberto");
  //    } else {
  //      if(status === "close"){
  //        console.log("Abrindo...");
  //      }
  //    }
  //  });
  //}); 

app.post('/open', async (request, response) => {
  //console.log(request.body)
  //const comp = request.body.comp;
  port.write("o:1")
  //port.write("o:"+comp);
  //console.log("open:"+comp);
//  parser.on("data", (line) => {
//    const status = ""+line; 
//    console.log(status);
//  });
var status = "OK";
var data = {status}
response.json(data)
});

