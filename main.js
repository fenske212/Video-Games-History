let totalSales;
let bestSales;
let combinedBestSales = [];
let tooltip;
let colorRange;
//Set3 from https://observablehq.com/@d3/color-schemes
const colors = ["#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd", "#ccebc5", "#ffed6f"]

const sortedColors = [
    "#b3de69", // darker green
    "#80b1d3", // darker blue
    "#fccde5", // pink
    "#fdb462", // darker orange
    "#bebada", // purple
    "#bc80bd", // lavender
    "#ffed6f", // yellow
    "#ffffb3", // light yellow
    "#8dd3c7", // light blue
    "#ccebc5", // light green
    "#fb8072", // darker red
    "#d9d9d9"  // light grey
];

const genreColors = {
    "Sports": "#8dd3c7",
    "Platform": "#ffffb3",
    "Racing": "#bebada",
    "Role-Playing": "#fb8072",
    "Puzzle": "#80b1d3",
    "Misc": "#d9d9d9",
    "Shooter": "#b3de69",
    "Simulation": "#fccde5",
    "Action": "#fdb462",
    "Fighting": "#bc80bd",
    "Adventure": "#ccebc5",
    "Strategy": "#ffed6f"
}

const regionColors = {
    "North America": "#3E4772",
    "Europe": "#67bc78",
    "Japan": "#B31942",
    "Rest of World": "#E07C4F",
    "Global": "#957dad"
}


//data wrangling
document.addEventListener('DOMContentLoaded', function() {
    Promise.all([d3.csv('data/best-selling game consoles and their best-selling games.csv'), d3.csv('data/Video_Games_Sales_as_at_22_Dec_2016.csv'), 
                d3.csv('data/PS4_GamesSales.csv'), d3.csv('data/XboxOne_GameSales.csv')])
        .then(function(values){
            bestSales = values[0];
            totalSales = values[1];
            ps4Sales = values[2];
            xboxSales = values[3];

            //best sales dataset
            bestSales.map(function (d) {
                d["Year of Release (Game)"] = +d["Year of Release (Game)"];
                d["Units Sold (in millions)"] = +d["Units Sold (in millions)"];
            })

            //total sales dataset
            totalSales.map(function (d) {
                d.Critic_Count = +d.Critic_Count;
                d.Critic_Score = +d.Critic_Score;
                d.EU_Sales = +d.EU_Sales;
                d.JP_Sales = +d.JP_Sales;
                d.NA_Sales = +d.NA_Sales;
                d.Other_Sales = +d.Other_Sales;
                d.Global_Sales = +d.Global_Sales;
                d.User_Count = +d.User_Count;
                d.User_Score = +d.User_Score;
                d.Year_of_Release = +d.Year_of_Release;
            })

            let bestSalesAggregate = [];
            //combining best selling games and video game sales datasets
            for(let i = 0; i < bestSales.length; i++){
                if(totalSales.filter(d => d.Name === bestSales[i]["Most Sold Game"]).length > 0){
                    bestSalesAggregate.push(totalSales.filter(d => d.Name === bestSales[i]["Most Sold Game"]));
                }
            }

            for(let i = 0; i < bestSalesAggregate.length; i++){
                let tmp = {};
                if(bestSalesAggregate[i].length > 1){
                    tmp.Name = bestSalesAggregate[i][0].Name;
                    tmp.Year_of_Release = +d3.min(bestSalesAggregate[i], d => d.Year_of_Release)
                    tmp.EU_Sales = +d3.sum(bestSalesAggregate[i], d => d.EU_Sales).toFixed(2);
                    tmp.Global_Sales = +d3.sum(bestSalesAggregate[i], d => d.Global_Sales).toFixed(2);
                    tmp.JP_Sales = +d3.sum(bestSalesAggregate[i], d => d.JP_Sales).toFixed(2);
                    tmp.NA_Sales = +d3.sum(bestSalesAggregate[i], d => d.NA_Sales).toFixed(2);
                    tmp.Other_Sales = +d3.sum(bestSalesAggregate[i], d => d.Other_Sales).toFixed(2);
                    combinedBestSales.push(tmp);
                }
                else{
                    combinedBestSales.push(bestSalesAggregate[i][0])
                }
            }
            // draw graphs
            drawBarChart();
            drawLineChart();
            drawStackedAreaChart();
            drawPs4Chart();
            drawPieChart();
            getHeatMap(ps4Sales, xboxSales);
            scatterPie();
            getScatterplot()

            //scrolling functionality
            scroll();
        });
});

/*
Formatting outline:
 - if you are doing any data manipulation on the dataset variables (totalSales, bestSales), create a copy of them first
 - each graph gets its own function call
*/

