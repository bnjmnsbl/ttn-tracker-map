export function addPulsingDot(pulsingDot, coords, map) {
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
              coordinates: coords,
            },
          },
        ],
      },
    },
    layout: {
      'icon-image': 'pulsing-dot',
    },
  });
}
