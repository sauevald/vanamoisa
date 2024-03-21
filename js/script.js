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
  attribution:
    'Kaart: <a href="http://osm.org/copyright" target="_blank">OSM</a>',
})

// Create a tile layer using Estonian hybrid map tiles
const hybriid = L.tileLayer(
  'https://tiles.maaamet.ee/tm/tms/1.0.0/hybriid@GMC/{z}/{x}/{-y}.png',
  {
    tileSize: 512,
  }
)

// Create a tile layer using Estonian orthophoto map tiles
const orto = L.tileLayer(
  'https://tiles.maaamet.ee/tm/tms/1.0.0/foto@GMC/{z}/{x}/{-y}.png',
  {
    tileSize: 512,
    attribution:
      'Orto: <a href="https://www.maaamet.ee/" target="_blank" rel="noopener noreferrer">Maa-Amet</a>',
  }
)

// Create a WMS tile layer using Estonian cadastral map data
const kataster = L.tileLayer.wms('https://kaart.maaamet.ee/wms/alus-geo?', {
  format: 'image/png',
  tileSize: 512,
  transparent: true,
  minZoom: 15,
  layers: 'TOPOYKSUS_6569',
  crs: L.CRS.EPSG4326,
})

// Create a custom CRS for EPSG:3301
const epsg3301 = new L.Proj.CRS(
  'EPSG:3301',
  '+proj=lcc +lat_1=59.33333333333334 +lat_2=58 +lat_0=57.51755393055556 +lon_0=24 +x_0=500000 +y_0=6375000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
  {
    resolutions: [1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5],
    transformation: new L.Transformation(1, -40500, -1, 7017000),
  }
)

// Create a WMS tile layers using Estonian planning map data
// Land use layer
const yp_mk = L.tileLayer.wms('https://planeeringud.ee/plank/wms?', {
  format: 'image/png',
  tileSize: 512,
  transparent: true,
  layers: 'yp_maakasutus',
  crs: epsg3301, // Set the custom CRS for EPSG:3301
  attribution:
    'Kiht: <a href="https://planeeringud.ee/plank-web/#/planning/detail/20100625" target="_blank">Saue valla ÜP maakasutus</a>',
})

// Transport layer
const yp_tr = L.tileLayer.wms('https://planeeringud.ee/plank/wms?', {
  format: 'image/png',
  tileSize: 512,
  transparent: true,
  layers: 'yp_transport',
  crs: epsg3301, // Set the custom CRS for EPSG:3301
  attribution:
    'Kiht: <a href="https://planeeringud.ee/plank-web/#/planning/detail/20100625" target="_blank">Saue valla ÜP transport</a>',
})

const rattateed = L.esri.featureLayer({
  url: 'https://gis.sauevald.ee/arcgis/rest/services/Hosted/Hooldatavad_kergteed/FeatureServer/0',
  style: function (feature) {
    // Customize the style based on the "tase" attribute value
    const tase = feature.properties.tase
    if (tase === 'III') {
      return { color: '#c8102e', weight: 4 }
    } else if (tase === 'II') {
      return { color: '#f73c4d', weight: 3 }
    } else {
      return { color: '#fea3a7', weight: 2 }
    }
  },
  attribution:
    'Kiht: <a href="https://gis.sauevald.ee/portal/apps/webappviewer/index.html?id=4997acde0cde4d7eaae3b39d36b601e5" target="_blank">Saue valla hooldatavad JJT-d</a>',
})

// Create a map layer for the Vanamõisa detail plan area
const vanamoisa = L.esri.dynamicMapLayer({
  url: 'https://gis.sauevald.ee/arcgis/rest/services/Detailplaneeringud/Raudteeylene_planeering_27_02_2024/MapServer',
  crs: epsg3301,
  useCors: false,
  tileSize: 512,
  attribution:
    "Kiht: <a href='https://atp.amphora.ee/sauevv/index.aspx?itm=1118413' target='_blank'>Vanamõisa DP algatamise taotlus</a>",
})

// Define the base maps and overlay maps for the layer control
const baseMaps = {
  Ortofoto: orto,
  OpenStreetMap: osm,
}

const overlayMaps = {
  Hybriid: hybriid,
  Kataster: kataster,
  'ÜP maakasutus': yp_mk,
  'ÜP transport': yp_tr,
  'JJT hooldustasemed': rattateed,
  'Vanamõisa eskiis': vanamoisa,
}

// Add the layer control to the map in the top-left corner
L.control.layers(baseMaps, overlayMaps, { position: 'topleft' }).addTo(map)

// Create a legend control for the Vanamõisa layer
const legend = L.esri.legendControl(vanamoisa)

// Create an instance of the custom vertical slider control
const verticalSlider = new L.Control.VerticalSlider({
  position: 'bottomleft',
  layer: vanamoisa,
})

// Listen for when the Vanamõisa layer is added to the map
map.on('overlayadd', function (event) {
  // Check if the added layer is the Vanamõisa layer
  if (event.layer === vanamoisa) {
    // Add the legend control to the map
    legend.addTo(map)
    map.addControl(verticalSlider)
  }
})

// Listen for when the Vanamõisa layer is removed from the map
map.on('overlayremove', function (event) {
  // Check if the removed layer is the Vanamõisa layer
  if (event.layer === vanamoisa) {
    // Remove the legend control from the map
    map.removeControl(legend)
    map.removeControl(verticalSlider)
  }
})

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
  yk: yp_mk,
  yt: yp_tr,
  va: vanamoisa,
  rt: rattateed,
}
L.myHash(map, layers)
