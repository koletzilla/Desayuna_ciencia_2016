#Desayuno con la ciencia - 22/01/2016
- - -

![Alt text](docs/all.jpg?raw=true "Full Setup")

Desayuna con la ciencia (Breakfast with science) is an event that that took place at the Polytechnic School of Cáceres, University of Extremadura (Spain).

This proyect is just an one-day work with the objetive of to teach children how sensors and Arduino work. It uses a Raspberry Pi connected to 3 different Arduino Boards. The children can touch the sensors and see how the values changes and others things happens. it still has work to be done, I will improve the project for the next events.

It uses:

BackEnd:  NodeJS, johnny-five, Express and Socket.io.

FrontEnd: Angular, Angular-Socket-io, Bootstrap, Gulp and Browserify.

##### First Board: Temperature

![Alt text](docs/FirstOne.jpg?raw=true "First One")

The first board use a TMP36 sensor for temperature. It has three lights, theey will be turning on as the temperature rises.

##### Second Board: Light

![Alt text](docs/SecondOne.jpg?raw=true "Second One")

The second board has 3 photoresistors and a tricolor led. Each photoresistor controls one color of the led

##### Third Board: Proximity

![Alt text](docs/ThirdOne.jpg?raw=true "Third One")

The third board have two HCSR04 sensors. In the display we can see the distance en centimetres.

### Web

Its a simple AngularJS SPA with Bootstrap.

![Alt text](docs/web.png?raw=true "Third One")

### Installation

Be sure you have installed node, npm and gulp.

Npm manages all the dependences, no bower system is used here.

In index.js line 11, put the correct serial port for each board. You can look for it using:

`ls /dev/tty.*`

To start the server:

`npm start`

To develop in the frontEnd:

`gulp`

- All the js changes go on app/app.js file, Gulp will be watching for changes and will compile ir with the other dependences.
- The html and css go on the public folder.

#### TODO

There is still too much things to be done:

- Modularize index.js
- create functions for the repear code
- fix the gulp & browserify config
- Add support to uglify, sass...
- Modularize the Angular App
- And well, improve all the project
