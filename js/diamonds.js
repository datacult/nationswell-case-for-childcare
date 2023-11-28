// © 2023 Data Culture
// Released under the ISC license.
// https://studio.datacult.com/ 

'use strict'

let diamonds = ((data, selector = '#diamonds') => {

  const transitionTime = 500;
  const transitionDelay = 100;

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

  //position mapping to transate 4 squares which are rotated 45 degress into diamons to make a bigger diamond

  const positionBuffer = 2;

  let positionMapping = [
    { x: centerX, y: centerY - positionBuffer },
    { x: centerX + (hypotenuse / 2) + positionBuffer, y: centerY + (hypotenuse / 2) },
    { x: centerX, y: centerY + hypotenuse + positionBuffer },
    { x: centerX - (hypotenuse / 2) - positionBuffer, y: centerY + (hypotenuse / 2) }
  ]

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

  // Calculate the position of the bottom corner of the outer diamond
  let bottomCornerX = diamondSize / 2;
  let bottomCornerY = diamondSize / 2;

  // Append the outer diamond shape (which is a rotated square)

  let outer_rect = rounded_rect(-diamondSize / 2, -diamondSize / 2, diamondSize, diamondSize, diamondSize * 0.1, true, false, false, false)

  let groups = svg
    .selectAll('g')
    .data(data)
    .join('g')
    .attr('transform', (d, i) => `translate(${positionMapping[i].x}, ${positionMapping[i].y})`);

  let outer = groups
    .append("path")
    .attr("d", outer_rect)
    .attr('transform', (d, i) => `rotate(${45 + (90 * i)})`)
    .style('fill', '#485925') // No fill for the outer diamond
    .style('stroke', 'none') // Stroke for the outer diamond border;

  let cost = groups
    .append('rect')
    .attr('x', d => bottomCornerX - diamondSize * (d.percent / 100))
    .attr('y', d => bottomCornerY - diamondSize * (d.percent / 100))
    .attr('width', d => diamondSize * (d.percent / 100))
    .attr('height', d => diamondSize * (d.percent / 100))
    .attr('transform', (d, i) => `rotate(${45 + (90 * i)})`)
    .style('fill', "#ffffff")

  let benchmark = groups
    .append('rect')
    .attr('x', d => bottomCornerX - diamondSize * (d.benchmark / 100))
    .attr('y', d => bottomCornerY - diamondSize * (d.benchmark / 100))
    .attr('width', d => diamondSize * (d.benchmark / 100))
    .attr('height', d => diamondSize * (d.benchmark / 100))
    .attr('transform', (d, i) => `rotate(${45 + (90 * i)})`)
    .style('fill', "#FF8A53")

  // State
  let state_label = groups
    .append('text')
    .attr('x', (d, i) => labelMapping[i].x)
    .attr('y', (d, i) => labelMapping[i].y + 20)
    .attr('text-anchor', (d, i) => labelMapping[i].anchor)
    .attr('font-weight', '200')
    .attr('dominant-baseline', 'central')
    .attr('fill', '#485925')
    .attr('opacity', 0)
    .text(d => `${d.percent}%`);

  // Label text below the diamond
  let value_label = groups
    .append('text')
    .attr('x', (d, i) => labelMapping[i].x)
    .attr('y', (d, i) => labelMapping[i].y)
    .attr('text-anchor', (d, i) => labelMapping[i].anchor)
    .attr('font-weight', 'bold')
    .attr('dominant-baseline', 'central')
    .attr('fill', '#485925')
    .attr('opacity', 0)
    .text(d => d.state);



  function update() {

    diamondSize = 125

    hypotenuse = calculateHypotenuse(diamondSize, diamondSize);

    positionMapping = [
      { x: centerX, y: centerY - positionBuffer },
      { x: centerX + (hypotenuse / 2) + positionBuffer, y: centerY + (hypotenuse / 2) },
      { x: centerX, y: centerY + hypotenuse + positionBuffer },
      { x: centerX - (hypotenuse / 2) - positionBuffer, y: centerY + (hypotenuse / 2) }
    ]

    labelMapping = [
      { x: 0, y: -diamondSize - 20, anchor: 'middle' },
      { x: diamondSize + 50, y: 0, anchor: 'middle' },
      { x: 0, y: diamondSize, anchor: 'middle' },
      { x: -diamondSize - 50, y: 0, anchor: 'middle' }
    ]

    bottomCornerX = diamondSize / 2;
    bottomCornerY = diamondSize / 2;


    outer_rect = rounded_rect(-diamondSize / 2, -diamondSize / 2, diamondSize, diamondSize, diamondSize * 0.1, true, false, false, false)

    groups
      .transition()
      .attr('transform', (d, i) => `translate(${positionMapping[i].x}, ${positionMapping[i].y})`);

    outer
      .transition()
      .delay((d, i) => transitionDelay * i)
      .duration(transitionTime)
      .attr("d", outer_rect);

    cost
      .attr('x', d => bottomCornerX - diamondSize * (d.percent / 100))
      .attr('y', d => bottomCornerY - diamondSize * (d.percent / 100))
      .transition()
      .delay((d, i) => (data.length * transitionDelay) + transitionDelay * i)
      .duration(transitionTime)
      .attr('width', d => diamondSize * (d.percent / 100))
      .attr('height', d => diamondSize * (d.percent / 100));

    benchmark
      .attr('x', d => bottomCornerX - diamondSize * (d.benchmark / 100))
      .attr('y', d => bottomCornerY - diamondSize * (d.benchmark / 100))
      .transition()
      .delay((d, i) => (data.length * transitionDelay * 2) + transitionDelay * i)
      .duration(transitionTime)
      .attr('width', d => diamondSize * (d.benchmark / 100))
      .attr('height', d => diamondSize * (d.benchmark / 100));


    state_label
      .transition()
      .delay((d, i) => transitionDelay * i)
      .duration(transitionTime)
      .attr('x', (d, i) => labelMapping[i].x)
      .attr('y', (d, i) => labelMapping[i].y + 20)
      .attr('opacity', 1);

    value_label
      .transition()
      .delay((d, i) => transitionDelay * i)
      .duration(transitionTime)
      .attr('x', (d, i) => labelMapping[i].x)
      .attr('y', (d, i) => labelMapping[i].y)
      .attr('opacity', 1);

  }

  return {
    update: update,
}

});
