/**
 * Created by Tyler on 7/29/2016.
 */
angular
  .module('app')
  .config(function($stateProvider, $urlRouterProvider){
    $stateProvider.state('home', {
      url: '/',
      template: '<home></home>'
    })
    .state('map', {
      url: '/map',
      template: '<map></map>'
    });
    $urlRouterProvider.otherwise('/');
  });