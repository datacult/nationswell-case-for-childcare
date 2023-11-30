
// Dimensions
const width = 1200
const height = 800

const side = 300;
let square = {
    x: (width - side) / 2,
    y: (height - side) / 2,
    side: side
};

let percent = 0.2

const hexSize = 10; // Size of the hexagons
const radius = hexSize / 2

const stroke = 1; // Stroke width

// Create the SVG container
var svg = d3.select("#grid").append("svg")
    .attr("width", width)
    .attr("height", height);

// Hexbin generator
var hexbin = d3.hexbin()
    .radius(hexSize)
    .extent([[0, 0], [width, height]]);

// Generate hexbin data
var points = [];
for (var i = 0; i < width; i += hexSize) {
    for (var j = 0; j < height; j += hexSize * 1.5) {
        points.push([i, j]);
    }
}

var squareX = (width - side) / 2;
var squareY = (height - side) / 2;

function overlap(circle) {

    // Check overlap with square
    let closestX = Math.max(square.x, Math.min(circle.x, square.x + square.side));
    let closestY = Math.max(square.y, Math.min(circle.y, square.y + square.side));
    let distanceX = circle.x - closestX;
    let distanceY = circle.y - closestY;
    let distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
    if (distanceSquared <= (radius * radius)) {
        return true;
    }

    // Check if circle is out of SVG bounds
    if (circle.x - radius - stroke < 0 || circle.x + radius + stroke > width ||
        circle.y - radius - stroke < 0 || circle.y + radius + stroke > height) {
        return true;
    }

    return false;
}

let binnedPoints = hexbin(points);

binnedPoints.forEach((d, i) => {
    d.random = Math.random()
});

let circles = svg
    .selectAll(".circle")
    .data(binnedPoints)
    .join("circle")
    .attr("class", "circle")
    .attr("r", radius)
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("fill", d => d.random <= percent ? "blue" : "LightGray") // 20% chance of being pink
    .attr("stroke", "#000")
    .attr("opacity", d => overlap(d) ? 0 : 1)
    .attr("stroke-width", stroke);

// Draw the square in the center
let rect = svg.append("rect")
    .attr("x", square.x)
    .attr("y", square.y)
    .attr("width", side)
    .attr("height", side)
    .attr("stroke", "#000")
    .attr("fill", "#EAEC7D");

let dragHandler = d3.drag()
    .on("drag", function (event) {

        square.x = event.x - 50;
        square.y = event.y - 50;

        d3.select(this)
            .attr("x", event.x - 50) // Adjust these values based on where you want the drag origin to be
            .attr("y", event.y - 50);

        circles
            .transition()
            .delay((d, i) => Math.random() * 1000)
            .duration(100)
            .attr("opacity", d => overlap(d) ? 0 : 1)

    });

dragHandler(rect);


function updatePercent(p) {
    circles
        .transition()
        .delay((d, i) => Math.random() * 2000)
        .duration(1000)
        .attr("fill", d => d.random <= p ? "blue" : "LightGray") // 20% chance of being pink
}

setTimeout(() => updatePercent(0.5), 3000)