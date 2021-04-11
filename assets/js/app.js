// My coode here

var width = parseInt(d3.select("#scatter").style("width"));
var height = width - width / 3.69;
var margin = 20;
var labelArea = 110;
var tPadBot = 40;
var tPadLeft = 40;

var svg = d3
    .select("#scatter")
    .append("svg")
    .style("background", "white")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "chart")

var circRadius;

function crGet() {
    if (width <= 530) {
        circRadius = 7
    } else {
        circRadius = 14
    }
}

crGet();

svg.append("g").attr("class", "xText");
var xText = d3.select(".xText");
xTextRefresh = () => {
    xText.attr(
        "transform",
        `translate(${((width - labelArea) / 2 + labelArea)},${(height - margin - tPadBot)})`
    );
};

xTextRefresh();

xText
    .append("text")
    .text("In Poverty (%)")
    .attr("y", -25)
    .attr("data-name", "poverty")
    .attr("data-axis", "x")
    .attr("class", "aText active x");
xText
    .append("text")
    .text("Age (Median)")
    .attr("y", 0)
    .attr("data-name", "age")
    .attr("data-axis", "x")
    .attr("class", "aText inactive x");
xText
    .append("text")
    .text("Household Income (Median)")
    .attr("y", 25)
    .attr("data-name", "income")
    .attr("data-axis", "x")
    .attr("class", "aText inactive x");

var leftTextX = margin + tPadLeft;
var leftTextY = (height + labelArea) / 2 - labelArea;

svg.append("g").attr("class", "yText");
var yText = d3.select(".yText");

function yTextRefresh() {
    yText.attr(
        "transform",
        `translate(${leftTextX}, ${leftTextY})rotate(-90)`
    );
};
yTextRefresh();

yText
    .append("text")
    .text("Obese (%)")
    .attr("y", -25)
    .attr("data-name", "obesity")
    .attr("data-axis", "y")
    .attr("class", "aText active y");
yText
    .append("text")
    .text("Smokes (%)")
    .attr("y", 0)
    .attr("data-name", "smokes")
    .attr("data-axis", "y")
    .attr("class", "aText inactive y");
yText
    .append("text")
    .text("Lacks Healthcare (%)")
    .attr("y", 25)
    .attr("data-name", "healthcare")
    .attr("data-axis", "y")
    .attr("class", "aText inactive y");

