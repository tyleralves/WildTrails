/**
 * Created by Tyler on 7/29/2016.
 */
function MainController(MapFactory, $timeout){
  var ctrl = this;
  ctrl.mapVisible = false;


  ctrl.mapResize = function(){
    console.log('controller resize');
    $timeout(function(){ MapFactory.initialize(); }, 1000);
  };
}

MainController.$inject = ['MapFactory', '$timeout'];

angular
  .module('app')
  .controller('MainController', MainController);