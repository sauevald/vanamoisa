// Define a custom control that extends L.Control
L.Control.VerticalSlider = L.Control.extend({
  options: {
    position: 'topleft', // Change this to your desired position
    min: 0,
    max: 100,
    initialValue: 90,
    layer: null, // The layer you want to control opacity for
  },

  onAdd: function (map) {
    // Create the container div for the slider
    const container = L.DomUtil.create(
      'div',
      'leaflet-control-container leaflet-bar vertical-slider'
    )
    container.id = 'slider' // Set the ID for styling

    // Initialize the jQuery UI Slider
    $(container).slider({
      orientation: 'vertical',
      range: 'min',
      min: this.options.min,
      max: this.options.max,
      value: this.options.initialValue,
      slide: (e, ui) => {
        // Adjust the opacity of the layer based on the slider value
        this.options.layer.setOpacity(ui.value / 100)
      },
    })
    // Prevent map interaction when interacting with the slider
    L.DomEvent.disableClickPropagation(container)

    return container
  },
})