d3.csv("assets/data/data.csv").then(function(data) {
    var curX = "poverty";
    var curY = "obesity";
    var xMin;
    var xMax;
    var yMin;
    var yMax;

    var toolTip = d3
        .tip()
        .attr("class", "d3-tip")
        .html(d => {
            var theX;
            var theState = `<div>${d.state}</div>`;
            var theY = `<div>${curY}: ${d[curY]} %</div>`;
            if (curX === "poverty") {
                theX = `<div>${curX}: ${d[curX]}%</div>`;
            } else {
                theX = `<div>${curX}: ${parseFloat(d[curX]).toLocaleString("en")}</div>`;
            }
            return theState + theX + theY;
        });
    svg.call(toolTip);

    function xMinMax() {
        xMin = d3.min(data, d => parseFloat(d[curX]) * 0.9);
        xMax = d3.max(data, d => parseFloat(d[curX]) * 1.10);
    };

    function yMinMax() {
        yMin = d3.min(data, d => parseFloat(d[curY]) * 0.9);
        yMax = d3.max(data, d => parseFloat(d[curY]) * 1.10);
    };

    function labelChange(axis, clickedText) {
        d3
            .selectAll(".aText")
            .filter("." + axis)
            .classed("active", false)
            .classed("inactive", true)

        clickedText
            .classed("inactive", false)
            .classed("active", true)
    };

    xMinMax();
    yMinMax();

    var xScale = d3
        .scaleLinear()
        .domain([xMin, xMax])
        .range([margin + labelArea, width - margin]);
    var yScale = d3
        .scaleLinear()
        .domain([yMin, yMax])
        .range([height - margin - labelArea, margin]);

    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    function tickCount() {
        if (width <= 500) {
            xAxis.ticks(5);
            yAxis.ticks(5);
        } else {
            xAxis.ticks(10);
            yAxis.ticks(10);
        }
    }
    tickCount();

    svg
        .append("g")
        .call(xAxis)
        .attr("class", "xAxis")
        .attr("transform", `translate(0,${(height - margin - labelArea)})`);
    svg
        .append("g")
        .call(yAxis)
        .attr("class", "yAxis")
        .attr("transform", `translate(${(margin + labelArea)},0)`);

    var theCircles = svg.selectAll("g theCircles").data(data).enter();
    theCircles
        .append("circle")
        .attr("cx", d => xScale(d[curX]))
        .attr("cy", d => yScale(d[curY]))
        .attr("r", circRadius)
        .attr("class", d => `stateCircle ${d.abbr}`)
        .on("mouseover", function(d) {
            toolTip.show(d, this);
            d3.select(this).style("stroke", "#323232");
        })
        .on("mouseout", function(d) {
            toolTip.hide(d);
            d3.select(this).style("stroke", "#e3e3e3");
        });
    theCircles
        .append("text")
        .text(d => d.abbr)
        .attr("dx", d => xScale(d[curX]))
        .attr("dy", d => yScale(d[curY]) + circRadius / 2.5)
        .attr("font-size", circRadius)
        .attr("class", "stateText")
        .on("mouseover", d => {
            toolTip.show(d);
            d3.select(`.${d.abbr}`).style("stroke", "#323232");
        })
        .on("mouseout", d => {
            toolTip.hide(d);
            d3.select(`.${d.abbr}`).style("stroke", "#e3e3e3");
        });

    d3.selectAll(".aText").on("click", function() {
        var self = d3.select(this);
        if (self.classed("inactive")) {
            var axis = self.attr("data-axis");
            var name = self.attr("data-name");

            if (axis === "x") {
                curX = name;
                xMinMax();
                xScale.domain([xMin, xMax]);
                svg.select(".xAxis").transition().duration(300).call(xAxis);
                d3.selectAll("circle").each(function() {
                    d3
                        .select(this)
                        .transition()
                        .attr("cx", function(d) {
                            return xScale(d[curX]);
                        })
                        .duration(300);
                });

                d3.selectAll(".stateText").each(function() {
                    d3
                        .select(this)
                        .transition()
                        .attr("dx", function(d) {
                            return xScale(d[curX]);
                        })
                        .duration(300);
                });

                labelChange(axis, self);
            } else {
                curY = name;
                yMinMax();
                yScale.domain([yMin, yMax]);
                svg.select(".yAxis").transition().duration(300).call(yAxis);
                d3.selectAll("circle").each(function() {
                    d3
                        .select(this)
                        .transition()
                        .attr("cy", d => yScale(d[curY]))
                        .duration(300);
                });

                d3.selectAll(".stateText").each(function() {
                    d3
                        .select(this)
                        .transition()
                        .attr("dy", d => yScale(d[curY]) + circRadius / 3)
                        .duration(300);
                });

                labelChange(axis, self);
            }
        }
    });

    d3.select(window).on("resize", resize);

    function resize() {
        width = parseInt(d3.select("#scatter").style("width"));
        height = width - width / 3.9;
        leftTextY = (height + labelArea) / 2 - labelArea;
        svg.attr("width", width).attr("height", height);
        xScale.range([margin + labelArea, width - margin]);
        yScale.range([height - margin - labelArea, margin]);

        svg
            .select(".xAxis")
            .call(xAxis)
            .attr("transform", `translate(0,${height - margin - labelArea})`);

        svg.select(".yAxis").call(yAxis);
        tickCount();
        xTextRefresh();
        yTextRefresh();
        crGet();

        d3
            .selectAll("circle")
            .attr("cy", d => yScale(d[curY]))
            .attr("cx", d => xScale(d[curX]))
            .attr("r", circRadius);

        d3
            .selectAll(".stateText")
            .attr("dy", d => yScale(d[curY]) + circRadius / 3)
            .attr("dx", d => xScale(d[curX]))
            .attr("r", circRadius / 3);
    }
})
