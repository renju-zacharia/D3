// Define SVG area dimensions
var svgWidth = 960;
var svgHeight = 500;

// Define the chart's margins as an object
var margin = {
  top: 60,
  right: 60,
  bottom: 60,
  left: 60
};

// Define dimensions of the chart area
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

// Select body, append SVG area to it, and set its dimensions
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append a group area, then set its margins
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Configure a parseTime function which will return a new Date object from a string
// var parseTime = d3.timeParse("%Y");
console.log(`My Test Message`);

// Load data 
d3.csv("/assets/data/data.csv").then(function(forceData,err) {
  if (err) return console.log(err);
  
  // Print the forceData
  console.log(`Printing Test Message`);
  console.log(forceData);
  
  // Format the date and cast the force value to a number
  forceData.forEach(function(data) {
    data.poverty = parseFloat(data.poverty);
    data.healthcare = parseFloat(data.healthcare);
  });

  // Configure a linear scale
  // d3.extent returns the an array containing the min and max values for the property specified
  var xTimeScale = d3.scaleLinear()
    // .domain(d3.extent(forceData, data => data.poverty))
    .domain([d3.min(forceData, d => d.poverty) * 0.8,  d3.max(forceData, d => d.poverty) * 1.2 ])
    .range([0, chartWidth])
    ;

  // Configure a linear scale with a range between the chartHeight and 0
  var yLinearScale = d3.scaleLinear()
    // .domain([0, d3.max(forceData, data => data.healthcare)])
    // .domain(d3.extent(forceData, data => data.healthcare))
    .domain([d3.min(forceData, d => d.healthcare) * 0.8, d3.max(forceData, d => d.healthcare) * 1.2 ])
    .range([chartHeight,0]);

  // Create two new functions passing the scales in as arguments
  // These will be used to create the chart's axes
  var bottomAxis = d3.axisBottom(xTimeScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // Step : Create Circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(forceData)
    .enter()
    .append("circle")
    .attr("cx", data => xTimeScale(data.poverty))
    .attr("cy", data => yLinearScale(data.healthcare))
    .attr("r", "9")
    .attr("fill", "skyblue")
    .attr("opacity", ".5");

  chartGroup.selectAll("text") 
  .data(forceData)
  .enter()
  .append("text") 
  .attr("font-size", "7px")
  .attr("x", function(d) {
    return xTimeScale(d.poverty - 0.1 ); 
  })
  .attr("y", function(d) {
    return yLinearScale(d.healthcare - 0.2);
  })
  .text(function(d) {
    return d.abbr;    
  });

  // Create Tooltip to show State, Poverty and Healthcare values  
  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([15, -15])
    .html(function(d) {
      // return (`${d.state}`);
      return (`<strong>${d.state}<strong><hr> Poverty : ${d.poverty} <hr> Healthcare : ${d.healthcare}`)
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data, this);
  })
  
  circlesGroup.on("mouseout", function(data, index) {
     toolTip.hide(data);
   });  

 // Append an SVG group element to the chartGroup, create the left axis inside of it
  chartGroup.append("g")
    .classed("axis", true)
    .call(leftAxis);

  // Append an SVG group element to the chartGroup, create the bottom axis inside of it
  // Translate the bottom axis to the bottom of the page
  chartGroup.append("g")
    .classed("axis", true)
    .attr("transform", `translate(0, ${chartHeight})`)
    .call(bottomAxis);

  // Create axes labels
  chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - (margin.left ) - 5 )
      .attr("x", 0 - (chartHeight /2) )
      .attr("dy", "1em")
      .attr("class", "axisText")
      .text("Lacks Healthcare (%)");

  chartGroup.append("text")
      .attr("transform", `translate(${(chartWidth - margin.left) / 2}, ${chartHeight + margin.top - 10 } )`)
      .attr("class", "axisText")
      .text("In Poverty (%)");      
});
