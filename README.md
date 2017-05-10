# exampleComponent



## Getting Started

Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/philcal/jquery-example-component/master/dist/angular-example-component.min.js
[max]: https://raw.github.com/philcal/jquery-example-component/master/dist/angular-example-component.js

In your web page:

```html
<script src="angular.js"></script>
<script src="dist/example-component.min.js"></script>


<pastac-example-component></pastac-example-component>
```

## Documentation
This module is treated as a standard Angular 1 component. To use it on an Angular page:

1. Download the component into your project

        bower install pastac-example-component --save

1. Include the component in your page

        <script src="bower_components/jquery/dist/jquery.js" type="text/javascript"></script>  
        <script src="bower_components/angular/angular.min.js"></script>  
        <script src="bower_components/bootstrap/dist/js/bootstrap.js" type="text/javascript"></script>  
        <script src="bower_componenets/example-component.js" type="text/javascript"></script>  

1. Use the component in your HTML

        <pastac-example-component initial-name="Turtle" on-done="sayHello(name)"></pastac-example-component>  

    or in the case of using Pug (previously called Jade)  

        pastac-example-component(initial-name="Turtle" on-done="sayHello(name)")

1. Invoke the module in your Angular initialization

        var module = angular.module('myApp', [ 'pastac-example-component' ]);
        ...

## Component Attributes

#### initial-name [optional]
The value for name initially displayed in the input box.

#### on-done [optional]
This should be the name of a function defined within the scope of your application, which
takes a single parameter, which must be specifed as `name` in the HTML tag.

    $scope.giveGreeting = function(name) {
      alert('Hello ' + name);
    };

## Styling
The styles used in this component are documented [here](https://tooltwist.github.io/pastac-example-component/) - feel free to override them with your own stylesheet.

## Contributing
This project is built using Gulp. You can build using `gulp install`, clean up using `gulp clean`,
interact with the component (see test/index.html) using `gulp serve`, and
run unit tests using Karma run `gulp test`.

The `gulp testloop` command re-runs the unit tests any time source files are changed.

See CONTRIBUTING.md for more details.
