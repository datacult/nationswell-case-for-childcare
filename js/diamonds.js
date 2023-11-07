const grey = '#A9A9A9';

const data = [
  { label: 'Low income parents', value: 40, state: 'DC' },
  { label: 'Black parents', value: 14, state: 'NY' },
  { label: 'Hispanic parents', value: 27, state: 'Wisconsin' },
  { label: 'Asian/Pacific Islander parents', value: 16, state: 'NY' },
  { label: 'White parents', value: 14, state: 'NY' }
];

const diamondsDiv = d3.select('#diamonds');

// Set up the SVG dimensions
const svgWidth = 250; 
const svgHeight = 250;

// Define the size of the diamond
const diamondSize = 125; 

data.forEach((d, i) => {

  const container = diamondsDiv.append('div')
    .classed('diamond-svg-container', true);

  const svg = container.append('svg')
    .attr('width', '100%') // Responsive width
    .attr('height', '100%') // Responsive height
    .attr('viewBox', `0 0 ${svgWidth} ${svgHeight}`)
    .classed('diamond-svg', true);

  const centerX = svgWidth / 2;
  const centerY = svgHeight / 2;

  // Create a group element to contain the diamonds and the associated text
  const g = svg.append('g')
    .attr('transform', `translate(${centerX}, ${centerY})`);

  // Calculate the size of the inner diamond based on the value
  const innerSize = diamondSize * (d.value / 100);

  // Calculate the position of the bottom corner of the outer diamond
  const bottomCornerX = diamondSize / 2;
  const bottomCornerY = diamondSize / 2;

  // Append the inner diamond shape (smaller square to represent the percentage)
  g.append('rect')
    .attr('x', bottomCornerX - innerSize)
    .attr('y', bottomCornerY - innerSize)
    .attr('width', innerSize)
    .attr('height', innerSize)
    .attr('transform', 'rotate(45)')
    .style('fill', grey); // Fill for the inner diamond

  // Append the outer diamond shape (which is a rotated square)
  g.append('rect')
    .attr('x', -diamondSize / 2)
    .attr('y', -diamondSize / 2)
    .attr('width', diamondSize)
    .attr('height', diamondSize)
    .attr('transform', 'rotate(45)')
    .style('fill', 'none') // No fill for the outer diamond
    .style('stroke', 'black'); // Stroke for the outer diamond border

  // State and value text
  g.append('text')
    .attr('x', 0)
    .attr('y', 0) // Adjust this value as needed to position the text appropriately
    .attr('text-anchor', 'middle')
    .attr('fill', grey)
    .attr('dominant-baseline', 'central')
    .text(`${d.state} ${d.value}%`);

  // Label text below the diamond
  g.append('text')
    .attr('x', 0)
    .attr('y', diamondSize / 2 + 40) // This positions the label below the diamond. Adjust the offset as needed.
    .attr('text-anchor', 'middle')
    .attr('font-weight', 'bold')
    .attr('dominant-baseline', 'hanging')
    .text(d.label);

});
