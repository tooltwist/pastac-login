'use strict';


angular.module('pastac-login', [])

.component('pastacLogin', {
  controller: PastacLoginController,
  controllerAs: 'ctrl',
  bindings: {
    // Bind parameters from the HTML element that invokes this
    initialName: '@',
    onDone: '&'
  },
  templateUrl: 'dist/pastac-login.html'
});


function PastacLoginController($scope) {
  var ctrl = this;

  // Set a default name in this component
  ctrl.hero = {
    name: 'Donkey'
  };

  // If we were given an initial-name="xxxx" in the HTML element
  // then use that name to replace our default initial name.
  ctrl.$onInit = function() {
    if (ctrl.initialName) {
	    ctrl.hero.name = ctrl.initialName;
    }
  };

  // The button has been pressed. Call the function specified
  // by on-done="myfunc(name)" in the HTML element that invokes
  // this component.
  ctrl.callOnDone = function() {
    ctrl.onDone({ name: ctrl.hero.name });
  };
}
