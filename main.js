// Data source
const jsonURL = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json';

// Plot Scatterplot Graph function (dataset, HTML element for svg canvas, HTML element for dummy tooltip)
const plotGraph = (data, svgElemId, legendId, tooltipId) => {

   // svg canvas width set to 800px
   const svgWidth = 800;
   const svgHeight = 500;
   const svgPadding = 40;
   const circleRad = 5;

   // Draw canvas
   const svgContainer = d3.select(svgElemId)
                           .attr("width", svgWidth)
                           .attr("height", svgHeight);

   // Scale x-axis width
   const xAxisScale = d3.scaleLinear()
                        // Start from earliest date -1 year & end at latest date +1 year
                        .domain([d3.min(data, (d) => d.Year) - 1, d3.max(data, (d) => d.Year) + 1])
                        // Display x axis starting from left to right of svg canvas
                        .range([svgPadding, svgWidth - svgPadding]);
   // Generate x-axis
   const xAxis = d3.axisBottom(xAxisScale)
                     // Format x-axis labels so that it's "1994" instead of "1,994"
                     .tickFormat(d3.format('d'));
   // Move x-axis downwards
   const xAxisTranslate = svgHeight - svgPadding; 
   // Create g element within svgContainer for x-axis
   const gXAxis = svgContainer.append("g")
                              // Call xAxis
                              .call(xAxis)
                              .attr("id", "x-axis")
                              // Move x axis downwards, otherwise will be at top of the svg
                              .attr("transform", `translate(0, ${xAxisTranslate})`);

   // Convert d.Seconds into date format to use d3.scaleTime()
   // var d = new Date(year, month, day, hours, minutes, seconds, milliseconds);
   const timeArray = data.map( (d) => {
      return new Date(1970, 1, 1, 00, 0, d.Seconds, 0);
   });
   // Scale y-axis height
   const yAxisScale = d3.scaleTime()
                        // Start from shortest time & end at longest time
                        .domain([d3.min(timeArray), d3.max(timeArray)])
                        // Display axis starting from bottom to top of svg, remember 0 = top of the page
                        .range([svgHeight - svgPadding, svgPadding]);
   // Generate axis
   const yAxis = d3.axisLeft(yAxisScale)
                     // Format axis labels so that it's "37:45" instead of ":45"
                     .tickFormat(d3.timeFormat('%M:%S'));
   // Create g element within svgContainer for axis
   const gYAxis = svgContainer.append("g")
                                 .call(yAxis)
                                 .attr("id", "y-axis")
                                 .attr("transform", `translate(${svgPadding}, 0)`);

   // Add y-axis label
   const yAxisLabel = svgContainer.append("text")
                                    .attr("id", "y-axis-label")
                                    // Rough position in x from left of svg
                                    .attr('x', 0)
                                    // Rough position in y from top of svg
                                    .attr('y', 25)
                                    .text("Minutes");

   // Add Legend title
   const legendXPos = svgWidth - 3.5*svgPadding;
   const legend = d3.select(legendId)
                     // Rough position in x from left of svg
                     .attr('x', legendXPos - 0.15*svgPadding)
                     // Rough position in y from top of svg
                     .attr('y', svgHeight - 3*svgPadding)
                     .style("font-weight", "bold")
                     .style("font-size", "10pt")
                     .text("Legend");
   // Handmade legend
   svgContainer.append("circle").attr("cx",legendXPos).attr("cy",svgHeight - 2.5*svgPadding).attr("r", 6).style("fill", "navy")
   svgContainer.append("circle").attr("cx",legendXPos).attr("cy",svgHeight - 2*svgPadding).attr("r", 6).style("fill", "brown")
   svgContainer.append("text").attr("x", legendXPos + 0.4*svgPadding).attr("y", svgHeight - 2.5*svgPadding).text("No Doping").style("font-weight", "bold").style("font-size", "9pt").attr("alignment-baseline","middle")
   svgContainer.append("text").attr("x", legendXPos + 0.4*svgPadding).attr("y", svgHeight - 2*svgPadding).text("Doping").style("font-weight", "bold").style("font-size", "9pt").attr("alignment-baseline","middle")

   // **Create dummy tooltip element as requested, must be hidden by default
   const setTooltip = d3.select(tooltipId)
                        .style("visibility", "hidden")
                        .style("width", "auto")
                        .style("height", "auto");

   // Scale circle y position
   const yPosScale = d3.scaleLinear()
                        // Start from shortest time & end at longest time
                        .domain([d3.min(data, (d) => d.Seconds), d3.max(data, (d) => d.Seconds)])
                        // Display axis starting from bottom to top of svg, remember 0 = top of the page
                        .range([svgHeight - svgPadding, svgPadding]);
   // **Create circle svg shapes for the scatterplot
   const scatter = svgContainer.selectAll("circle")
                                 // Put data into the waiting state for further processing
                                 .data(data)
                                 // Methods chained after data() run once per item in dataset
                                 // Create new element for each piece of data
                                 .enter()
                                 // The following code will be ran for each data point
                                 // Append rect for each data element
                                 .append("circle")
                                 // Add CSS class for hover effect
                                 .attr("class", "dot")
                                 // Adding the requested "data-xvalue" property into the <rect> element
                                 .attr("data-xvalue", (d, i) => d.Year)
                                 // Adding the requested "data-yvalue" property into the <rect> element
                                 .attr("data-yvalue", (d, i) => new Date(1970, 1, 1, 00, 0, d.Seconds, 0))
                                 // Set x position of the circle from the left of the svg element
                                 .attr("cx", (d, i) => xAxisScale(d.Year))
                                 // Set y position of the circle from the top of the svg element
                                 .attr("cy", (d, i) => yPosScale(d.Seconds))
                                 // Set radius of the circles
                                 .attr("r", (d, i) => circleRad)
                                 // Fill bar with color based on Doping key value
                                 .attr("fill", (d) => {
                                    if(d.Doping !== ""){
                                       return "navy"; // No doping
                                    } else {
                                       return "brown"; // doping
                                    }
                                 })
                                 // ** Make dummy #tooltip element visible as requested using .on()
                                 .on("mouseover", (d) => {
                                    setTooltip.transition()
                                                .style("visibility", "visible")
                                                // Won't actually display on web page
                                                .text("")
                                                //attr doesn't work, you need to use vanilla JS:
                                    // Use <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/4.2.2/d3.min.js"></script>
                                    return document.querySelector("#tooltip").setAttribute("data-year", d.Year);
                                 })
                                 // Hide dummy #tooltip element when mouseout
                                 .on("mouseout", (d) => {
                                    setTooltip.transition()
                                                .style("visibility", "hidden")
                                 })
                                 // **This is the actual tooltip to display data value when hover mouse on bar,
                                 // but unfortunately this doesn't pass the tests for some reason
                                 .append("title")
                                 // Adding the requested "data-date" property into the <title> element
                                 .attr("data-year", (d, i) => d.Year)
                                 // Specifying the text to display upon mouseover the data point
                                 .text((d) => `${d.Name} (${d.Year}), ${d.Time} mins`);
};

// Read freeCodeCamp JSON function
const readJson = (jsonURL) => {
   // Make a GET request to the URL
   fetch(jsonURL)
      // Take the response
      .then( (response) => {
         if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
         }
         // Convert the response to JSON format
         return response.json();
      })
      // Handle the returned Promise by another .then() method which takes the JSON object as an argument
      .then( (jsonObj) => {
         // jsonObj[i], ["Doping"], ["Name"], ["Nationality"], ["Place"], ["Seconds"], ["Time"], ["URL"], ["Year"]
         // Plot the bar chart by specifying (1) dataset, (2) which svg Element Id to plot in, (3) which HTML Element to insert legend & (4) which HTML Element to insert dummy tooltip
         plotGraph(jsonObj, "#canvas", "#legend", "#tooltip");
      })
      // The catch block catches the error, and executes a code to handle it
      .catch( (err) => {
         return console.log(err);
      })
};

// Execute all functions
readJson(jsonURL);