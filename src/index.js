import mapboxgl from 'mapbox-gl/dist/mapbox-gl.js';
import { getlabelLayerId } from './lib/get-lable-layer-id';
import { getPulsingDot } from './lib/get-pulsing-dot';
import { addPulsingDot } from './lib/add-pulsing-dot';
import { getData } from './lib/get-data';
import { add3dbuildingLayer } from './lib/add-3d-building-layer';
import { dropdownOpen } from './lib/dropdownOpen';
import { dropdownClose } from './lib/dropdownClose';
import { openImpressum } from './lib/openImpressum';
import { overlay } from './lib/aboutOverlay';
// import {getRoute } from './lib/getRoute';
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
    center: [13.388443, 52.4839],
    zoom: 12,
    minZoom: 4,
    maxZoom: 18,
    pitch: 45, //angle from plane view
  });

  // set bounds of the map
  map.setMaxBounds([[-180, -85], [180, 85]]);

  // initialize the map canvas
  var canvas = map.getCanvasContainer();

  // initalize a starting point for routing
  const start = [13.388443, 52.4839];

  // ++++ THIS WEHRE ROUTING FUNCTION STARTS ++++
  function getRoute(end) {
    // make a directions request using cycling profile
    // start will always be the GPSnode -- only the end or destination will change
    const start = [13.388443, 52.4839];
    console.log('Starting point: ', start);

    // very depressing Mapbox GL API --> not working!
    // var url =
    //   'https://api.mapbox.com/directions/v5/mapbox/cycling/' +
    //   start[0] +
    //   ',' +
    //   start[1] +
    //   ';' +
    //   end[1] +
    //   ',' +
    //   end[0] +
    //   '?steps=true&geometries=geojson&access_token=' +
    //   mapboxgl.accessToken;

    let url2 =
      'http://osrm-docker-bikesharing-dev2.eu-central-1.elasticbeanstalk.com/route/v1/bicycle/' +
      start[0] +
      ',' +
      start[1] +
      ';' +
      end[0] +
      ',' +
      end[1] +
      '?geometries=geojson';

    console.log('API Url: ', url2);

    // make an XHR request https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
    let req = new XMLHttpRequest();
    req.responseType = 'json';
    req.open('GET', url2, true);
    req.onload = function() {
      let data = req.response.routes[0];
      console.log('data aka. Request.response.routes[0]: ', data);
      var route = data.geometry.coordinates;
      var geojson = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: route,
        },
      };
      // if the route already exists on the map, reset it using setData
      if (map.getSource('route')) {
        map.getSource('route').setData(geojson);
      } else {
        // otherwise, make a new request
        map.addLayer({
          id: 'route',
          type: 'line',
          source: {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: geojson,
              },
            },
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#11119f',
            'line-width': 5,
            'line-opacity': 0.65,
          },
        });
      }
      // add turn instructions here at the end
    };
    req.send();
  }

  map.on('load', function() {
    // make an initial directions request that
    // starts and ends at the same location
    getRoute(start);

    // Add starting point to the map
    map.addLayer({
      id: 'startingpoint',
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
        'circle-radius': 0,
        'circle-color': '#ff6464',
      },
    });

    map.on('click', function(e) {
      // get current GPS coordiantes of cursor --> first lng, then at
      var coordsObj = e.lngLat;
      canvas.style.cursor = '';
      let coords = Object.keys(coordsObj).map(function(key) {
        return coordsObj[key];
      });
      console.log('Koordinaten destination: ', coords);
      let end = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: coords,
            },
          },
        ],
      };
      console.log('end: ', end);
      if (map.getLayer('end')) {
        // important: setData has to be 'end'
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
                    coordinates: coords,
                  },
                },
              ],
            },
          },
          paint: {
            'circle-radius': 8,
            'circle-color': '#11119f',
          },
        });
      }
      getRoute(coords);

      // +++ GET DURATION AND DISTANCE
      let url2 =
        'http://osrm-docker-bikesharing-dev2.eu-central-1.elasticbeanstalk.com/route/v1/bicycle/' +
        start[0] +
        ',' +
        start[1] +
        ';' +
        coords[0] +
        ',' +
        coords[1] +
        '?geometries=geojson';

      console.log('url2', url2);

      async function doAjax() {
        try {
          const res = await fetch(url2);
          const data = await res.json();
          let temp = data.routes[0].distance / 1000;
          const distance = temp.toFixed(2);
          const duration = data.routes[0].duration;
          const hours = Math.floor(duration / 3600);
          const minutes = Math.floor((duration % 3600) / 60);
          const seconds = Math.floor(duration % 60);

          console.log('Entfernung: ', distance);
          console.log(
            'Stunden:',
            hours,
            'Minuten: ',
            minutes,
            'Sekunden: ',
            seconds
          );

          // dispplay distance in div
          let trackerDist = document.getElementById('trackerDistance');
          let el = 'Distance:</br>' + distance + ' km';
          if (el !== undefined) {
            trackerDist.innerHTML = '<p>' + el + '</p>';
          }
          // override distance if already existing
          else {
            while (trackerDist.firstChild) {
              trackerDist.removeChild(trackerDist.firstChild);
              trackerDist.innerHTML = '<p>' + el + '</p>';
            }
          }

          // dispplay duration in div
          let trackerDur = document.getElementById('trackerDuration');
          let el2 =
            'Duration with bike:</br>' + minutes + ' min' + seconds + ' sec';
          if (el2 !== undefined) {
            trackerDur.innerHTML = '<p>' + el2 + '</p>';
          }
          // override distance if already existing
          else {
            while (trackerDur.firstChild) {
              trackerDur.removeChild(trackerDur.firstChild);
              trackerDur.innerHTML = '<p>' + el2 + '</p>';
            }
          }
        } catch (error) {
          console.log('Error:' + error);
        }
      }
      doAjax();
    });
  });
  // ++++ THIS IS WHERE ROUTING FUNCTION ENDS ++++

  //+++ FUNCTIONS
  // +++ geojson to add markers to the map
  var geojson = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [13.388443, 52.4839],
        },
        properties: {
          title: 'CityLAB Berlin',
          description: 'Platz der Luftbrücke 4, 12101 Berlin',
        },
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [13.3425879, 52.4886385],
        },
        properties: {
          title: 'Technologiestiftung Berlin',
          description: 'Grunewaldstraße 61-62, 10779 Berlin',
        },
      },
    ],
  };

  // add markers to map
  geojson.features.forEach(function(marker) {
    // create a HTML element for each feature
    var el = document.createElement('div');
    el.className = 'marker';

    // make a marker for each feature and add to the map
    new mapboxgl.Marker(el)
      .setLngLat(marker.geometry.coordinates)
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }) // add popups
          .setHTML(
            '<h3>' +
              marker.properties.title +
              '</h3><p>' +
              marker.properties.description +
              '</p>'
          )
      )
      .addTo(map);
  });

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

  let userLocation = geoLocate.showUserLocation;
  if (userLocation == undefined) {
    console.log('Hier gehts das nächste mal weiter');
  }

  // +++ zoom in part
  // +++ property center has to be nodeCoords
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

  // +++ function to add pulsing dot for tracker node
  map.on('load', async function() {
    const nodeCoords = await getData(serverUrl);
    const labelLayerId = getlabelLayerId(map);
    const pulsingDot = getPulsingDot(map);

    add3dbuildingLayer(labelLayerId, map);
    addPulsingDot(pulsingDot, nodeCoords, map);

    // +++ jump to location of tracker node
    map.jumpTo({ center: nodeCoords });

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

  // +++ get Element by Id to add function
  const dropdownCtrl = document.getElementById('dropdownCtrl');
  if (dropdownCtrl !== undefined) {
    dropdownCtrl.addEventListener('click', dropdownOpen);
  }
  // Close the dropdown if the user clicks outside of it
  dropdownClose();

  // open subpage from citylab-berlin.org as impressum
  const impressum = document.getElementById('impressum');
  if (impressum !== undefined) {
    impressum.addEventListener('click', openImpressum);
  }

  // open overlay to explain what this page is about
  const aboutOverlay = document.getElementById('about');
  if (aboutOverlay !== undefined) {
    aboutOverlay.addEventListener('click', overlay);
  }
});
