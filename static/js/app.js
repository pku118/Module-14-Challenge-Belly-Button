// Set the url variable
const url = 'https://static.bc-edx.com/data/dl-1-2/m14/lms/starter/samples.json';

        // Fetch data and populate dropdown
        d3.json(url).then(data => {
            const dropdown = d3.select("#selDataset");
            data.names.forEach(id => {
                dropdown.append("option").attr("value", id).text(id);
            });
            // Initial call to update charts
            updateCharts(data.names[0]);
        });

        function updateCharts(selectedId) {
            d3.json(url).then(data => {
                // Update demographic info
                const metadata = data.metadata.filter(obj => obj.id == selectedId)[0];
                const sampleMetadata = d3.select("#sample-metadata");
                sampleMetadata.html("");
                Object.entries(metadata).forEach(([key, value]) => {
                    sampleMetadata.append("p").text(`${key}: ${value}`);
                });

                // Update bar chart
                const selectedData = data.samples.filter(sample => sample.id === selectedId)[0];
                const top10 = selectedData.sample_values.slice(0, 10).reverse();
                const otuIdsBar = selectedData.otu_ids.slice(0, 10).reverse().map(id => `OTU ${id}`);
                const otuLabels = selectedData.otu_labels.slice(0, 10).reverse();

                const margin = { top: 20, right: 5, bottom: 50, left: 150 };
                const width = 800 - margin.left - margin.right;
                const height = 500 - margin.top - margin.bottom;

                d3.select("#bar").html("");

                const svgBar = d3.select("#bar")
                    .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", `translate(${margin.left},${margin.top})`);

                const xBar = d3.scaleLinear()
                    .domain([0, d3.max(top10)])
                    .range([0, width]);

                const yBar = d3.scaleBand()
                    .domain(otuIdsBar)
                    .range([0, height])
                    .padding(0.1);

                svgBar.append("g")
                    .attr("transform", `translate(0,${height})`)
                    .call(d3.axisBottom(xBar))
                    .selectAll("text")
                    .style("text-anchor", "end")
                    .attr("dx", "-.8em")
                    .attr("dy", "-.55em")
                    .attr("transform", "rotate(-90)");

                svgBar.append("g")
                    .call(d3.axisLeft(yBar));

                svgBar.selectAll(".bar")
                    .data(top10)
                    .enter().append("rect")
                    .attr("class", "bar")
                    .attr("x", 0)
                    .attr("y", (d, i) => yBar(otuIdsBar[i]))
                    .attr("width", d => xBar(d))
                    .attr("height", yBar.bandwidth())
                    .attr("fill", "steelblue")
                    .append("title")
                    .text((d, i) => otuLabels[i]);

                // Update bubble chart
                const otuIdsBubble = selectedData.otu_ids;
                const sampleValuesBubble = selectedData.sample_values;
                const otuLabelsBubble = selectedData.otu_labels;

                d3.select("#bubble").html("");

                const svgBubble = d3.select("#bubble")
                    .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", `translate(${margin.left},${margin.top})`);

                const xBubble = d3.scaleLinear()
                    .domain([0, d3.max(otuIdsBubble)])
                    .range([0, width]);

                const yBubble = d3.scaleLinear()
                    .domain([0, d3.max(sampleValuesBubble)])
                    .range([height, 0]);

                const color = d3.scaleLinear()
                    .domain([0, d3.max(otuIdsBubble)])
                    .range(["red", "darkblue"]);

                const size = d3.scaleLinear()
                    .domain([0, d3.max(sampleValuesBubble)])
                    .range([5, 50]);
                    
                svgBubble.append("g")
                    .attr("transform", `translate(0,${height})`)
                    .call(d3.axisBottom(xBubble))
                    .selectAll("text")
                    .style("text-anchor", "end")
                    .attr("dx", "-.8em")
                    .attr("dy", "-.55em")
                    .attr("transform", "rotate(-90)");

                svgBubble.append("g")
                    .call(d3.axisLeft(yBubble));

                svgBubble.selectAll("circle")
                    .data(otuIdsBubble)
                    .enter()
                    .append("circle")
                    .attr("cx", d => xBubble(d))
                    .attr("cy", (d, i) => yBubble(sampleValuesBubble[i]))
                    .attr("r", (d, i) => size(sampleValuesBubble[i]))
                    .attr("fill", (d, i) => color(d))
                    .append("title")
                    .text((d, i) => otuLabelsBubble[i]);
            });
        }