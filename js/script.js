// Create a Leaflet map with specified options
const map = new L.Map('map', {
  center: [59.3335, 24.5657],
  zoom: 15,
  fullscreenControl: true,
  fullscreenControlOptions: {
    position: 'topleft',
  },
})

// Create a tile layer using OpenStreetMap tiles
const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Kaart: <a href="http://osm.org/copyright">OSM</a>',
})

// Create a tile layer using Estonian hybrid map tiles
const hybriid = L.tileLayer(
  'https://tiles.maaamet.ee/tm/tms/1.0.0/hybriid@GMC/{z}/{x}/{-y}.png',
  {}
)

// Create a tile layer using Estonian orthophoto map tiles
const orto = L.tileLayer(
  'https://tiles.maaamet.ee/tm/tms/1.0.0/foto@GMC/{z}/{x}/{-y}.png',
  {
    attribution:
      'Orto: <a href="https://www.maaamet.ee/" target="_blank" rel="noopener noreferrer">Maa-Amet</a>',
  }
)

// Create a WMS tile layer using Estonian cadastral map data
const kataster = L.tileLayer.wms('https://kaart.maaamet.ee/wms/alus-geo?', {
  format: 'image/png',
  transparent: true,
  minZoom: 15,
  layers: 'TOPOYKSUS_6569',
  crs: L.CRS.EPSG4326,
})

// Create a custom tile layer for the Vanamõisa development area
const vanamoisa = L.tileLayer(
  'https://mapwarper.net/maps/tile/80329/{z}/{x}/{y}.png',
  {
    attribution:
      "Skeem: <a href='https://atp.amphora.ee/sauevv/index.aspx?itm=1118413' target='_blank'>Vanamõisa DP algatamise taotlus</a>",
  }
)

// Define the base maps and overlay maps for the layer control
const baseMaps = {
  Ortofoto: orto,
  OpenStreetMap: osm,
}

const overlayMaps = {
  Hybriid: hybriid,
  Kataster: kataster,
  Vanamõisa: vanamoisa,
}

// Add the layer control to the map
L.control.layers(baseMaps, overlayMaps).addTo(map)

// Create an instance of the custom vertical slider control
const verticalSlider = new L.Control.VerticalSlider({
  position: 'topright',
  layer: vanamoisa,
})

// Add the control to Leaflet map
map.addControl(verticalSlider)

// Set the default basemap layer to ortophoto
orto.addTo(map)

// Add author info to the map
map.attributionControl.setPrefix(
  'Teostus: <a href = "mailto:tormi.tabor@gmail.com">Tormi Tabor</a>'
)

// Initialize customised leaflet-fullHash plugin
const layers = {
  b: osm,
  o: orto,
  hy: hybriid,
  ka: kataster,
  va: vanamoisa,
}
L.myHash(map, layers)
