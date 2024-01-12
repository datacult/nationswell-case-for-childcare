// © 2023 Data Culture
// Released under the ISC license.
// https://studio.datacult.com/ 

'use strict'

let flowers = ((data, map, options) => {

  ////////////////////////////////////////
  /////////////// Defaults ///////////////
  ////////////////////////////////////////

  let mapping = {
    group: "group",
    value: "value",
    color: "color",
    sort: "sort",
    order: []
  }

  map = { ...mapping, ...map };

  let defaults = {
    selector: '#flowers',
    width: 800,
    height: 800,
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
    transition: 400,
    delay: 100,
    edge_radius: 0.1,
    padding: 2,
    size: 0,
    stroke: "#FFE4D7",
    state: "flower"
  }

  options = { ...defaults, ...options };

  let activeTransition = false;

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

  const diamondsDiv = d3.select(options.selector);

  const container = diamondsDiv.append('div')
    .classed('diamond-svg-container', true);

  const svg = container.append('svg')
    .attr('width', '100%') // Responsive width
    .attr('height', '100%') // Responsive height
    .attr('viewBox', `0 0 ${options.width} ${options.height}`)
    .classed('diamond-svg', true)
    .append('g')
    .attr('transform', `translate(${options.margin.left},${options.margin.top})`);

  ////////////////////////////////////////
  ////////////// Helpers /////////////////
  ////////////////////////////////////////

  const centerX = options.width / 2;
  const centerY = options.height / 2;
  const height = options.height - options.margin.top - options.margin.bottom;
  const width = options.width - options.margin.left - options.margin.right;

  const barChartWidth = 125 * 2.5;

  ////////////////////////////////////////
  ////////////// Scales //////////////////
  ////////////////////////////////////////

  const calcSideLength = (sideLength, percentage) => {
    return Math.sqrt((percentage / 100) * (sideLength * sideLength));
  }

  function calculateCoordinates(xCenter, yCenter, radius, degrees) {
    var radians = degrees * Math.PI / 180;
    var x = xCenter + radius * Math.cos(radians);
    var y = yCenter + radius * Math.sin(radians);
    return { x, y };
  }

  let xScale = d3.scaleBand()
    .domain(groups)
    .range([0, barChartWidth])
    .paddingInner(options.padding / 50)

  const yScale = d3.scaleLinear()
    .domain([0, 100])
    .range([0, barChartWidth])


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
    .classed('petal', true)
    .on('mouseover', (d, i) => {
      if (activeTransition == false) {
        update(data, "bar", true)
      }
    })
    .on('mouseout', (d, i) => {
      if (activeTransition == false) {
        update(data, "flower", true)
      }
    })

  let flower_label = svg
    .selectAll('flower-label')
    .data(groups)
    .join('text')
    .attr('x', (d, i) => calculateCoordinates(centerX, centerY, 125 * 2, ((360 / groups.length) * (i + 2))).x)
    .attr('y', (d, i) => calculateCoordinates(centerX, centerY, 125 * 2, ((360 / groups.length) * (i + 2))).y)
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

  function update(updateData = data, state = options.state, changeState = false) {

    data = updateData;
    options.state = state;

    groups = Array.from(new Set(updateData.map(d => d[map.group])));

    xScale.domain(groups)

    updateData = updateData.sort((a, b) => {
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

    if (changeState == false) {
      if (options.size == 125) {
        options.size = 0;
      } else {
        options.size = 125;
      }
    }

    const t = d3.transition().duration(options.transition)

    if (changeState == true) {
      activeTransition = true;
    }

    if (state == "bar") {

      flower_shapes
        .data(updateData)
        .transition(t)
        .delay((d, i) => options.delay * groups.indexOf(d[map.group]))
        .attr('width', xScale.bandwidth())
        .attr('height', d => yScale(d[map.value]))
        .attr('x', d => centerX - (barChartWidth / 2) + xScale(d[map.group]))
        .attr('y', d => centerY + (barChartWidth / 2) - yScale(d[map.value]))
        .attr('transform', `translate(0,0) rotate(0)`)
        .attr('fill', d => d[map.color])
        .on("end", (d, i) => {
          if (i == updateData.length - 1) {
            activeTransition = false;
            if (options.size == 0) {
              return update()
            }
          }
        });

      flower_label
        .data(groups)
        .transition(t)
        .delay((d, i) => 0) //options.size == 0 ? (data.length * options.delay * 2) + options.delay * i : 
        .attr('x', (d, i) => centerX - (barChartWidth / 2) + xScale(d) + xScale.bandwidth() / 2)
        .attr('y', (d, i) => centerY + (barChartWidth / 2) + 10)
        .attr('opacity', options.size == 0 ? 0 : 1)
        .text(d => d)

    } else {

      flower_shapes
        .data(updateData)
        .transition(t)
        .delay((d, i) => changeState == true ? options.delay * groups.indexOf(d[map.group]) : options.delay * i)
        .attr('x', options.padding)
        .attr('y', options.padding)
        .attr('width', d => calcSideLength(options.size, d[map.value]))
        .attr('height', d => calcSideLength(options.size, d[map.value]))
        .attr('rx', d => calcSideLength(options.size, d[map.value]) * options.edge_radius)
        .attr('ry', d => calcSideLength(options.size, d[map.value]) * options.edge_radius)
        .attr('transform', (d, i) => `translate(${(centerX)},${(centerY)}) rotate(${45 + ((360 / groups.length) * (i + 2))})`)
        .attr('fill', d => d[map.color])
        .on("end", (d, i) => {
          if (i == updateData.length - 1) {
            activeTransition = false;
            if (options.size == 0) {
              return update()
            }
          }
        });

      flower_label
        .data(groups)
        .transition(t)
        .delay((d, i) => 0) //options.size == 0 ? (data.length * options.delay * 2) + options.delay * i : 
        .attr('x', (d, i) => calculateCoordinates(centerX, centerY, 125 * 2, ((360 / groups.length) * (i + 2))).x)
        .attr('y', (d, i) => calculateCoordinates(centerX, centerY, 125 * 2, ((360 / groups.length) * (i + 2))).y)
        .attr('opacity', options.size == 0 ? 0 : 1)
        .text(d => d)

    }

  }

  update(data)

  return {
    update: update,
  }

});
