// These global variables allow us to take a look at intermediate data from the
// chrome developer tools. They are not needed for the application but are useful
// to figure out how it works.

// source csv data
csvData = null

// Data after nesting
data = null

// Similarity graph
graph = null

// Country name objects
countries = null

// min/max year
minYear = 3000
maxYear = 0

////////////////////////////////////////////////////////////////////////////////
function loadData(loadedCallback) {
    d3.csv("./transactions.csv", function(d) {
        csvData = d;
        data = nestData(d);
        countries = getCountries(data);
        
        loadedCallback(data, countries, [minYear, maxYear]);
    });
}

////////////////////////////////////////////////////////////////////////////////
function nestData(d) {
    // Define our nest operation
    var nestOperation = d3.nest()
        // Group data by country...
        .key(function(d) { return d['country']; })
        
        // ...then by year (aslo track min & max, we'll need them)...
        .key(function(d) { 
            y = parseInt((new Date(d['Event Date'])).getFullYear()); 
            minYear = d3.min([y, minYear]);
            maxYear = d3.max([y, maxYear]);
            return y; 
        })
        
        // ...sort entries for last key (year) in ascending order...
        .sortKeys(d3.ascending)
        
        // ...then group by artist name...
        .key(function(d) { return d['Artist Name']})
        
        // ...finally 
        .rollup(function(ts) {
            return {
                transactions: ts.length, 
                price: d3.sum(ts, function(d) { 
                    return parseFloat(d['Real Price Usd'].replace(',', ''));
                })
            };
        });
    
    // Apply the nest operation to the passed data
    // The returned data is a tree looking like this:
    // country
    // |
    // --year
    //   |
    //   --artist name
    //     - price of art sold for that year & country
    return nestOperation.map(d);
}

////////////////////////////////////////////////////////////////////////////////
function getCountries(d) {
    // This function will extract the list of countries from data generated by
    // the nestdata function
    function* extractCountries(d) { 
        i = 0
        for(v in d) {
            yield {id: v, name: v, index: i, value: 0}
            i += 1
        }
    }
            
    return Array.from(extractCountries(data))
}

////////////////////////////////////////////////////////////////////////////////
function computeSimilarityGraph(data, countries, minYr, maxYr, similarityFn, threshold) {
    // given the data tree geneated by nestData, we generate a graph whose edge
    // weights are the 'similarity' between two countries for a specified year range.
    // the similarity is computed using a passed similarity function. Edges whose
    // weight is below a certain threshold are discarded.
    var m = []
    var smMax = 0;

    for(c of countries) { c.value = 0; }
    
    // Iterate over countries
    for(i of d3.range(0, countries.length)) {
        c1n = countries[i];
        c1 = data[c1n.id];
        
        // Iterate again over countries starting from next after this one
        // (we don't want to compute similarity twice given two nodes)
        for(j of d3.range(i + 1, countries.length)) {
            c2n = countries[j];
            c2 = data[c2n.id];
            s = 0
            
            // Iterate over year range. if the year exists for both countries,
            // compute the similarity for that year and accumulate it in s.
            for(y of d3.range(minYr, maxYr)) {
                if(y in c1 && y in c2) {
                    s += similarityFn(c1[y], c2[y])
                } 
            }
            
            // Is s is above threshold, add an edge between the two countries.
            // Also add the edge value to the country objects. This is to have
            // an measure for each country that shows how much 'connected'
            // that country is, given a similarity function.
            if(s > threshold) {
                m.push({source: c1n, target: c2n, value: s});
                smMax = d3.max([s, smMax]);
                c1n.value += s;
                c2n.value += s;
            }
        }
    }
    
    graph = m;
    
    return {links: m, maxValue: smMax}
}

////////////////////////////////////////////////////////////////////////////////
similarityFunctions = {
    authorCount: function(c1, c2) {
        // If we have the same actor in both sets
        var s = 0
        for(a in c1) if(a in c2) s+= 1; //c1[a].price + c2[a].price;
        return s;
    }
}
