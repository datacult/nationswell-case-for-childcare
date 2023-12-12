// © 2023 Data Culture
// Released under the ISC license.
// https://studio.datacult.com/ 

'use strict'

let flowers = ((data, map, options) => {

  ////////////////////////////////////////
  /////////////// Defaults ///////////////
  ////////////////////////////////////////

  let mapping = {
    selector: '#flowers',
    group: "group",
    value: "value",
    color: "color",
    sort: "sort",
    order: []
  }

  map = { ...mapping, ...map };

  let defaults = {
    width: 800,
    height: 800,
    transition: 500,
    delay: 100,
    edge_radius: 0.1,
    padding: 2,
    size: 0,
    stroke: "#FFE4D7"
  }

  options = { ...defaults, ...options };

  ////////////////////////////////////////
  //////////// Data Sorting //////////////
  ////////////////////////////////////////

  // sort data
  data = data.sort((a, b) => {
    let indexA = map.order.indexOf(a[map.sort]);
    let indexB = map.order.indexOf(b[map.sort]);

    if (indexA > indexB) {
      return 1;
    }
    if (indexA < indexB) {
      return -1;
    }
    return 0;
  });

  let groups = Array.from(new Set(data.map(d => d[map.group])));


  ////////////////////////////////////////
  ////////////// SVG Setup ///////////////
  ////////////////////////////////////////

  const diamondsDiv = d3.select(map.selector);

  const container = diamondsDiv.append('div')
    .classed('diamond-svg-container', true);

  const svg = container.append('svg')
    .attr('width', '100%') // Responsive width
    .attr('height', '100%') // Responsive height
    .attr('viewBox', `0 0 ${options.width} ${options.height}`)
    .classed('diamond-svg', true);

  ////////////////////////////////////////
  ////////////// Helpers /////////////////
  ////////////////////////////////////////

  const centerX = options.width / 2;
  const centerY = options.height / 2;

  const calcSideLength = (sideLength, percentage) => {
    return Math.sqrt((percentage / 100) * (sideLength * sideLength));
  }

  function calculateCoordinates(xCenter, yCenter, radius, degrees) {
    var radians = degrees * Math.PI / 180;
    var x = xCenter + radius * Math.cos(radians);
    var y = yCenter + radius * Math.sin(radians);
    return { x, y };
  }


  ////////////////////////////////////////
  ////////////// DOM Setup ///////////////
  ////////////////////////////////////////

  let flower_shapes = svg
    .selectAll('.petal')
    .data(data)
    .join('rect')
    .attr('x', options.padding)
    .attr('y', options.padding)
    .attr('width', d => calcSideLength(options.size, d[map.value]))
    .attr('height', d => calcSideLength(options.size, d[map.value]))
    .attr('rx', d => calcSideLength(options.size, d[map.value]) * options.edge_radius)
    .attr('ry', d => calcSideLength(options.size, d[map.value]) * options.edge_radius)
    .attr('transform-origin', 'top left')
    .attr('transform', (d, i) => `translate(${(centerX)},${(centerY)}) rotate(${45 + ((360 / groups.length) * (i + 2))})`)
    .attr('fill', d => d[map.color])
    .attr('stroke', options.stroke)
    .classed('petal', true);

  let flower_label = svg
    .selectAll('flower-label')
    .data(groups)
    .join('text')
    .attr('x', (d, i) => calculateCoordinates(centerX, centerY, options.size * 2, (45 + (360 / groups.length) * (i + 2))).x)
    .attr('y', (d, i) => calculateCoordinates(centerX, centerY, options.size * 2, (45 + (360 / groups.length) * (i + 2))).y)
    .attr('text-anchor', 'middle')
    .attr('font-weight', 'bold')
    .attr('dominant-baseline', 'central')
    .attr('fill', "black")
    .attr('opacity', 0)
    .text(d => d)
    .classed('flower-label', true);
    

  ////////////////////////////////////////
  ////////////// Update //////////////////
  ////////////////////////////////////////

  function update(data) {

    groups = Array.from(new Set(data.map(d => d[map.group])));

    data = data.sort((a, b) => {
      let indexA = map.order.indexOf(a[map.sort]);
      let indexB = map.order.indexOf(b[map.sort]);

      if (indexA > indexB) {
        return 1;
      }
      if (indexA < indexB) {
        return -1;
      }
      return 0;
    });

    if (options.size == 125) {
      options.size = 0;
    } else {
      options.size = 125;
    }

    const t = d3.transition().duration(options.transition)

    flower_shapes
      .data(data)
      .transition(t)
      .delay((d, i) => (data.length * options.delay) + options.delay * i)
      .attr('width', d => calcSideLength(options.size, d[map.value]))
      .attr('height', d => calcSideLength(options.size, d[map.value]))
      .attr('rx', d => calcSideLength(options.size, d[map.value]) * options.edge_radius)
      .attr('ry', d => calcSideLength(options.size, d[map.value]) * options.edge_radius)
      .attr('fill', d => d[map.color])
      .on("end", (d, i) => {
        if (i == data.length - 1 && options.size == 0) {
          return update(data)
        }
      });

    flower_label
      .data(groups)
      .transition(t)
      .delay((d, i) => options.size == 0 ? (data.length * options.delay * 2) + options.delay * i : options.delay * i)
      .attr('x', (d, i) => calculateCoordinates(centerX, centerY, options.size * 2, ((360 / groups.length) * (i + 2))).x)
      .attr('y', (d, i) => calculateCoordinates(centerX, centerY, options.size * 2, ((360 / groups.length) * (i + 2))).y)
      .attr('opacity', options.size == 0 ? 0 : 1)
      .text(d => d)

  }

  update(data)

  return {
    update: update,
  }

});
