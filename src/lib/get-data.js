import { findLastValidCoords } from './find-last-valid-coords';
//here is where the ttn payload will be parsed as JSON
export async function getData(serverUrl) {
  const response = await fetch(
    serverUrl + '/api/payloads/5da57802729dac6e5dc87c4c'
  );
  const myJson = await response.json();
  // findLastValidCoords(myJson.reverse()); would return first data
  let validCoords = findLastValidCoords(myJson);
  return validCoords;
}