/*
graph outline:
line graph displaying popularity of video games over time - x
Area chart to show the disparity between least and most popular games - x
Bar charts with most common video games by genre - x
Bubble chart to show most popular games globally
Pie chart to compare genre popularities
Map chart of the world
Innovative viz: scatterPie
*/

function drawBarChart() {
    //getting a list of genres and the amount for each
    let data = {};
    const selectedYear = document.getElementById("barYear").value;
    const parseSalesByYear = totalSales.filter(d => d.Year_of_Release == selectedYear)

    if (!document.getElementById("yearCheckbox").checked) {
        for (let i = 0; i < parseSalesByYear.length; i++) {
            if (data[parseSalesByYear[i].Genre] >= 1) {
                data[parseSalesByYear[i].Genre]++;
            }
            else {
                data[parseSalesByYear[i].Genre] = 1;
            }
        }
        delete data[""];
        delete data["2017"];
        delete data["2020"];
    }
    else{
        for (let i = 0; i < totalSales.length; i++) {
            if (data[totalSales[i].Genre] >= 1) {
                data[totalSales[i].Genre]++;
            }
            else {
                data[totalSales[i].Genre] = 1;
            }
        }
        delete data[""];
        delete data["2017"];
        delete data["2020"];
    }

    //making the data easier to work with
    data = Object.entries(data).map(([key, value]) => ({
        genre: key,
        count: value
    }));

    const svg = d3.select("#barChartSvg");

    const width = +svg.style('width').replace('px', '');
    const height = +svg.style('height').replace('px', '');

    const margin = { top: 30, bottom: 30, right: 30, left: 50 }
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    //clears the svg on every function call
    svg.select('g').remove();

    const g = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

    const maxVal = d3.max(data, d => d.count);

    const yScale = d3.scaleLinear()
        .domain([0, maxVal])
        .range([innerHeight, 0]);

    const xScale = d3.scaleBand()
        .padding([0.3])
        .domain(data.map(d => d.genre))
        .range([0, innerWidth]);

    const colorScale = d3.scaleOrdinal().range(colors);

    g.selectAll("bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.genre))
        .attr("y", d => yScale(d.count))
        .attr("width", xScale.bandwidth())
        .attr("height", d => innerHeight - yScale(d.count))
        .attr("fill", d => genreColors[d.genre] || "#000000")
        //.attr("fill", d => colorScale(d.genre))
        .attr("stroke", "black")
        .attr("stroke-width", "1px");

    const yAxis = d3.axisLeft(yScale);
    const xAxis = d3.axisBottom(xScale);

    g.append('g').call(yAxis);
    g.append('g').call(xAxis)
        .attr('transform', `translate(0, ${innerHeight})`);

    // Y-axis label
    g.append("text")
    .attr("transform", "rotate(-90)") 
    .attr("y", 0 - margin.left) 
    .attr("x", 0 - (height / 2)) 
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Number of Games Released"); 
}

function drawLineChart() {
    //getting a list of genres and the amount for each
    let data = {};
    for (let i = 0; i < totalSales.length; i++) {
        if (data[totalSales[i].Year_of_Release] >= 0) {
            data[totalSales[i].Year_of_Release] += totalSales[i].Global_Sales;
        }
        else {
            data[totalSales[i].Year_of_Release] = totalSales[i].Global_Sales;
        }
    }
    

    //dataset only goes to 2016
    delete data[NaN]
    delete data["2017"]
    delete data["2020"];

    data = Object.entries(data).map(([key, value]) => ({
        year: +key,
        count: value
    }));


    //logs the total sales for each year 
    //console.log("Yearly Sales Data:", data);

    const svg = d3.select("#lineChartSvg");

    const width = +svg.style('width').replace('px', '');
    const height = +svg.style('height').replace('px', '');

    const margin = { top: 30, bottom: 30, right: 30, left: 50 }
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    //clears the svg on every function call
    svg.select('g').remove();

    const g = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

    const xRange = d3.extent(data, d => d.year);
    const maxVal = d3.max(data, d => d.count)

    const yScale = d3.scaleLinear()
        .domain([0, maxVal])
        .range([innerHeight, 0]);

    const xScale = d3.scaleLinear()
        .domain(xRange)
        .range([0, innerWidth]);

    const line = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.count));

    svg.append("path")
        .attr("fill", "none")
        .attr("stroke", colors[4])
        .attr("stroke-width", 1.5)
        .attr("d", line(data))
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const yAxis = d3.axisLeft(yScale);
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));

    g.append('g').call(yAxis);
    g.append('g').call(xAxis)
        .attr('transform', `translate(0, ${innerHeight})`);

    g.append("text")
    .attr("transform", "rotate(-90)") 
    .attr("y", 0 - margin.left) 
    .attr("x", 0 - (height / 2)) 
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Global Sales (in millions)");
}

