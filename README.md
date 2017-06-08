# exampleComponent



## Getting Started
This module is treated as a standard Angular 1 component. To use it on an Angular page:

1. Download the component into your project

        bower install pastac-example-component --save

1. Include the component in your page

```html
        <script src="bower_components/jquery/dist/jquery.js" type="text/javascript"></script>  
        <script src="bower_components/angular/angular.min.js"></script>  
        <script src="bower_components/bootstrap/dist/js/bootstrap.js" type="text/javascript"></script>  
        <script src="bower_components/example-component.js" type="text/javascript"></script>  
```

1. Use the component in your HTML

```html
        <pastac-example-component initial-name="Turtle" on-done="sayHello(name)"></pastac-example-component>  
```

    or in the case of using Pug (previously called Jade)  

```html
        pastac-example-component(initial-name="Turtle" on-done="sayHello(name)")
```

1. Invoke the module in your Angular initialization

```html
        var module = angular.module('myApp', [ 'pastac-example-component' ]);
        ...
```


## Contributing
This project is built using Gulp.

- To get started, run `bower install` and `gulp install` to prepare the component for development.

- Clean up using `gulp clean`.
- To test the component using test/index.html run `gulp serve`.
- To run unit tests using Karma run `gulp test`.
- The `gulp testloop` command waits for files to change and re-runs these tests automatically.

See CONTRIBUTING.md for more details.
