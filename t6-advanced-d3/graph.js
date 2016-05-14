$(document).ready(function() { 
    loadData(onDataLoaded);
});

////////////////////////////////////////////////////////////////////////////////
function onDataLoaded(data, countries, yrange) {
    var similarityFunction = similarityFunctions.authorCount;
    
    // This function refreshed the similarity graph and the heat map 
    function update(year, threshold) {
        // Recompute the similarity graph.
        var g = computeSimilarityGraph(
            data, countries, 
            year, year + 1, 
            similarityFunction, 
            threshold);
        
        // Get the list of countries that have at least one connection         
        var filteredCountries = countries.filter(function(d) { return d.value > 0;});
        redrawGraph(g, filteredCountries);
        redrawMap(g, countries);
    }
    
    // Create the user interface, passing the year range and the update function.
    // the update function will be called by the ui when the visualization
    // parameters change.
    createUi(yrange, update);
}

////////////////////////////////////////////////////////////////////////////////
function redrawGraph(g, countries) {
    var width = 960
    var height = 800;
    
    // Recreate the graph svg element
    d3.select("#content #graph").remove();
    var svg = d3.select("#content").append("svg")
        .attr('id', 'graph')
        .attr("width", width)
        .attr("height", height);
    
    // Create force graph layout
    var force = d3.layout.force()
        .charge(-500)
        .linkDistance(function(d) { return (1 - d.value / g.maxValue) * 400 + 100; })
        .size([width, height])
        .nodes(countries)
        .links(g.links);
            
    // Set the look of links
    var link = svg.selectAll(".link")
        .data(g.links)
        .enter().append("line")
            .style("stroke", "#333")
            .style("stroke-width", function(d) { return d.value; });
            
    // Create a drag behavior that we can attach to the graphical representation
    // of nodes. We use dragging to pin nodes to a dragged position
    var drag = force.drag()
        .on("dragstart", function(d) {
            d3.select(this).classed("fixed", d.fixed = true);
        });
      
    // Set the look and behavior of nodes.
    var node = svg.selectAll(".node")
        .data(countries)
        .enter().append("g")
            .attr("class", "node")
    
    node.append("circle")
            .attr("r", 25)
            .style("fill", "#f44");

    node.append("text")
        .text(function(d) { return d.name; });
        
    // Set the node behavior: on dragging pin the node position.
    // On double clicking, unpin the node.
    node.call(drag)
        .on("dblclick", function dblclick(d) {
            d3.select(this).classed("fixed", d.fixed = false);
        })
    
    // The on tick event handler links the graph simulation to our graphical 
    // representation of nodes and links. We get node positions from the simulation
    // and we update our svg nodes and lines.
    force.on("tick", function() {
        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });
            
        node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    });

    // Start computing layout!
    force.start();
}
