/* eslint-disable no-undef */

const serverUrl = 'https://bnjmn.uber.space';
mapboxgl.accessToken = 'pk.eyJ1IjoiYm5qbW5zYmwiLCJhIjoiY2luc3Qxajk4MDBsY3Zza2x1MWg1b2xzeCJ9.BK1MmHruCVZvMFnL_uTC1w';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v10',
  center: [13.404954, 52.520008],
  zoom: 11,
  minZoom: 8,
  maxZoom: 18,
  pitch: 45
});

map.on('load', async function () {

  const coords = await getData();
  const labelLayerId = getlabelLayerId();
  const pulsingDot = getPulsingDot();

  add3dbuildingLayer(labelLayerId);
  addPulsingDot(pulsingDot, coords);

  //   function updateMarker () {

  //   }

  map.jumpTo({ 'center': coords});
});




// FUNCTIONS

function getlabelLayerId() {

  // Insert the layer beneath any symbol layer.
  var layers = map.getStyle().layers;

  var labelLayerId;
  for (var i = 0; i < layers.length; i++) {
    if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
      labelLayerId = layers[i].id;
      return labelLayerId;
    }
  }
}

function add3dbuildingLayer(labelLayerId) {
  map.addLayer(
    {
      id: '3d-buildings',
      source: 'composite',
      'source-layer': 'building',
      filter: ['==', 'extrude', 'true'],
      type: 'fill-extrusion',
      minzoom: 15,
      paint: {
        'fill-extrusion-color': '#aaa',

        // use an 'interpolate' expression to add a smooth transition effect to the
        // buildings as the user zooms in
        'fill-extrusion-height': [
          'interpolate',
          ['linear'],
          ['zoom'],
          15,
          0,
          15.05,
          ['get', 'height']
        ],
        'fill-extrusion-base': [
          'interpolate',
          ['linear'],
          ['zoom'],
          15,
          0,
          15.05,
          ['get', 'min_height']
        ],
        'fill-extrusion-opacity': 0.6
      }
    },
    labelLayerId
  );
}

function getPulsingDot() {
  const size = 80;

  const pulsingDot = {
    width: size,
    height: size,
    data: new Uint8Array(size * size * 4),

    onAdd: function() {
      var canvas = document.createElement('canvas');
      canvas.width = this.width;
      canvas.height = this.height;
      this.context = canvas.getContext('2d');
    },

    render: function() {
      var duration = 1000;
      var t = (performance.now() % duration) / duration;

      var radius = (size / 2) * 0.3;
      var outerRadius = (size / 2) * 0.7 * t + radius;
      var context = this.context;

      // draw outer circle
      context.clearRect(0, 0, this.width, this.height);
      context.beginPath();
      context.arc(
        this.width / 2,
        this.height / 2,
        outerRadius,
        0,
        Math.PI * 2
      );
      context.fillStyle = 'rgba(255, 200, 200,' + (1 - t) + ')';
      context.fill();

      // draw inner circle
      context.beginPath();
      context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
      context.fillStyle = 'rgba(255, 100, 100, 1)';
      context.strokeStyle = 'white';
      context.lineWidth = 2 + 4 * (1 - t);
      context.fill();
      context.stroke();

      // update this image's data with data from the canvas
      this.data = context.getImageData(0, 0, this.width, this.height).data;

      // keep the map repainting
      map.triggerRepaint();

      // return `true` to let the map know that the image was updated
      return true;
    }
  };
  return pulsingDot;
}

function addPulsingDot(pulsingDot, coords) {
  map.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });

  map.addLayer({
    id: 'points',
    type: 'symbol',
    source: {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',

              coordinates: coords
            }
          }
        ]
      }
    },
    layout: {
      'icon-image': 'pulsing-dot'
    }
  });

}


async function getData() {
  const response = await fetch(serverUrl + '/api/payloads/5d80cd11c3e0d3dd431092bf');
  const myJson = await response.json();
  let lastCoords = findLastValidCoords(myJson);
  return lastCoords;

}

function findLastValidCoords(arr) {
  let i = arr.length-1;
  for (i, i>=0; i--;) {
    if (hasPayload(arr[i])) {
      if (hasLatLong(arr[i])) {
        let result = [];
        result.push(arr[i].payload.longitude);
        result.push(arr[i].payload.latitude);
        return result;
      }
    }
  }

  function hasPayload(obj) {
    if (obj.payload) {
      return true;
    } else {
      return false;
    }
  }

  function hasLatLong(obj) {
    if (obj.payload.longitude && obj.payload.latitude) {
      return true;
    } else {
      return false;
    }
  }
}
