var allData;
var initialHour = 8;

// Lat/Long coordinates of Boston
var center = [42.36, -71.08];

// Setup for the map
var osmUrl = 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
osmAttrib = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
osm = L.tileLayer(osmUrl, {maxZoom: 14, minZoom: 12, attribution: osmAttrib});

// Create the map
var map = new L.Map('map', {layers: [osm], center: new L.LatLng(center[0], center[1]), zoom: 13, scrollWheelZoom: false});

var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var garageMarkerOptions = {
  radius: 4,
  fillColor: '#51A601',
  color: '#51A601',
  weight: 1,
  opacity: 0.6,
  fillOpacity: 0.6
};

var customGarageLayer = L.geoJson(null, {
  pointToLayer: function(feature, latlng) {
    return L.circleMarker(latlng, garageMarkerOptions);
  }
});

omnivore.csv('data/ZC_Locations_7_6_2015.csv', null, customGarageLayer).addTo(map);

// Options for the Hexbin
var options = {

  // Size of the hexagons
  radius : 40,

  // Default opacity of the hexagons
  opacity: 0.55,

  // Transition duration for animations
  duration: 500,

  // Accessor functions for lat/long
  lng: function(d){
    return d[0];
  },

  lat: function(d){
    return d[1];

  },

  // Value accessor function for deriving the color of the hexagons
  value: function(d){
    return d.length; },


  // Override the extent of the value domain
  valueFloor: undefined,
  valueCeil: undefined

};

// Create the hexlayer
var hexLayer = L.hexbinLayer(options).addTo(map);
d3.select('.leaflet-zoom-hide').style({'z-index': 10});

// Set the colorScale range - colorScale() returns a reference to the scale used to map the color of each hexbin
hexLayer.colorScale().range(['lightyellow', 'firebrick']);

function getAllData() {
  d3.csv('data/search_vehicles_loc.csv', function(data) {
    allData = data.map(function(d) {
      return [d.longitude, d.latitude, d.hour, d.dayofweek];
    });
    update();
  });
}

// when the input range changes update the circle
d3.select("#hour").on("input", function() {
  update(+this.value);
});

// update the elements
function update(hour) {

  // adjust the text on the range slider
  if (hour === undefined){ hour = initialHour };
  d3.select("#hour-value").text(hour);
  d3.select("#hour").property("value", hour);
  mapData();
}

// generateData function
function mapData() {
  hour = d3.select('#hour').property('value');
  var hourlyData = allData.filter(function(d) {
    if (d[2] == hour) { return d; }
  });

  hexLayer.data(hourlyData);

  d3.selectAll('path.hexbin-hexagon').on('click', function(d,i) {
      d3.select(this).transition().duration(300).style("opacity", 1);
      div.style("visibility","visible");
      div.transition().duration(300)
      .style("opacity", 1)
      div.text('No. origin searches: '+d.length)
      .style("left", (d3.event.pageX)  + "px")
      .style("top", (d3.event.pageY) + "px");

  });
  d3.selectAll('path.hexbin-hexagon').on("mouseout", function (d) {
    d3.select(this).style("opacity", 0.55);
    div.style("visibility", "hidden")
  });
};

$(function() {
  getAllData();
  map.on("viewreset", mapData);
});
