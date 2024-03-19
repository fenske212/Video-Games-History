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
    // const myColor = d3.scaleSequential()
    //                   .interpolator(d3.interpolateInferno)
    //                   .domain([0, 30]); // domain scale of colors

    //pastel colors option to use, grey didnt look as good as it should so i have it as the default for now
    const myColor = d3.scaleQuantize()
                      .domain([0,30])
                      .range(colors); // using our pastel colors

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