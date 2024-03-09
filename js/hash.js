// Immediately Invoked Function Expression (IIFE) to encapsulate the code
;(function (window) {
  // Check if the browser supports the hashchange event
  const HAS_HASHCHANGE = (() => {
    const doc_mode = window.documentMode
    return 'onhashchange' in window && (doc_mode === undefined || doc_mode > 7)
  })()

  // Hash class
  class Hash {
    constructor(map, options) {
      this.map = map
      this.options = options
      this.lastHash = null
      this.changeTimeout = null
      this.movingMap = false
      this.changeDefer = 200

      // Bind event handlers to the instance
      this.onHashChange = this.onHashChange.bind(this)
      this.onMapMove = this.onMapMove.bind(this)

      if (map) {
        this.init()
      }
    }

    // Parse the hash string and return an object with zoom, center, and layers information
    parseHash(hash) {
      if (hash.indexOf('#') === 0) {
        hash = hash.substr(1)
      }
      const args = hash.split('/')
      if (args.length === 4) {
        const zoom = parseInt(args[0], 10)
        const lat = parseFloat(args[1])
        const lon = parseFloat(args[2])
        const layers = args[3].split('-')
        if (isNaN(zoom) || isNaN(lat) || isNaN(lon)) {
          return null
        } else {
          return {
            center: new L.LatLng(lat, lon),
            zoom: zoom,
            layers: layers,
          }
        }
      } else {
        return null
      }
    }

    // Format the map state into a hash string
    formatHash(map) {
      const center = map.getCenter()
      const zoom = map.getZoom()
      const precision = Math.max(0, Math.ceil(Math.log(zoom) / Math.LN2))
      const layers = []

      const options = this.options

      for (const key in options) {
        if (options.hasOwnProperty(key)) {
          if (map.hasLayer(options[key])) {
            layers.push(key)
          }
        }
      }

      return (
        '#' +
        [
          zoom,
          center.lat.toFixed(precision),
          center.lng.toFixed(precision),
          layers.join('-'),
        ].join('/')
      )
    }

    // Initialize the hash functionality
    init() {
      L.Util.setOptions(this, this.options)
      this.onHashChange()
      this.startListening()
    }

    // Remove the hash functionality
    removeFrom() {
      if (this.changeTimeout) {
        clearTimeout(this.changeTimeout)
      }

      this.stopListening()
      this.map = null
    }

    // Event handler for map move events
    onMapMove() {
      if (this.movingMap || !this.map._loaded) {
        return false
      }

      const hash = this.formatHash(this.map)
      if (this.lastHash !== hash) {
        location.replace(hash)
        this.lastHash = hash
      }
    }

    // Update the map state based on the hash
    update() {
      const hash = location.hash
      if (hash === this.lastHash) {
        return
      }
      const parsed = this.parseHash(hash)
      if (parsed) {
        this.movingMap = true

        this.map.setView(parsed.center, parsed.zoom)
        const layers = parsed.layers
        const options = this.options
        const that = this

        this.map.eachLayer(function (layer) {
          that.map.removeLayer(layer)
        })

        layers.forEach(function (element) {
          that.map.addLayer(options[element])
        })

        this.movingMap = false
      } else {
        this.onMapMove(this.map)
      }
    }

    // Event handler for hashchange event
    onHashChange() {
      if (!this.changeTimeout) {
        const that = this
        this.changeTimeout = setTimeout(function () {
          that.update()
          that.changeTimeout = null
        }, this.changeDefer)
      }
    }

    // Start listening to map events and hashchange event
    startListening() {
      this.map.on('moveend layeradd layerremove', this.onMapMove, this)

      if (HAS_HASHCHANGE) {
        L.DomEvent.addListener(window, 'hashchange', this.onHashChange)
      } else {
        clearInterval(this.hashChangeInterval)
        this.hashChangeInterval = setInterval(this.onHashChange, 50)
      }
      this.isListening = true
    }

    // Stop listening to map events and hashchange event
    stopListening() {
      this.map.off('moveend layeradd layerremove', this.onMapMove, this)

      if (HAS_HASHCHANGE) {
        L.DomEvent.removeListener(window, 'hashchange', this.onHashChange)
      } else {
        clearInterval(this.hashChangeInterval)
      }
      this.isListening = false
    }

    // Helper function to get the key by value in an object
    _keyByValue(obj, value) {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (obj[key] === value) {
            return key
          }
        }
      }
      return null
    }
  }

  // Add the Hash class to the Leaflet namespace
  L.Hash = Hash

  // Create a shortcut function to create a new Hash instance
  L.hash = function (map, options) {
    return new L.Hash(map, options)
  }

  // Add the addHash and removeHash methods to the Map prototype
  L.Map.prototype.addHash = function () {
    this._hash = L.hash(this, this.options)
  }
  L.Map.prototype.removeHash = function () {
    this._hash.removeFrom()
  }
})(window)

// Custom Hash class that extends the base Hash class
class MyHash extends L.Hash {
  // Override the parseHash method to log the hash string and parsed object
  parseHash(hash) {
    console.log('parseHash: ' + hash)
    const parsed = super.parseHash(hash)
    console.log('parseHash: ' + JSON.stringify(parsed))
    return parsed
  }

  // Override the formatHash method to log the formatted hash string
  formatHash(map) {
    const formatted = super.formatHash(map)
    console.log('formatHash: ' + formatted)
    return formatted
  }

  // Override the update method to log an update event
  update() {
    super.update()
    console.log('update')
  }
}

// Create a shortcut function to create a new MyHash instance
L.myHash = function (map, options) {
  return new MyHash(map, options)
}
