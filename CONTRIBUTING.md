# Contributing

## Important notes
Please don't edit files in the `dist` subdirectory as they are generated via Gulp. You'll find source code in the `src` subdirectory!

### Code style
Regarding code style like indentation and whitespace, **follow the conventions you see used in the source already.**

### PhantomJS
While Gulp can run the included unit tests in Chrome and other browsers using [Karma](http://marka-runner.github.io), this shouldn't be considered a substitute for the real thing. Please be sure to test the `test/*.html` unit test file(s) in _actual_ browsers.

## Modifying the code
First, ensure that you have the latest [Node.js](http://nodejs.org/) and [npm](http://npmjs.org/) installed.

Test that Gulp's CLI and Bower are installed by running `gulp --version` and `bower --version`.  If the commands aren't found, run `npm install -g gulp-cli bower`.  For more information about installing the tools, see [gulpjs.com](http://gulpjs.com), [bower.io](http://bower.io/), and [The Karma project](https://karma-runner.github.io) respectively.

1. Fork and clone the repo.
1. Run `npm install` to install all build dependencies (including Gulp).
1. Run `bower install` to install the front-end dependencies.
1. Run `gulp` to build this project.

Assuming that you don't see any red, you're ready to go. Just be sure to run `gulp` after making any changes, to ensure that nothing is broken.

## Submitting pull requests

1. Create a new branch, please don't work in your `master` branch directly.
1. Run `gulp test` and confirm that the existing code passes all tests (it should!).
1. Run `gulp testloop` so tests are run automatically any time you change the code.
1. Make your changes to the code.
1. Add new unit test cases for any new functionality you add.
1. Repeat steps 3-5 until done.
1. Run `gulp clean install test` and confirm that the existing code still passes all tests.
1. Run `gulp serve` to see `tests/index.html` in an actual browser and check tests pass everywhere.
1. Update the documentation to reflect any changes.
1. Push to your fork and submit a pull request.

## Other links

- A complexity occurs when using Karma to test Angular components, where the template cannot be found. The
  solution is to use the _ng-html2js_ preprocessor, as described [here](http://busypeoples.github.io/post/testing-angularjs-directives/).

