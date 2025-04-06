import React, { Component } from "react";
import "./App.css";
import FileUpload from "./FileUpload";
import * as d3 from "d3";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      selected_data: [],
      sentimentColors: { positive: "green", negative: "red", neutral: "gray" },
    };
  }
  componentDidMount() {
    this.renderChart();
  }
  componentDidUpdate() {
    this.renderChart();
  }
  set_data = (csv_data) => {
    this.setState({ data: csv_data });
  };
  renderChart = () => {
    var margin = { left: 50, right: 150, top: 10, bottom: 10 },
      width = 500,
      height = 300;
    var innerWidth = width - margin.left - margin.right;
    var innerHeight = height - margin.top - margin.bottom;
    if (this.state.data.length === 0) {
      return;
    }

    // Set dimensions for SVG
    const minDim1 = d3.min(this.state.data.map((d) => d["Dimension 1"]));
    const maxDim1 = d3.max(this.state.data.map((d) => d["Dimension 1"]));
    const minDim2 = d3.min(this.state.data.map((d) => d["Dimension 2"]));
    const maxDim2 = d3.max(this.state.data.map((d) => d["Dimension 2"]));
    d3.select("svg").attr("width", width).attr("height", height);
    // Linear Scale X
    var linearScaleX = d3
      .scaleLinear()
      .domain([minDim1, maxDim1])
      .range([margin.left, width - margin.right]);
    // Linear Scale Y
    var linearScaleY = d3
      .scaleLinear()
      .domain([minDim2, maxDim2])
      .range([margin.top, height - margin.bottom]);
    // Add circles
    d3.select("svg #scatterPlot")
      .selectAll("circle")
      .data(this.state.data)
      .join("circle")
      .attr("cx", (d) => linearScaleX(d["Dimension 1"]))
      .attr("cy", (d) => linearScaleY(d["Dimension 2"]))
      .attr("r", 6)
      .attr("fill", (d) => this.state.sentimentColors[d["PredictedSentiment"]]);
    // Add brush
    const brush = d3.brush().on("start brush", (e) => {
      const filtered = this.state.data.filter((d) => {
        return (
          linearScaleX(d["Dimension 1"]) >= e.selection[0][0] &&
          linearScaleX(d["Dimension 1"]) <= e.selection[1][0] &&
          linearScaleY(d["Dimension 2"]) >= e.selection[0][1] &&
          linearScaleY(d["Dimension 2"]) <= e.selection[1][1]
        );
      });
      this.setState({ selected_data: filtered });
    });
    d3.select("svg #scatterPlot").call(brush);
    // Add legend
    var bandScale = d3
      .scaleBand()
      .domain(["positive", "negative", "neutral"])
      .range([20, 100])
      .padding(0.1); // Space between bands
    d3.select("svg #legend")
      .selectAll("circle")
      .data(["positive", "negative", "neutral"])
      .join("circle")
      .attr("cx", width - 100)
      .attr("cy", (d) => bandScale(d))
      .attr("r", 6)
      .attr("fill", (d) => this.state.sentimentColors[d]);
    d3.select("svg #legend")
      .selectAll("text")
      .data(["positive", "negative", "neutral"])
      .join("text")
      .attr("x", width - 90)
      .attr("y", (d) => bandScale(d) + 4)
      .attr("text-anchor", "start")
      .text((d) => d);
  };
  render() {
    return (
      <div>
        <FileUpload set_data={this.set_data}></FileUpload>
        <div className="parent">
          <div className="child1 item">
            <h2>Projected Tweets</h2>
            <svg>
              <g id="scatterPlot"></g>
              <g id="legend"></g>
            </svg>
          </div>
          <div className="child2 item">
            <h2>Selected Tweets</h2>
            {this.state.selected_data.map((d) => (
              <div
                style={{
                  color: this.state.sentimentColors[d["PredictedSentiment"]],
                  marginBottom: "32px",
                }}
              >
                {d["Tweets"]}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