function drawStackedAreaChart() {
    // Filter out invalid data
    const validSales = totalSales.filter(d => !isNaN(d.Year_of_Release) && d.Year_of_Release);

    // Prepare data for stacked area chart
    let data = {};
    const genreKeys = Array.from(new Set(validSales.map(d => d.Genre))).filter(g => g);

    validSales.forEach(sale => {
        const year = +sale.Year_of_Release; // Ensure year is a number
        if (!data[year]) {
            data[year] = {};
            genreKeys.forEach(genre => data[year][genre] = 0);
        }
        data[year][sale.Genre] += sale.Global_Sales;
    });

    const stackedData = Object.keys(data).map(year => {
        const yearData = { year: year };
        genreKeys.forEach(genre => {
            yearData[genre] = data[year][genre] || 0;
        });
        return yearData;
    });

    // Stacked Area Chart: Checking if any year is NaN
    //console.log("Data for stackedAreaChart - Processed Stacked Data with Years: ", stackedData);

    // Set up scales and SVG dimensions
    const svg = d3.select("#stackedAreaChartSvg");
    const width = +svg.style('width').replace('px', '');
    const height = +svg.style('height').replace('px', '');
    const margin = { top: 30, bottom: 30, right: 30, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = d3.scaleLinear()
        .domain(d3.extent(stackedData, d => d.year))
        .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(stackedData, d => {
            let total = 0;
            genreKeys.forEach(genre => total += d[genre]);
            return total;
        })])
        .range([innerHeight, 0]);

    const colorScale = d3.scaleOrdinal().domain(genreKeys).range(colors);

    // Draw stacked area
    const area = d3.area()
        .x(d => xScale(d.data.year))
        .y0(d => yScale(d[0]))
        .y1(d => yScale(d[1]))
        .curve(d3.curveBasis);

    svg.select('g').remove();
    const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Stack the data
    const stack = d3.stack().keys(genreKeys);
    const layers = stack(stackedData);

    const tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

    // Draw paths
    g.selectAll('path')
        .data(layers)
        .enter()
        .append('path')
        .attr('class', d => 'area area-' + String(d.key).replace(/[^a-zA-Z0-9]/g, '')) // Convert genre to string and add class for each genre
        .attr('d', area)
        .attr("fill", d => genreColors[d.key] || "#000000")
        .attr('stroke', 'black')
        .on('mouseover', (event, d) => {
            tooltip.html(`Genre: ${d.key}`)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 10) + 'px')
                .transition()
                .duration(200)
                .style('opacity', 1)
                .style('background-color', genreColors[d.key]);
        })
        .on('mouseout', () => {
            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        });

    // Y-axis
    const yAxis = d3.axisLeft(yScale);
    g.append('g').call(yAxis);

    // Y-axis label (if we want)
    g.append("text")
        .attr("transform", "rotate(-90)") 
        .attr("y", 0 - margin.left) 
        .attr("x", 0 - (height / 2)) 
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Global Sales (in millions)"); 

    // X-axis
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));

    g.append('g').call(yAxis);
    g.append('g').call(xAxis)
        .attr('transform', `translate(0, ${innerHeight})`);

    // Legend styling pretty 
    const legendSize = 10;
    const legendSpace = 5;
    const legendX = innerWidth + margin.right - 70; // get dat legend on da right side

    // Legend Dots
    svg.selectAll("legendDots")
        .data(genreKeys)
        .enter()
        .append("rect")
        .attr("x", legendX)
        .attr("y", (d, i) => 10 + i * (legendSize + legendSpace))
        .attr("width", legendSize)
        .attr("height", legendSize)
        .style("fill", d => genreColors[d]);


    // Legend Labels
    svg.selectAll("legendLabels")
        .data(genreKeys)
        .enter()
        .append("text")
        .attr("x", legendX + legendSize * 1.5)
        .attr("y", (d, i) => 10 + i * (legendSize + legendSpace) + (legendSize / 2))
        .style("fill", "black")
        .style("font-size", "13px")
        .text(d => d)
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle");
}

