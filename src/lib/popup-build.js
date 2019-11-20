import mapboxgl from 'mapbox-gl/dist/mapbox-gl.js';
export function popupBuild(map) {
  new mapboxgl.Popup({ closeOnClick: false })
    .setLngLat([-96, 37.8])
    .setHTML('<h1>Route wird erst angezeigt, wenn User Location aktiv ist</h1>')
    .addTo(map);
}
