const MAP_ELEMENT_ID = 'map';
const MAP_NIGHT_TYPE_ID = 'night';

let chairIcon = {
  url: '/images/seat.png',
  //state your size parameters in terms of pixels
  size: new google.maps.Size(40, 30),
  scaledSize: new google.maps.Size(40, 30),
  origin: new google.maps.Point(0,0)
};

/**
 * This function is meant to create the map, set the centre and zoom, add a new map style and add markers.
 * Map styles are different modes that will be displayed to the user
 * Added night mode (static configs for that style in extraMapStyles.json)
 * New modes/map styles can be added in extraMapStyles.json file.
 *
 */
function fetchConfigAndBuildMap() {
  const url = '/json/extraMapStyles.json';
  fetch(url)
    .then(response => response.json())
    .then(data => addDiffStylesToMap(data.Night));
}

function addDiffStylesToMap(mapStyle){
  // Create a new StyledMapType object, passing it an array of styles,
  // and the name to be displayed on the map type control.
  mapStyleName = 'Night';
  const styledMapType = new google.maps.StyledMapType(mapStyle, {name: mapStyleName});

  createStyledMap(styledMapType);
}

function createStyledMap(styledMapType){
  // Create a map object, and include the MapTypeId to add
  // to the map type control.
  const map = new google.maps.Map(document.getElementById(MAP_ELEMENT_ID), {
    center: {lat: 1.360860, lng: 103.823800},
    zoom: 12,
    mapTypeControlOptions: {
      mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain', MAP_NIGHT_TYPE_ID]
    }
  });

  // Associate the styled map with the MapTypeId and set it to display.
  map.mapTypes.set(MAP_NIGHT_TYPE_ID, styledMapType);
  map.setMapTypeId(MAP_NIGHT_TYPE_ID);

  createCinemaMarkers(map);
}

/**
 * This function fetches cinema markers from the backend and places them on the map.
 */
async function createCinemaMarkers(map) {
  const fetchResult = fetch('/cinema-data');
  const response = await fetchResult;
  const jsonData = await response.json();
  jsonData.forEach((cinemaMarker) => {
    createCinemaMarkerForDisplay(map, cinemaMarker.lat, cinemaMarker.lng, cinemaMarker.content, cinemaMarker.key)
  });
}

/**
 * Creates a marker that shows an info window with the cinema name and handles user interaction events
 */
async function createCinemaMarkerForDisplay(map, lat, lng, cinemaName, key, updateMode=false) {
  const cinemaMarker = new google.maps.Marker({
    position: {lat: lat, lng: lng},
    map: map,
    // set the icon as catIcon declared above
    icon: chairIcon,
    // must use optimized false for CSS
    optimized: false
  });

  const infoText = document.createTextNode(cinemaName);

  /*TODO: change this to get dict of cinema aggregated scores instead by key. So we just do one fetch()*/
  /*await getMessagesForKey(key);*/

  buildPopupWindowInput(map, lat, lng, cinemaName, key, cinemaMarker);
  const infoWindow = new google.maps.InfoWindow({
    content: infoText
  });

  cinemaMarker.addListener('click', () => {
    document.getElementById("cinemaName").innerHTML=cinemaName;
    document.getElementById('mapsPgPopUp').style.display = "block";
  });

  cinemaMarker.addListener('mouseover', () => {
    infoWindow.open(map, cinemaMarker);
  });

  cinemaMarker.addListener('mouseout', () => {
    infoWindow.close();
  });
}


/*TODO: Get dict of cinema aggregated scores instead by key. So we just do one fetch()*/
/*If we want smiley: less than 0 -> sad face. If more than 0 -> happy face. If 0 -> neutral face. Just pass out a dict of 0,1,-1 values to frontend*/


/** Sends a message to the backend for saving. */
function postMessage(parentKey, text) {
  const params = new URLSearchParams();
  params.append('parentKey', parentKey);
  params.append('text', text);
    fetch('/marker-messages', {
    method: 'POST',
    body: params
  });
}

async function handleSubmitButtonClick(map, lat, lng, cinemaName, key, marker, text) {
  await postMessage(key, text);
}

/** Builds and returns HTML pop up that show an editable textbox and a submit button. Then handles submit */
function buildPopupWindowInput(map, lat, lng, cinemaName, key, marker) {
  const textBox = document.getElementById('submitReviewTextArea');
  const button = document.getElementById('submitReviewsButton');
  button.onclick = () => {
    handleSubmitButtonClick(map, lat, lng, cinemaName, key, marker, textBox.value);
  };
}

function div_hide() {
  document.getElementById('mapsPgPopUp').style.display = "none";
}

function buildUI() {
  fetchConfigAndBuildMap();
}