function drawPs4Chart() {
    // data wrangling, getting total region sales
    let regions = ["North America", "Europe", "Japan", "Rest of World", "Global"];
    let ps4Data = { "North America": 0.0, "Europe": 0.0, "Japan": 0.0, "Rest of World": 0.0, "Global": 0.0 };
    let ps4Data1 = [0.0, 0.0, 0.0, 0.0, 0.0];
    for (let i = 0; i < ps4Sales.length; i++) {
        for (let j = 0; j < 5; j++) {
            ps4Data[regions[j]] += parseFloat(ps4Sales[i][regions[j]]);
            ps4Data1[j] += parseFloat(ps4Sales[i][regions[j]]);
        }
    }

    //making the data easier to work with
    ps4Data = Object.entries(ps4Data).map(([key, value]) => ({
        region: key,
        count: value
    }));

    const svg = d3.select("#ps4ChartSvg");

    const width = +svg.style('width').replace('px', '');
    const height = +svg.style('height').replace('px', '');

    const margin = { top: 30, bottom: 30, right: 30, left: 50 }
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    //clears the svg on every function call
    svg.select('g').remove();

    const g = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

    const maxVal = d3.max(ps4Data1);

    const yScale = d3.scaleLinear()
        .domain([0, maxVal])
        .range([innerHeight, 0]);

    const xScale = d3.scaleBand()
        .padding([0.3])
        .domain(regions)
        .range([0, innerWidth]);

    const colorScale = d3.scaleOrdinal().range(colors);

    g.selectAll("bar")
        .data(ps4Data)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.region))
        .attr("y", d => yScale(d.count))
        .attr("width", xScale.bandwidth())
        .attr("height", d => innerHeight - yScale(d.count))
        .attr("fill", d => regionColors[d.region] || "#000000")
        .attr("stroke", "black")
        .attr("stroke-width", "1px");

    const yAxis = d3.axisLeft(yScale);
    const xAxis = d3.axisBottom(xScale);

    g.append('g').call(yAxis);
    g.append('g').call(xAxis)
        .attr('transform', `translate(0, ${innerHeight})`);
    
    // Y-axis label (if we want)
    g.append("text")
    .attr("transform", "rotate(-90)") 
    .attr("y", 0 - margin.left) 
    .attr("x", 0 - (height / 2)) 
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Sales (in millions)"); 
}

function drawPieChart() {
    //getting a list of genres and the amount for each
    let data = {};
    const selectedYear = document.getElementById("pieYear").value;
    const parseSalesByYear = totalSales.filter(d => d.Year_of_Release == selectedYear)


    for (let i = 0; i < parseSalesByYear.length; i++) {
        if (data[parseSalesByYear[i].Genre] >= 1) {
            data[parseSalesByYear[i].Genre]++;
        }
        else {
            data[parseSalesByYear[i].Genre] = 1;
        }
    }
    delete data[""];

    //making the data easier to work with
    data = Object.entries(data).map(([key, value]) => ({
        genre: key,
        count: value
    }));

    const svg = d3.select("#pieChartSvg");

    const width = +svg.style('width').replace('px', '');
    const height = +svg.style('height').replace('px', '');

    const margin = { top: 30, bottom: 30, right: 30, left: 50 }
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const radius = Math.min(innerWidth, innerHeight) / 2


    colorRange = d3.scaleOrdinal()
        .domain(data.map(d => d.genre))
        .range(colors);

    //clears the svg on every function call
    svg.select('g').remove();

    const g = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')
        .attr("id", "piChartg");

    const pie = d3.pie().value(d => d.count)
    const organized_data = pie(data)

    tooltip = g
    .append("text")
    .attr("x", 0)
    .attr("y", 0)

    g.selectAll("slices")
        .data(organized_data, d => d.data.genre)
        .enter()
        .append("path")
        .attr("d", d3.arc()
            .innerRadius(0)
            .outerRadius(radius))
        //.attr("fill", d => colorRange(d.data.genre))
        .attr("fill", d => genreColors[d.data.genre] || "#000000")
        .attr("stroke", "black")
        .style("stroke-width", "1px")
        .attr('transform', 'translate(' + ((innerWidth / 2) -20) + ', ' + innerHeight / 2 + ')')
        .on('mouseover', function (d, i) {
            tooltip
                .style("opacity", "1")
                .html(`Number of Games Released: ${i.data.count}`);
        })
        .on("mouseout", function (d, i) {
            tooltip
                .style("opacity", "0")
                .style("left", "0px")
                .style("top", "0px");
        })

        let sorted_list = d3.sort(organized_data, (a,b) => d3.descending(a.data.count, b.data.count));

        //drawing legend
        g.selectAll("rect")
            .data(sorted_list)
            .enter()
            .append("rect")
            .attr("width", 20)
            .attr("height", 20)
            .attr("x", innerWidth - 90)
            .attr("y", (d, i) => innerHeight - 350 + i*25)
            //.attr("fill", d => colorRange(d.data.genre))
            .attr("fill", d => genreColors[d.data.genre] || "#000000")

        g.selectAll("labels")
            .data(sorted_list)
            .enter()
            .append("text")
            .attr("x", innerWidth - 65)
            .attr("y", (d,i) => innerHeight - 335 + i*25)
            .text(d => d.data.genre)
}

