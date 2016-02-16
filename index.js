var express = require('express');
var app     = express();
var http    = require('http').Server(app);
var io      = require('socket.io')(http);
var five    = require("johnny-five");

// Static files
app.use(express.static(__dirname + '/public'));

// Config johnny-five
var ports = [
  { id: "temp", port: "/dev/tty.usbmodem14241" },
  { id: "luz", port: "/dev/tty.usbmodem14231" },
  { id: "prox", port: "/dev/tty.wchusbserial14220" }
];

// Boards connection
var board = new five.Boards(ports)
// Containers
var temperatura = {};
var luz = {};
var prox = {};

board.on("ready", function() {

  /**************************
    First Board: Temperature
  ***************************/

  // Init
  temperatura.led2 = new five.Led({
    pin: 2,
    board: this.byId('temp')
  });
  temperatura.led3 = new five.Led({
    pin: 3,
    board: this.byId('temp')
  });
  temperatura.led4 = new five.Led({
    pin: 4,
    board: this.byId('temp')
  });

  temperatura.tmp36 = new five.Thermometer({
    controller: "TMP36",
    freq: 50,
    board: this.byId('temp'),
    pin: "A0"
  });

  var tempmedia = 0;
  var cont = 0;
  temperatura.tempInicial;
  temperatura.reset = true;

  // On data update, take the average of 10 samples.
  temperatura.tmp36.on("data", function() {
    tempmedia = tempmedia + this.celsius;
    cont++;
    if(cont == 10){
      tempmedia = tempmedia/10
      io.sockets.emit('temperatura:valor', tempmedia.toFixed(2));

      if(temperatura.reset){
        temperatura.tempInicial = tempmedia.toFixed(2);
        io.sockets.emit('temperatura:inicial', temperatura.tempInicial);
        console.log('reset: ' + temperatura.tempInicial)
        temperatura.reset = false;
      }
      if(parseFloat(tempmedia) < parseFloat(temperatura.tempInicial) +2){
        temperatura.led2.off();
        temperatura.led3.off();
        temperatura.led4.off();
        io.sockets.emit('temperatura:led', {power: [false,false,false]});
      }else{
        if(parseFloat(tempmedia) < parseFloat(temperatura.tempInicial) +3){
          temperatura.led2.on();
          temperatura.led3.off();
          temperatura.led4.off();
          io.sockets.emit('temperatura:led', {power: [true,false,false]});
        }else{
          if(parseFloat(tempmedia) < parseFloat(temperatura.tempInicial) +4){
            temperatura.led2.on();
            temperatura.led3.on();
            temperatura.led4.off();
            io.sockets.emit('temperatura:led', {power: [true,true,false]});
          }else{
            if(parseFloat(tempmedia) < parseFloat(temperatura.tempInicial) +5){
              temperatura.led2.on();
              temperatura.led3.on();
              temperatura.led4.on();
              io.sockets.emit('temperatura:led', {power: [true,true,true]});
            }
          }
        }
      }
      //END
      tempmedia = 0;
      cont = 0;
    }
  });

  /**************************
    Second Board: Light
  ***************************/

  // Init
  luz.res1 = new five.Sensor({
    pin: "A0",
    board: this.byId('luz'),
    freq: 250
  });
  luz.res2 = new five.Sensor({
    pin: "A1",
    board: this.byId('luz'),
    freq: 250
  });
  luz.res3 = new five.Sensor({
    pin: "A2",
    board: this.byId('luz'),
    freq: 250
  });
  luz.led = new five.Led.RGB({
    board: this.byId('luz'),
      pins: {
        red: 11,
        green: 9,
        blue: 10
      }
    });

  // "data" get the current reading from the photoresistor
  luz.res1.scale(0, 255).on("data", function() {
    luz.res1value = this.value;
  });
  luz.res2.scale(0, 255).on("data", function() {
    luz.res2value = this.value;
  });

  //Use the update of the third sensor to send the data through the websocket
  luz.res3.scale(0, 255).on("data", function() {
    luz.res3value = this.value;
    luz.led.color({red: luz.res1value, blue: luz.res2value, green: luz.res3value})
    io.sockets.emit('luz:array', {red: luz.res1value, blue: luz.res2value, green: luz.res3value});
  });

  /**************************
    Third Board: Proximity
  ***************************/

  // Init
  prox.sens1 = new five.Proximity({
    controller: "HCSR04",
    board: this.byId('prox'),
    pin: 7
  });

  prox.sens2 = new five.Proximity({
    controller: "HCSR04",
    board: this.byId('prox'),
    pin: 4
  });

  // too much noise, calculate the average of 10 samples
  var proxmed1 = 0;
  var proxcont1 = 0;
  prox.sens1.on("data", function() {
    proxmed1 = proxmed1 + this.cm;
    proxcont1++;
    if(proxcont1 == 10){
      proxmed1 = proxmed1/10
      prox.sens1value = proxmed1
      proxcont1 = 0
      proxmed1 = 0
    }
  });

  // same average
  var proxmed2 = 0;
  var proxcont2 = 0;
  prox.sens2.on("data", function() {
    proxmed2 = proxmed2 + this.cm;
    proxcont2++;
    if(proxcont2 == 10){
      proxmed2 = proxmed2/10
      prox.sens2value = proxmed2
      io.sockets.emit('prox:array', {prox1: prox.sens1value.toFixed(2) ,prox2:prox.sens2value.toFixed(2)});
      proxcont2 = 0
      proxmed2 = 0
    }

  });

});

//Init of websocket connection
io.on('connection', function (socket) {
    console.log(socket.id);

    socket.on('temperatura:reset', function (data) {
      temperatura.reset = true;
    });

    socket.emit('temperatura:inicial', temperatura.tempInicial);
});

http.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
