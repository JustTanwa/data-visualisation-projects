import { useEffect, useState } from "react";
import data from "../AAPL.csv";

export default function Home() {
    const [appleData, setAppleData] = useState(null);

    // fetching data and processing data
    useEffect(() => {
        window.d3.csv(data).then(resData => {
            const data = resData.map(dailyData => ({
                date: new Date(dailyData.Date),
                open: +dailyData.Open,
                high: +dailyData.High,
                low: +dailyData.Low,
                close: +dailyData.Close,
                volume: +dailyData.Volume
            }))

            setAppleData(data);
        })
            .catch(err => console.log(err));
    }, [])

    useEffect(() => {
        function drawGraph() {

            const svg = window.d3.select(".graph");
            const width = 900;
            const height = 500;
            const padding = 50;

            const minDate = window.d3.min(appleData, d => d.date);
            const maxDate = window.d3.max(appleData, d => d.date);
            const minClose = window.d3.min(appleData, d => d.close);
            const maxClose = window.d3.max(appleData, d => d.close);
            
            // initialise svg 
            svg.attr("width", width)
                .attr("height", height)
                .style("background-color", "white");

            // setting up axis
            const xScale = window.d3.scaleTime()
                .domain([minDate, maxDate])
                .range([padding, width - padding]);
            const xAxis = window.d3.axisBottom()
                .scale(xScale);

            const yScale = window.d3.scaleLinear()
                .domain([minClose - 10, maxClose + 10])
                .range([height - padding, padding]);
            const yAxis = window.d3.axisRight()
                .scale(yScale);
            
            svg.append("g")
                .attr("id", "x-axis")
                .call(xAxis)
                .attr("transform", "translate(0, " + (height - padding) + ")");

            svg.append("g")
                .attr("id", "y-axis")
                .call(yAxis)
                .attr("transform", "translate(" + (width - padding) + ", 0)");

            // drawing price line with path
            svg.append("path")
                .datum(appleData)
                .attr("fill", "none")
                .attr("stroke", "#4ABDAC")
                .attr("stroke-width", "1.5")
                .attr("d", window.d3.line()
                    .x( d => xScale(d.date))
                    .y( d => yScale(d.close))
                    );
            
            const minVol = window.d3.min(appleData, d => d.volume);
            const maxVol = window.d3.max(appleData, d => d.volume);
            const volumeScale = window.d3.scaleLinear()
                .domain([minVol, maxVol])
                .range([height - padding, (height * 3 / 4) - padding]);
            console.log(minVol, maxVol)
            // plotting volume chart
            svg.selectAll("rect")
                .data(appleData)
                .enter()
                .append("rect")
                .attr("x", d => xScale(d.date))
                .attr("y", d => volumeScale(d.volume))
                .attr("width", 1)
                .attr("height", d => (height - padding) - volumeScale(d.volume))
                .style("fill", (d, i) => {
                    if (i === 0) return "green";
                    return appleData[i].close < appleData[i - 1].close ? "red" : "green";
                });
        }

        if (appleData) drawGraph();
    }, [appleData])
    return (
        <main className="landingpage">
            <h2>Things you can do with D3</h2>
            <p id="description">Data-Driven Document (D3) offers are great deal of functionality that allow you to bring data to life.</p>
            <div className="graph-container" >
                <p className="graph-title"></p>
                <div id="tooltip" style={{ padding: "0em 1em" }}></div>
                <svg className="graph"></svg>
            </div>
        </main>
    )
}