function updatePieChart() {
    //getting a list of genres and the amount for each
    let data = {};
    const selectedYear = document.getElementById("pieYear").value;
    const parseSalesByYear = totalSales.filter(d => d.Year_of_Release == selectedYear)

    const svg = d3.select("#pieChartSvg");

    const width = +svg.style('width').replace('px', '');
    const height = +svg.style('height').replace('px', '');

    const margin = { top: 30, bottom: 30, right: 30, left: 50 }
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const radius = Math.min(innerWidth, innerHeight) / 2

    //clears the svg on every function call
    svg.select('g').remove();

    const g = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')
        .attr("id", "piChartg");

    for (let i = 0; i < parseSalesByYear.length; i++) {
        if (data[parseSalesByYear[i].Genre] >= 1) {
            data[parseSalesByYear[i].Genre]++;
        }
        else {
            data[parseSalesByYear[i].Genre] = 1;
        }
    }
    delete data[""];

    //making the data easier to work with
    data = Object.entries(data).map(([key, value]) => ({
        genre: key,
        count: value
    }));

    const pie = d3.pie().value(d => d.count)
    const organized_data = pie(data)

    tooltip = g
    .append("text")
    .attr("x", 0)
    .attr("y", 0)


    g.selectAll("slices")
        .data(organized_data, d => d.data.genre)
        .enter()
        .append("path")
        .attr("d", d3.arc()
            .innerRadius(0)
            .outerRadius(radius))
        .attr("fill", d => genreColors[d.data.genre] || "#000000")
        .attr("stroke", "black")
        .style("stroke-width", "1px")
        .attr('transform', 'translate(' + ((innerWidth / 2) -20) + ', ' + innerHeight / 2 + ')')
        .on('mouseover', function (d, i) {
            tooltip
                .style("opacity", "1")
                .html(`Number of Games: ${i.data.count}`);
        })
        .on("mouseout", function (d, i) {
            tooltip
                .style("opacity", "0")
                .style("left", "0px")
                .style("top", "0px");
        })

        let sorted_list = d3.sort(organized_data, (a,b) => d3.descending(a.data.count, b.data.count));

        //drawing legend
        g.selectAll("rect")
            .data(sorted_list)
            .enter()
            .append("rect")
            .attr("width", 20)
            .attr("height", 20)
            .attr("x", innerWidth - 90)
            .attr("y", (d, i) => innerHeight - 350 + i*25)
            .attr("fill", d => genreColors[d.data.genre] || "#000000")


        g.selectAll("labels")
            .data(sorted_list)
            .enter()
            .append("text")
            .attr("x", innerWidth - 65)
            .attr("y", (d,i) => innerHeight - 335 + i*25)
            .text(d => d.data.genre)
}


////////Heat Map/////////

function processData(data) {
    const regions = ['North America', 'Europe', 'Japan', 'Rest of World'];
    const genres = ['Action', 'Shooter', 'Role-Playing', 'Racing', 'Sports', 'Adventure', 'Misc'];

    let aggregatedData = {};

    // Initialize the data structure for aggregation
    genres.forEach(genre => {
        regions.forEach(region => {
            let key = `${genre}:${region}`;
            aggregatedData[key] = {
                genre: genre,
                region: region,
                sales: 0
            };
        });
    });
    // Aggregate the sales data
    data.forEach(row => {
        regions.forEach(region => {
            let genre = row['Genre'];
            if (genres.includes(genre)) {
                let key = `${genre}:${region}`;
                aggregatedData[key].sales += +row[region] || 0;
            }
        });
    });
    return Object.values(aggregatedData);
}

