import mapboxgl from 'mapbox-gl/dist/mapbox-gl.js';
//+++ function to get route from starting point (Node) to another point (User)
export function getRoute(end, map) {
  // make a directions request using cycling profile
  // start will always be the GPSnode -- only the end or destination will change
  var start = [52.52437, 13.41053];
  console.log(start);
  var url =
    'https://api.mapbox.com/directions/v5/mapbox/cycling/' +
    start[0] +
    ',' +
    start[1] +
    ';' +
    end[0] +
    ',' +
    end[1] +
    '?steps=true&geometries=geojson&access_token=' +
    mapboxgl.accessToken;
  console.log(url);
  // make an XHR request https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
  var req = new XMLHttpRequest();
  req.responseType = 'json';
  req.open('GET', url, true);
  req.onload = function() {
    var data = req.response.routes[0];
    console.log(data);
    var route = data.geometry.coordinates;
    console.log(route);
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
          'line-color': '#3887be',
          'line-width': 5,
          'line-opacity': 0.75,
        },
      });
    }
    // add turn instructions here at the end
  };
  req.send();
}
