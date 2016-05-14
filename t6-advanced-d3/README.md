To run this example install **Node.js**

Then use npm to install this package dependencies and **http-server**. 
You can use http-server it to run a local web server.
```
> npm install
> npm install http-server -g
```

To start the http server: type `http-server` in this directory, then open a browser
to `localhost:8080`.

## Contents ##
- **transactins.csv**: a csv file containing the art transaction data
- **package.json**: the npm package description used by `npm install`
- **index.html**: the main html file
- **data.js**: functions for loading the source data and generating the similarity matrix
- **graph.js**: functions to generate the force directed graph
- **heatmap.js**: functions to generate the heatmap 


## Concepts ##

### d3.nest ###
See https://github.com/d3/d3/wiki/Arrays#nest
Nesting groups elements of an array into a tree structure. Each level in the tree
is defined through a **key function**. You can optionally specify a **rollup function**
that collapses all the elements contained in a leaf node generating some form of
summary.
