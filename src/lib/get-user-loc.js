import { popupBuild } from './popup-build';
export function getUserLoc(map) {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition((position) => {
      var lat = position.coords.latitude;
      var long = position.coords.longitude;
      var result = [lat, long];
      return result;
    });
  } else {
    /* geolocation IS NOT available, handle it */
    popupBuild(map);
  }
}
