// © 2023 Data Culture
// Released under the ISC license.
// https://studio.datacult.com/ 

'use strict'

let choropleth = ((data, topo, map, options) => {

  console.log(data, topo)

  ////////////////////////////////////////
  /////////////// Defaults ///////////////
  ////////////////////////////////////////

  let mapping = {
    id: "id",
    value: null,
    label: null
  }

  map = { ...mapping, ...map };

  let defaults = {
    selector: '#vis',
    width: 800,
    height: 800,
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
    transition: 400,
    delay: 100,
    stroke: "#FFE4D7",
    fill: "none",
    focus: "",
    domain: null,
    format: d3.format(".1%"),
    title: "",
    legend: true,
    colorScale: d3.schemeReds[9]
  }

  options = { ...defaults, ...options };

  ////////////////////////////////////////
  //////////// Data Sorting //////////////
  ////////////////////////////////////////

  // sort data

  if (map.sort != null) {
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
  }

  ////////////////////////////////////////
  ////////////// SVG Setup ///////////////
  ////////////////////////////////////////

  const outerContainer = d3.select(options.selector);

  const innerContainer = outerContainer.append('div')
    .classed('svg-container', true);

  const svg = innerContainer.append('svg')
    .attr('width', '100%') // Responsive width
    .attr('height', '100%') // Responsive height
    .attr('viewBox', `0 0 ${options.width} ${options.height}`)
    .append('g')
    .attr('transform', `translate(${options.margin.left},${options.margin.top})`);

  ////////////////////////////////////////
  ////////////// Helpers /////////////////
  ////////////////////////////////////////

  const centerX = options.width / 2;
  const centerY = options.height / 2;
  const height = options.height - options.margin.top - options.margin.bottom;
  const width = options.width - options.margin.left - options.margin.right;

  ////////////////////////////////////////
  ////////////// Scales //////////////////
  ////////////////////////////////////////

  const colorScale = d3.scaleQuantize().domain(options.domain ? options.domain : d3.extent(data, d => d[map.value])).range(options.colorScale).nice();

  ////////////////////////////////////////
  ////////////// DOM Setup ///////////////
  ////////////////////////////////////////

  const counties = topojson.feature(topo, topo.objects.counties);
  const states = topojson.feature(topo, topo.objects.states);
  const statemap = new Map(states.features.map(d => [d.id, d]));
  const statemesh = topojson.mesh(topo, topo.objects.states, (a, b) => a !== b);
  const namemap = new Map(topo.objects.states.geometries.map(d => [d.properties.name, d.id]))
  let valuemap = new Map(data.map(d => [d[map.id], +d[map.value]]));
  let labelsmap = new Map(data.map(d => [d[map.id], d[map.label]]));
  console.log(valuemap, labelsmap)


  const path = d3.geoPath();
  const projection = d3.geoAlbersUsa().fitSize([width, height], counties);
  path.projection(projection);

  const statesPath = svg.selectAll("path")
    .data(topojson.feature(topo, topo.objects.states).features)
    .join("path")
    .attr("fill", d => colorScale(valuemap.get(d.properties.name)))
    .attr("d", path);

  statesPath
    .append("title")
    .text(d => `${d.properties.name}\n${labelsmap.get(d.properties.name)}`);

  svg.append("path")
    .datum(topojson.mesh(topo, topo.objects.states, (a, b) => a !== b))
    .attr("fill", "none")
    .attr("stroke", "white")
    .attr("stroke-linejoin", "round")
    .attr("d", path);

  ////////////////////////////////////////
  ////////////// Legend //////////////////
  ////////////////////////////////////////

  function addLegend(){

    let legend = Legend(colorScale, {
      title: `${map.label}\n${options.title}`,
      width: options.width / 1.5,
      tickSize: 0,
      tickFormat: options.format,
    })

    svg.append('g')
      // .attr("transform", `translate(${(options.width / 2) - 50},${100})`)
      .attr("transform", `translate(${0},${80})`)
      .append(() => legend)
      .classed('legend', true);

  }

  if (options.legend == true) {
    addLegend()
  }

  ////////////////////////////////////////
  ////////////// Update //////////////////
  ////////////////////////////////////////

  function update(newData = data, newMap = map, newOptions = options) {

    console.log("update")

    data = newData;
    map = { ...map, ...newMap };
    options = { ...options, ...newOptions };

    if (map.sort != null) {
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
    }

    const t = d3.transition().duration(options.transition);

    valuemap = new Map(data.map(d => [d[map.id], +d[map.value]]));
    labelsmap = new Map(data.map(d => [d[map.id], d[map.label]]));

    colorScale.domain(options.domain ? options.domain : d3.extent(data, d => d[map.value]))

    statesPath
      .transition(t)
      .attr("fill", d => colorScale(valuemap.get(d.properties.name)))

    if (options.legend == true) {
      svg.select('.legend').remove()
      addLegend()
    } else {
      svg.select('.legend').remove()
    }

  }


  return {
    update: update,
  }

});
