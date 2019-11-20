export function findLastValidCoords(arr) {
  for (let i = arr.length - 1; i >= 0; i--) {
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
