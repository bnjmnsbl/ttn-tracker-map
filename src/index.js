import mapboxgl from 'mapbox-gl/dist/mapbox-gl.js';
import { getlabelLayerId } from './lib/get-lable-layer-id';
import { getPulsingDot } from './lib/get-pulsing-dot';
import { addPulsingDot } from './lib/add-pulsing-dot';
import { getData } from './lib/get-data';
import { add3dbuildingLayer } from './lib/add-3d-building-layer';
import { getRoute } from './lib/getRoute';
import { selectTracker }  from './lib/selectTracker';
import './css/style.css';

document.addEventListener('DOMContentLoaded', function() {
  const serverUrl = 'https://bnjmn.uber.space';
  mapboxgl.accessToken =
    'pk.eyJ1IjoiYm5qbW5zYmwiLCJhIjoiY2luc3Qxajk4MDBsY3Zza2x1MWg1b2xzeCJ9.BK1MmHruCVZvMFnL_uTC1w';
  //+++ MAP
  //+++ general setting for map appearance +++
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v9',
    center: [13.404954, 52.520008],
    zoom: 12,
    minZoom: 6,
    maxZoom: 18,
    pitch: 45, //angle from plane view
    trackResize: true,
    maxBounds: bounds,
  });

  // Set bounds to Berlin
  var bounds = [
    [52.470896, 13.290829], // Southwest coordinates
    [52.550666, 13.487605], // Northeast coordinates
  ];

  // initialize the map canvas to interact with later for routing
  var canvas = map.getCanvasContainer();

  // initalize a starting point for routing
  var start = [52.52437, 13.41053];

  //+++ FUNCTIONS

  // +++ function to user location on the map (blue dot) +++
  // +++  important: only works within save environment (https or localhost) +++
  const geoLocate = new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true,
    },
    trackUserLocation: true,
    showUserLocation: true,
  });
  map.addControl(geoLocate);

  // +++ zoom in part
  // +++ prperty center has to be nodeCoords
  geoLocate.on('geolocate', function() {
    map.zoomIn({
      zoom: 20,
    });
  });

  // +++ function to show metric scale in the bottom left
  var scale = new mapboxgl.ScaleControl({
    maxWidth: 320,
    unit: 'metric',
  });
  map.addControl(scale);
  scale.setUnit('metric');

  map.on('load', function() {
    // make an initial directions request that
    // starts and ends at the same location
    getRoute(start, map);

    // Add starting point to the map
    map.addLayer({
      id: 'start',
      type: 'circle',
      source: {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Point',
                coordinates: start,
              },
            },
          ],
        },
      },
      paint: {
        'circle-radius': 10,
        'circle-color': '#3887be',
      },
    });

    map.on('click', function(e) {
      var coordsObj = e.lngLat;
      console.log('destination:  ', coordsObj);
      canvas.style.cursor = '';
      var endCoords = Object.keys(coordsObj).map(function(key) {
        return coordsObj[key];
      });
      console.log('Koordinaten destina  tion: ', endCoords);
      var end = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: endCoords,
            },
          },
        ],
      };
      if (map.getLayer('end')) {
        map.getSource('end').setData(end);
      } else {
        map.addLayer({
          id: 'end',
          type: 'circle',
          source: {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: [
                {
                  type: 'Feature',
                  properties: {},
                  geometry: {
                    type: 'Point',
                    coordinates: endCoords,
                  },
                },
              ],
            },
          },
          paint: {
            'circle-radius': 10,
            'circle-color': '#f30',
          },
        });
      }
      getRoute(endCoords, map);
    });
  });

  // +++ function to add pulsing dot for tracker node
  map.on('load', async function() {
    const nodeCoords = await getData(serverUrl);
    const labelLayerId = getlabelLayerId(map);
    const pulsingDot = getPulsingDot(map);

    add3dbuildingLayer(labelLayerId, map);
    addPulsingDot(pulsingDot, nodeCoords, map);

    // +++ jump to location of tracker node
    map.jumpTo({ center: nodeCoords });

    //   function updateMarker () {
    //if myCoords.timestamp.getData() > ....
    //   }

    // +++ function to set color of buildings by zooming in and out
    map.setPaintProperty('building', 'fill-color', [
      'interpolate',
      ['exponential', 0.5],
      ['zoom'],
      15,
      'rgba(49, 96, 227, 1)',
      22,
      'rgba(49, 96, 227, 0.5)',
    ]);

    map.setPaintProperty('building', 'fill-opacity', [
      'interpolate',
      ['exponential', 0.5],
      ['zoom'],
      15,
      0,
      22,
      1,
    ]);

    // ++ function to zoom in by clicking on button
    document
      .getElementById('zoomBtn')
      .addEventListener('click', async function() {
        var nodeCoords = await getData(serverUrl);
        map.flyTo({
          center: [nodeCoords[0], nodeCoords[1]],
          zoom: 20,
        });
      });
  });

  //+++ adds navigation control to zoom in and out
  map.addControl(new mapboxgl.NavigationControl());
});