function drawLegend(svg, colorScale, width, height) { //Right Legend for HeatMap
    const legendHeight = 200; 
    const legendWidth = 20; 
    const margin = { top: 20, right: 60, bottom: 20, left: 20 }; 

    const legend = svg.append("g")
        .attr("transform", `translate(${width + margin.left},${margin.top})`);

    const numColors = 10; 
    const range = colorScale.domain()[1] - colorScale.domain()[0];
    const step = range / numColors;

    const thresholds = Array.from(Array(numColors), (_, i) => colorScale.domain()[1] - i * step);

    const legendItem = legend.selectAll(".legend-item")
        .data(thresholds)
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0, ${i * legendHeight / numColors})`);

    legendItem.append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight / numColors)
        .style("fill", d => colorScale(d));

    legendItem.append("text")
        .attr("x", 25) // Offset from the rectangles
        .attr("y", (legendHeight / numColors) / 2)
        .attr("dy", "0.35em") 
        .text(d => `≥ ${Math.round(d)} mil`);

    legend.append("text")
        .attr("class", "legend-title")
        .attr("x", legendWidth / 2)
        .attr("y", -10)
        .style("text-anchor", "middle")
        .text("Sales");
}

// Event listener for the switch button
let ps4Sales, xboxSales;
let currentDataset = 'XboxOne';

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("console-switch-button").addEventListener("click", function() {
        currentDataset = currentDataset === 'XboxOne' ? 'PS4' : 'XboxOne';
        document.getElementById("console-indicator").textContent = `Current Console: ${currentDataset}`;
        getHeatMap(ps4Sales, xboxSales);
    });
});


function getHeatMap(ps4Sales, xboxSales) {

    const data = currentDataset === 'XboxOne' ? processData(ps4Sales) : processData(xboxSales);
    
    const genres = ['Action', 'Shooter', 'Role-Playing', 'Racing', 'Sports','Adventure','Misc']; 
    const regions = ['North America', 'Europe', 'Japan', 'Rest of World'];

    if (currentDataset === 'XboxOne' && !xboxSales) {
        console.error('Xbox sales data is not loaded yet.');
        return;
    } else if (currentDataset === 'PS4' && !ps4Sales) {
        console.error('PS4 sales data is not loaded yet.');
        return;
    }

    const margin = { top: 50, right: 95, bottom: 30, left: 90 }, 
          width = 575 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

    d3.select("#heatmapSVG").select("svg").remove()

    const svg = d3.select("#heatmapSVG")
                  .append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                  .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand() ///
                .rangeRound([0, width])
                .paddingInner(0.1)
                .align(0.1)
                .domain(genres);
    svg.append("g")
       .attr("transform", `translate(0,${height})`)
       .call(d3.axisBottom(x));

       const y = d3.scaleBand()
                .range([height, 0])
                .domain(regions)
                .padding(0.05);
    svg.append("g")
       .call(d3.axisLeft(y));

    // Color scale
    const maxSales = d3.max(data, d => d.sales);
    const myColor = d3.scaleSequential()
                      .interpolator(d3.interpolateInferno)
                      .domain([0, 30]); // domain scale of colors

    //pastel colors option to use, grey didnt look as good as it should so i have it as the default for now
//     const maxSales = d3.max(data, d => d.sales);
// const myColor = d3.scaleQuantize()
//                   .domain([0, maxSales])
//                   .range(sortedColors); // use the manually sorted colors

    svg.selectAll('rect')
       .data(data)
       .enter()
       .append('rect')
       .attr('x', function(d) { return x(d.genre); })
       .attr('y', function(d) { return y(d.region); })
       .attr('width', x.bandwidth())
       .attr('height', y.bandwidth())
       .style('fill', function(d) { return myColor(d.sales); });

       drawLegend(svg, myColor, width, height);
}

function scatterPie() {
    const svg = d3.select('#pieScatter').select('svg');
    const width = +svg.style('width').replace('px', '');
    const height = +svg.style('height').replace('px', '');
    const margin = { top: 30, right: 30, bottom: 30, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    //clears the svg on every function call
    svg.select('g').remove();

    const g = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

    const pieRadius = 10;  //the radius for the pie charts
    const color = d3.scaleOrdinal(colors);
    const pie = d3.pie().value(d => d.value);
    const arc = d3.arc().innerRadius(0).outerRadius(pieRadius);  // Use the radius here

    const xScale = d3.scalePoint()
                    .range([0, innerWidth])
                    .padding(0.5); // Use scalePoint for discrete values
    const yScale = d3.scaleLinear()
                    .range([innerHeight, 0]);

    // Filter and parse your data
    let maxSalesByYear = {};
    let combinedSales = combinedBestSales.filter(d => !isNaN(d.Year_of_Release) && d.Year_of_Release !== "N/A");
    combinedSales.forEach(d => {
        d.Year_of_Release = parseInt(d.Year_of_Release, 10);
        if (!maxSalesByYear[d.Year_of_Release] || maxSalesByYear[d.Year_of_Release].Global_Sales < d.Global_Sales) {
            maxSalesByYear[d.Year_of_Release] = d; //one data point a for every year shown - only showing highest sales $
        }
    });

    combinedSales = Object.values(maxSalesByYear);

    combinedSales.sort((a, b) => a.Year_of_Release - b.Year_of_Release); //easier for us to read if its ascending by year of release


    xScale.domain([...new Set(combinedSales.map(d => d.Year_of_Release))].sort(d3.ascending));
    yScale.domain([0, d3.max(combinedSales, d => d.Global_Sales)]);

    g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale));
    g.append('g')
        .call(d3.axisLeft(yScale));

    // Y-axis label (if we want)
    g.append("text")
    .attr("transform", "rotate(-90)") 
    .attr("y", 0 - margin.left) 
    .attr("x", 0 - (height / 2)) 
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Global Sales (in millions)"); 

    console.log("Filtered and Parsed Data:", combinedSales);

    const simulation = d3.forceSimulation(combinedSales)
        .force('x', d3.forceX(d => xScale(d.Year_of_Release)).strength(1))
        .force('y', d3.forceY(height / 2))
        .force('collide', d3.forceCollide(pieRadius + 1))
        .stop(); // Stop the simulation from running automatically

    console.log("Simulation Data:", combinedSales);

    const tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('padding', '5px')
    .style('border', '1px solid #ccc')
    .style('border-radius', '5px')
    .style('pointer-events', 'none')
    .style('font-size', '12px')
    .style('box-shadow', '0px 0px 10px rgba(0,0,0,0.5)');

    // Run the simulation forward to a stable state
    for (let i = 0; i < 120; i++) simulation.tick();

    combinedSales.forEach(function (d) {
        
        const xPosition = xScale(d.Year_of_Release);
        const yPosition = yScale(d.Global_Sales);
    
        const group = g.append('g')
            .attr('transform', `translate(${xPosition},${yPosition})`);

            const pieData = [
            { name: "North America", value: d.NA_Sales },
            { name: "Europe", value: d.EU_Sales },
            { name: "Japan", value: d.JP_Sales },
            { name: "Rest of World", value: d.Other_Sales }
        ];

        group.selectAll('.arc')
        .data(pie(pieData))
        .enter().append('path')
        .attr('class', 'arc')
        .attr('d', arc)
        .style('fill', function (p) { return regionColors[p.data.name]; })
        .on('mouseover', function(event, d) {
            d3.select(this.parentNode)
            .transition()
            .duration(100)
            .attr('transform', `translate(${xPosition},${yPosition}) scale(3)`) // Apply scale transformation when hoovering
            d3.select(this)             // Also enlarges the individual arc within the pie point 
                .transition()
                .duration(100)
                .attr('transform', 'scale(1.2)') //enlarge individ arc on pie point
            tooltip.transition()
                .duration(100)
                .style('opacity', 0.8)
                .style('background', regionColors[d.data.name])
                .style('color', 'white')
            tooltip.html(d.data.name + ": " + d.value + "M")
                .style('left', (event.pageX) + 'px')
                .style('top', (event.pageY - 28) + 'px')
        })
        .on('mouseout', function() {
            d3.select(this.parentNode)
                .transition()
                .duration(100)
                .attr('transform', `translate(${xPosition},${yPosition})`); // Reset transformation size
            d3.select(this)
                .transition()
                .duration(100)
                .attr('transform', '');
            tooltip.transition()
                .duration(100)
                .style('opacity', 0);
        });

        group.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '-2.5em')  
            .text(d.Name)
            .style('fill', '#000')
            .style('font-size', 5)
    });
}

let scatterplotRegion = "NA_Sales";
let colorStyle = "NA_Sales";
var removeOutliers = true;

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("scatterplotRegion").addEventListener("change", function() {
        d3.select("#scatterplotSVG").selectAll("*").remove();
        scatterplotRegion = document.getElementById('scatterplotRegion').value;
        getScatterplot();
    });
    document.getElementById("scatterplotColor").addEventListener("change", function() {
        d3.select("#scatterplotSVG").selectAll("*").remove();
        colorStyle = document.getElementById('scatterplotColor').value;
        getScatterplot();
    });
    document.getElementById("outliers").addEventListener("change", function() {
        d3.select("#scatterplotSVG").selectAll("*").remove();
        removeOutliers = document.getElementById('outliers').checked;
        getScatterplot();
    });
});

function getScatterplot() {

    // declare vars
    scatterplotRegion = scatterplotRegion;
    var scatterplotRegionName;
    var colorStyle = "Electromagnetic";
    var twoAxes = false;
    removeOutliers = removeOutliers;
    
    // map display ids
    switch (scatterplotRegion)
    {
        case "NA_Sales":
            scatterplotRegionName = "North American Sales";
            break;
        case "EU_Sales":
            scatterplotRegionName = "European Sales";
            break;
        case "JP_Sales":
            scatterplotRegionName = "Japanese Sales";
            break;
        case "Other_Sales":
            scatterplotRegionName = "Other Sales";
            break;
        default:
            scatterplotRegionName = "Global Sales";
            break;
    }

    // parse array to remove rows with 0 user score
    // also parse array to remove rows with 0 sales in selected region
    var userRatedRows = totalSales.filter(row => parseFloat(row["User_Score"]) !== 0 && parseFloat(row[scatterplotRegion]) !== 0);

    // remove outliers (checkbox)
    if(removeOutliers)
    {
        // remove region outliers
        switch (scatterplotRegion)
        {
            case "NA_Sales":
                userRatedRows = userRatedRows.filter(row => parseFloat(row["NA_Sales"]) !== 41.36);
                break;

            case "EU_Sales":
                userRatedRows = userRatedRows.filter(row => parseFloat(row["EU_Sales"]) !== 28.96);
                break;

            case "JP_Sales":
                userRatedRows = userRatedRows.filter(row => parseFloat(row["JP_Sales"]) !== 6.5 && parseFloat(row["JP_Sales"]) !== 5.33 && parseFloat(row["JP_Sales"]) !== 5.32);
                break;

            case "Other_Sales":
                userRatedRows = userRatedRows.filter(row => parseFloat(row["Other_Sales"]) !== 10.57 && parseFloat(row["Other_Sales"]) !== 8.45 && parseFloat(row["Other_Sales"]) !== 7.53);
                break;

            default:
                userRatedRows = userRatedRows.filter(row => parseFloat(row["Global_Sales"]) !== 82.53);
                break;             
        }
    }
    // create plot points
    var plotPoints = userRatedRows.map(row => ({ x: row["User_Score"], y: row[scatterplotRegion]}));

    // find x-min/x-max
    var userScore = userRatedRows.map(row => parseFloat(row["User_Score"]));
    var plotXMin = d3.min(userScore);
    var plotXMax = d3.max(userScore);

    // find y-min/y-max
    var regionSales = userRatedRows.map(row => parseFloat(row[scatterplotRegion]));
    var plotYMin = d3.min(regionSales);
    var plotYMax = d3.max(regionSales);

    // color scale
    colorStyle = document.getElementById('scatterplotColor').value;
    var colorScale;
    switch (colorStyle)
    {
        // electromagnetic
        case "Electromagnetic":
            colorScale = d3.scaleSequential(d3.interpolateViridis)
            .domain([plotYMin, plotYMax]);
            break;

        // inverted electromagnetic
        case "Reversed Electromagnetic":
            colorScale = d3.scaleSequential(d3.interpolateViridis)
            .domain([plotYMin, plotYMax])
            .nice(); // Nice the domain for better color representation
            // Invert the color scale
            colorScale = colorScale.copy().interpolator(d => d3.interpolateViridis(1 - d));
            break;
        
        // stoplight
        case "Stoplight":
            twoAxes = true;
            const maxValues = {
                x: d3.max(plotPoints, d => d.x),
                y: d3.max(plotPoints, d => d.y)
            };
            
            plotPoints.forEach(d => {
                d.weightedScore = (d.x / maxValues.x + d.y / maxValues.y) / 2; // Weighted average
            });
            
            // Set up color scale based on the weighted score
            colorScale = d3.scaleSequential(d3.interpolateRgb("red", "green"))
                .domain([0, 1, 2]); // Values between 0 and 1 for weighted average, 2 for max on both axes
            break;
    }

    // create svg
    const margin = { top: 50, right: 95, bottom: 30, left: 90 }, 
          width = 575 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;
    
    const svg = d3.select("#scatterplotSVG")
                  .append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                  .attr("transform", `translate(${margin.left},${margin.top})`);

    // create axes
    var xScale = d3.scaleLinear()
        .domain([plotXMin, plotXMax])
        .range([0, width]);

        svg.append("g")
        .attr("transform", "translate(0," + (height-30) + ")")
        .call(d3.axisBottom(xScale));

    var yScale = d3.scaleLinear()
        .domain([0, plotYMax])
        .range([height, 0]);

        svg.append("g")
        .attr("transform", "translate(0," + (-30) + ")")
        .call(d3.axisLeft(yScale));

    // add axes titles
    svg.append("text")
        .attr("transform", "translate(" + width / 2 + " ," + (height + 15) + ")")
        .style("text-anchor", "middle")
        .text("User Score");

    // Y-axis label
    svg.append("g")
        .append("text")
        .attr("transform", "rotate(-90)") // Rotate the text for vertical axis
        .attr("y", 0 - margin.left) // Position to the left of the axis
        .attr("x", 0 - ((height / 2)-25)) // Center the text by setting x position to half of height
        .attr("dy", "3em") // Offset position by 1em
        .style("text-anchor", "middle") // Anchor text in the middle for even distribution
        .text(scatterplotRegionName + " (in millions)"); // Text label

    // add plot points
    switch (twoAxes)
    {
        // one axis
        case false:
        svg.selectAll("circle")
            .data(plotPoints)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("cx", d => xScale(d.x))
            .attr("cy", d => yScale(d.y)-30)
            .attr("r", 2)
            .attr("fill", d => colorScale(d.y));
            break;
        
        // two axes
        case true:
        svg.selectAll("circle")
            .data(plotPoints)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("cx", d => xScale(d.x))
            .attr("cy", d => yScale(d.y)-30)
            .attr("r", 2)
            .attr("fill", d => colorScale(d.weightedScore));
            break;
    }
}   

function scroll() {
    d3.graphScroll()
        .graph(d3.selectAll(".graph"))
        .container(d3.selectAll(".charts"))
        .sections(d3.selectAll(".sections > div"))
}