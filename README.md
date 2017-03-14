MSUXF - Making Sense's UX Development Framework
==============

After downloading the framework you should choose Gulp or Grunt as a task runner.

If you choose Gulp, delete Gruntfile.js, and all grunt related dependecies from package.json and then run:
```
npm install
```
This will install all the dependencies.

To build just run:
```
gulp run
```
This command will build the /dev folder and start a browsersync server and keep running in the background watching for changes.

==============

Other tasks:

```
gulp dist
```
To generate a minified and optimized version of the project.

```
gulp dist:zip
```
To generate a ZIP file from the /dist folder using a timestamp as naming

```
gulp doc
```
To generate the documentation

```
gulp doc:watch
```
To build and serve the documentation using browsersync, and watch for changes in sass.

```
gulp kraken
```
To optimize images using kraken.io API

==============

# SassDoc Documentation

We use SassDoc to generate our pretty documentation. This is a documentation system to build docs
parsing our code to grab specific comments and writing a styled HTML document with all our
*Variables*, *Mixins* and *Functions* detailed.

To run and watch SassDoc Documentation
```
gulp doc:watch
```
