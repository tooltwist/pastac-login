# The PastaC Example Component

This is an example of an "all the bells and whistles" Angular component, including:

- the component itself
- using Pug and Sass
- using Gulp during development and to deploy, including BrowserSync
- using bower and npm to download dependencies
- a test page
- using Karma for unit tests
- Documenting the styles with Sassdoc
- Documenting the component using Slate

## Creating a new Angular component aof PastaC
This component provides an example of an Angular component for PastaC \(or any other Angular project\).

It also forms a template that can be used to create other components. The gist
[here](https://gist.github.com/philcal/1c9d9ca8694eb662f525c8d503db6b4f) will
create an initial component for you. You can run it as...

    $ cd bower_components
    $ pastac-new-component.sh <myComponentName>
    
You can then immediately use the script. To run it standalone use:

    $ cd pastac-myComponentName
    $ gulp serve

This will show the test page and the component in a browser, and any changes
to the source will cause the page to be refreshed.

## Using this Example
This module is treated as a standard Angular 1 component. To use it on an Angular page:

1. Download the component into your project

        bower install pastac-example-component --save

1. Include the component in your page

```html
        <script src="bower_components/jquery/dist/jquery.js" type="text/javascript"></script>  
        <script src="bower_components/angular/angular.min.js"></script>  
        <script src="bower_components/bootstrap/dist/js/bootstrap.js" type="text/javascript"></script>  
        <script src="bower_components/pastac-example-component/dist/pastac-example-component.js" type="text/javascript"></script>  
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
To develop this component or create a derived component, clone the Github repository into the bower directory.

This project is built using Gulp.

- To get started, run `bower install` and `gulp install` to prepare the component for development.

- Clean up using `gulp clean`.
- To test the component using test/index.html run `gulp serve`.
- To run unit tests using Karma run `gulp test`.
- The `gulp testloop` command waits for files to change and re-runs these tests automatically.

See CONTRIBUTING.md for more details.
