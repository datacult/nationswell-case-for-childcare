// © 2023 Data Culture
// Released under the ISC license.
// https://studio.datacult.com/ 

'use strict'

let grid = ((selector = '#grid') => {

    // Dimensions
    const width = parseInt(d3.select(selector).style("width"))
    const height = width * 0.5

    const side = height * 0.6;

    let negativePadding = side * 0.02

    let square = {
        x: ((width - side) / 2),
        y: (height - (side * 0.9)) / 2,
        width: side,
        height: side * 0.9
    };

    let percent = 0.2

    const hexSize = 8; // Size of the hexagons
    const radius = hexSize / 2

    const stroke = 0; // Stroke width

    // Create the SVG container
    var svg = d3.select(selector).append("svg")
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
        let closestX = Math.max(square.x + (negativePadding / 2), Math.min(circle.x, square.x + square.width - (negativePadding / 2)));
        let closestY = Math.max(square.y + (negativePadding / 2), Math.min(circle.y, square.y + square.height - (negativePadding / 2)));

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
        .attr("fill", d => d.random <= percent ? "#FF8A53" : "#FFCFB8") // 20% chance of being pink
        .attr("stroke", "none")
        .attr("opacity", d => overlap(d) ? 0 : 1)
        .attr("stroke-width", stroke);

    // svg
    //     .append("rect")
    //     .attr("x", square.x + (negativePadding / 2))
    //     .attr("y", square.y + (negativePadding / 2))
    //     .attr("width", square.width - negativePadding)
    //     .attr("height", square.height - negativePadding)
    //     .attr("fill", "none")
    //     .attr("stroke", "black");

    let img = svg
        .append("image")
        .attr("xlink:href", "/assets/eddys-parents.svg")
        .attr("x", square.x)
        .attr("y", square.y)
        .attr("width", square.width)
        .attr("height", square.height)
        .call(
            d3.drag().on("drag", function (event) {

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

            })
        )


    function update(p) {
        circles
            .transition()
            .delay((d, i) => Math.random() * 2000)
            .duration(500)
            .attr("fill", d => d.random <= p ? "#FF8A53" : "#FFCFB8") // 20% chance of being pink
    }

    return {
        update: update,
    }

});