require('angular');
require('angular-socket-io');
global.jQuery = require('jquery')
var $ = global.jQuery
require('bootstrap')
var _ = require('lodash')

var app = angular.module('app', ['btford.socket-io'])

  .factory('mySocket', function (socketFactory) {
        return socketFactory();
    })

  .controller('MainController', function($scope,mySocket) {

    /**************************
      First Board: Temperature
    ***************************/

    mySocket.on('temperatura:valor', function(data){
      $scope.valorTemp = data;
    });

    mySocket.on('temperatura:inicial', function(data){
      $scope.valorTempInic = data;
    });

    mySocket.on('temperatura:led', function(data){

      var led;
      for	(led = 0; led < data.power.length; led++) {
        if(data.power[led] == true){
          console.log("#templed"+(led+1))
          $( "#templed"+(led+1) ).addClass( 'btn-danger' );
          $( "#templed"+(led+1) ).removeClass( 'btn-default' );
        }else{
          $( "#templed"+(led+1) ).addClass( 'btn-default' );
          $( "#templed"+(led+1) ).removeClass( 'btn-danger' );
        }
      }

    });

    /**************************
      Second Board: Light
    ***************************/

    mySocket.on('luz:array', function(data){
            console.log("act")

            var luz1, luz2, luz3;

            luz1 = mapValues( data.red, [ 0, 255 ], [ 0, 100 ] );
            $('#luzroja').css('width', luz1+'%').attr('aria-valuenow', luz1);

            luz2 = mapValues( data.green, [ 0, 255 ], [ 0, 100 ] );
            $('#luzverde').css('width', luz2+'%').attr('aria-valuenow', luz2);

            luz3 = mapValues( data.blue, [ 0, 255 ], [ 0, 100 ] );
            $('#luzazul').css('width', luz3+'%').attr('aria-valuenow', luz3);

      $scope.luz = data;
    });

    /**************************
      Third Board: Proximity
    ***************************/
    
    mySocket.on('prox:array', function(data){
      $scope.valorProx = data;

      var prox1, prox2;

      prox1 = mapValues( data.prox1, [ 0, 200 ], [ 0, 100 ] );
      $('#prox1').css('width', prox1+'%').attr('aria-valuenow', prox1);

      prox2 = mapValues( data.prox2, [ 0, 200 ], [ 0, 100 ] );
      $('#prox2').css('width', prox2+'%').attr('aria-valuenow', prox2);

    });


    $scope.tempReset = function () {
         mySocket.emit('temperatura:reset');
     };

})

var mapValues = function( value, r1, r2 ) {
    return ( value - r1[ 0 ] ) * ( r2[ 1 ] - r2[ 0 ] ) / ( r1[ 1 ] - r1[ 0 ] ) + r2[ 0 ];
}
