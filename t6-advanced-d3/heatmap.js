////////////////////////////////////////////////////////////////////////////////
selectedOrder = 0;
function redrawMap(g, countries) {
    var margin = {top: 160, right: 0, bottom: 100, left: 160},
        width = 700,
        height = 700;

    var x = d3.scale.ordinal().rangeBands([0, width]),
        z = d3.scale.linear().domain([0, g.maxValue]).clamp(true),
        c = d3.scale.category10().domain(d3.range(10));

    d3.select("#content #map").remove();
    
    var svg = d3.select("#content").append("svg")
        .attr('id', 'map')
        .attr("width", width + margin.left)
        .attr("height", height + margin.top)
        //.style("margin-left", -margin.left + "px")
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
    var matrix = [];
    var nodes = countries;
    var n = nodes.length; 
    
    // Compute index per node.
    nodes.forEach(function(node, i) {
        node.index = i;
        node.count = 0;
        matrix[i] = d3.range(n).map(function(j) { return {x: j, y: i, z: 0}; });
    });
    
    // Convert links to matrix; count character occurrences.
    g.links.forEach(function(link) {
        ls = link.source.index
        lt = link.target.index
        matrix[ls][lt].z += link.value;
        matrix[lt][ls].z += link.value;
        matrix[ls][ls].z += link.value;
        matrix[lt][lt].z += link.value;
        nodes[ls].count += link.value;
        nodes[lt].count += link.value;
    });    
    
    // Precompute the orders.
    var orders = [
        d3.range(n).sort(function(a, b) { return d3.ascending(nodes[a].name, nodes[b].name); }),
        d3.range(n).sort(function(a, b) { return nodes[b].count - nodes[a].count; })
    ];    
    // The default sort order.
    x.domain(orders[selectedOrder]);
    
    svg.append("rect")
      .attr("class", "background")
      .attr("width", width)
      .attr("height", height);

    var row = svg.selectAll(".row")
      .data(matrix)
    .enter().append("g")
      .attr("class", "row")
      .attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
      .each(row);

    row.append("line")
      .attr("x2", width);

    row.append("text")
      .attr("x", -6)
      .attr("y", x.rangeBand() / 2)
      .attr("dy", ".32em")
      .attr("text-anchor", "end")
      .text(function(d, i) { return nodes[i].name; });

    var column = svg.selectAll(".column")
      .data(matrix)
    .enter().append("g")
      .attr("class", "column")
      .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });

    column.append("line")
      .attr("x1", -width);
      
    column.append("text")
      .attr("x", 6)
      .attr("y", x.rangeBand() / 2)
      .attr("dy", ".32em")
      .attr("text-anchor", "start")
      .text(function(d, i) { return nodes[i].name; });

    function row(row) {
        var cell = d3.select(this).selectAll(".cell")
            .data(row.filter(function(d) { return d.z; }))
          .enter().append("rect")
            .attr("class", "cell")
            .attr("x", function(d) { return x(d.x); })
            .attr("width", x.rangeBand())
            .attr("height", x.rangeBand())
            .style("fill-opacity", function(d) { return z(d.z); })
            .style("fill", '#f00')
    }

    function order() {
        x.domain(orders[selectedOrder]);

        var t = svg.transition().duration(2500);

        t.selectAll(".row")
            .delay(function(d, i) { return x(i) * 4; })
            .attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
          .selectAll(".cell")
            .delay(function(d) { return x(d.x) * 4; })
            .attr("x", function(d) { return x(d.x); });

        t.selectAll(".column")
            .delay(function(d, i) { return x(i) * 4; })
            .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });
        }

    // Threshold slider toolbar
    $("#toolbar #orderBox").jqxDropDownList({ 
        source: ['name', 'count'],
        selectedIndex: 0,
        width: 120,
        height: 20
        })
    .css('padding-top', '8px')
    .css('padding-left', '20px')
    .on('select', function(event) {
        selectedOrder = event.args.index;
        order();
    });    
}
