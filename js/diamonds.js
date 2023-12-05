// © 2023 Data Culture
// Released under the ISC license.
// https://studio.datacult.com/ 

'use strict'

let diamonds = ((data, selector = '#diamonds', color) => {

  const transitionTime = 500;
  const transitionDelay = transitionTime * 0.3;

  const diamondsDiv = d3.select(selector);

  // Set up the SVG dimensions
  const svgWidth = 800;
  const svgHeight = 800;

  // Initial diamond size
  let diamondSize = 0;

  function calculateHypotenuse(a, b) {
    return Math.sqrt(a * a + b * b);
  }

  let hypotenuse = calculateHypotenuse(diamondSize, diamondSize);

  const container = diamondsDiv.append('div')
    .classed('diamond-svg-container', true);

  const svg = container.append('svg')
    .attr('width', '100%') // Responsive width
    .attr('height', '100%') // Responsive height
    .attr('viewBox', `0 0 ${svgWidth} ${svgHeight}`)
    .classed('diamond-svg', true);

  const centerX = svgWidth / 2;
  const centerY = svgHeight / 2;

  let labelMapping = [
    { x: 0, y: -diamondSize - 20, anchor: 'middle' },
    { x: diamondSize + 50, y: 0, anchor: 'middle' },
    { x: 0, y: diamondSize, anchor: 'middle' },
    { x: -diamondSize - 50, y: 0, anchor: 'middle' }
  ]

  function rounded_rect(x, y, w, h, r, tl, tr, bl, br) {
    var retval;
    retval = "M" + (x + r) + "," + y;
    retval += "h" + (w - 2 * r);
    if (tr) { retval += "a" + r + "," + r + " 0 0 1 " + r + "," + r; }
    else { retval += "h" + r; retval += "v" + r; }
    retval += "v" + (h - 2 * r);
    if (br) { retval += "a" + r + "," + r + " 0 0 1 " + -r + "," + r; }
    else { retval += "v" + r; retval += "h" + -r; }
    retval += "h" + (2 * r - w);
    if (bl) { retval += "a" + r + "," + r + " 0 0 1 " + -r + "," + -r; }
    else { retval += "h" + -r; retval += "v" + -r; }
    retval += "v" + (2 * r - h);
    if (tl) { retval += "a" + r + "," + r + " 0 0 1 " + r + "," + -r; }
    else { retval += "v" + -r; retval += "h" + r; }
    retval += "z";
    return retval;
  }

  // Append the outer diamond shape (which is a rotated square)

  let outer_rect = rounded_rect(0, 0, diamondSize, diamondSize, diamondSize * 0.1, false, false, false, true)

  let groups = svg
    .selectAll('g')
    .data(data)
    .join('g')
    .attr('transform-origin', 'top left')
    .attr('transform', (d, i) => `translate(${(centerX)},${(centerY)}) rotate(${45 + (90 * (i + 2))})`)

  let outer = groups
    .append("path")
    .attr("d", outer_rect)
    .attr('fill', color)

  let cost = groups
    .append('rect')
    .attr('x', d => 0)
    .attr('y', d => 0)
    .attr('width', d => diamondSize * (d.percent / 100))
    .attr('height', d => -(diamondSize * (d.percent / 100)))
    .attr('fill', "#ffffff")

  let benchmark = groups
    .append('rect')
    .attr('x', d => 0)
    .attr('y', d => 0)
    .attr('width', d => diamondSize * (d.benchmark / 100))
    .attr('height', d => -(diamondSize * (d.benchmark / 100)))
    .attr('fill', "#FF8A53")

  // State
  let value_label = svg
    .selectAll('value-label')
    .data(data)
    .join('text')
    .attr('x', (d, i) => (centerX) + labelMapping[i].x)
    .attr('y', (d, i) => (centerY) + labelMapping[i].y + 20)
    .attr('text-anchor', (d, i) => labelMapping[i].anchor)
    .attr('font-weight', '200')
    .attr('dominant-baseline', 'central')
    .attr('fill', color)
    .attr('opacity', 0)
    .text(d => `${d.percent}%`)
    .classed('value-label', true);

  // Label text below the diamond
  let state_label = svg
    .selectAll('state-label')
    .data(data)
    .join('text')
    .attr('x', (d, i) => (centerX) + labelMapping[i].x)
    .attr('y', (d, i) => (centerY) + labelMapping[i].y)
    .attr('text-anchor', (d, i) => labelMapping[i].anchor)
    .attr('font-weight', 'bold')
    .attr('dominant-baseline', 'central')
    .attr('fill', color)
    .attr('opacity', 0)
    .text(d => d.state)
    .classed('state-label', true);

  let xLine = svg
    .append('line')
    .attr('x1', (centerX) - 125)
    .attr('y1', (centerY) - 125)
    .attr('x2', (centerX) + 125)
    .attr('y2', (centerY) + 125)
    .attr('stroke', '#EAEC7D')
    .attr('stroke-width', 3)

  let yLine = svg
    .append('line')
    .attr('x1', (centerX) - 125)
    .attr('y1', (centerY) + 125)
    .attr('x2', (centerX) + 125)
    .attr('y2', (centerY) - 125)
    .attr('stroke', '#EAEC7D')
    .attr('stroke-width', 3)


  function update(data, color, open = true) {

    console.log(data, color, open)

    if (open == true && diamondSize == 125) {
      diamondSize = 0;
      console.log()
    } else {
      diamondSize = 125;
    }

    hypotenuse = calculateHypotenuse(diamondSize, diamondSize);

    labelMapping = [
      { x: 0, y: - diamondSize - 120, anchor: 'middle' },
      { x: diamondSize + 120, y: 0, anchor: 'middle' },
      { x: 0, y: diamondSize + 100, anchor: 'middle' },
      { x: -diamondSize - 120, y: 0, anchor: 'middle' }
    ]

    outer_rect = rounded_rect(0, 0, diamondSize, diamondSize, diamondSize * 0.1, false, false, false, true)

    const t = d3.transition()
      .duration(transitionTime)

    outer
      .data(data)
      .transition(t)
      .delay((d, i) => diamondSize == 0 ? (data.length * transitionDelay * 2) + transitionDelay * i : transitionDelay * i)
      .attr('fill', color)
      .attr("d", outer_rect)
      .on("end", (d, i) => {
        if (i == data.length - 1 && diamondSize == 0) {
          return update(data, color)
        }
      });

    cost
      .data(data)
      .transition(t)
      .delay((d, i) => (data.length * transitionDelay) + transitionDelay * i)
      .attr('width', d => diamondSize * (d.percent / 100))
      .attr('height', d => diamondSize * (d.percent / 100));

    benchmark
      .data(data)
      .transition(t)
      .delay((d, i) => diamondSize == 0 ? transitionDelay * i : (data.length * transitionDelay * 2) + transitionDelay * i)
      .attr('width', d => diamondSize * (d.benchmark / 100))
      .attr('height', d => diamondSize * (d.benchmark / 100));


    value_label
      .data(data)
      .transition(t)
      .delay((d, i) => diamondSize == 0 ? (data.length * transitionDelay * 2) + transitionDelay * i : transitionDelay * i)
      .attr('x', (d, i) => (centerX) + labelMapping[i].x)
      .attr('y', (d, i) => (centerY) + labelMapping[i].y + 20)
      .attr('fill', color)
      .attr('opacity', diamondSize == 0 ? 0 : 1)
      .text(d => `${d.percent}%`);

    state_label
      .data(data)
      .transition(t)
      .delay((d, i) => diamondSize == 0 ? (data.length * transitionDelay * 2) + transitionDelay * i : transitionDelay * i)
      .attr('x', (d, i) => (centerX) + labelMapping[i].x)
      .attr('y', (d, i) => (centerY) + labelMapping[i].y)
      .attr('fill', color)
      .attr('opacity', diamondSize == 0 ? 0 : 1)
      .text(d => d.state);

  }

  return {
    update: update,
  }

});
