let language;
let cinemaKey;

// Fetch messages and add them to the page.
function fetchMessages() {
  const url = '/feed?language=' + language + '&cinemaKey=' + cinemaKey;
  fetch(url).then((response) => response.json()).then((messages) => {
    const messageContainer = document.getElementById('message-container');
    if (messages.length == 0) {
      messageContainer.innerHTML = '<p>There are no posts yet.</p>';
    } else {
      messageContainer.innerHTML = '';
    }
    messages.forEach((message) => {
      messageContainer.appendChild(buildMessageDiv(message));
    });
  });
}

function buildMessageDiv(message) {
  const usernameDiv = document.createElement('div');
  usernameDiv.classList.add("left-align");
  usernameDiv.appendChild(document.createTextNode(message.user));

  const timeDiv = document.createElement('div');
  timeDiv.classList.add('center-align');
  timeDiv.appendChild(document.createTextNode(new Date(message.timestamp)));

  const sentimentScoreDiv = document.createElement('div');
  sentimentScoreDiv.classList.add('right-align');
  sentimentScoreDiv.appendChild(document.createTextNode(message.sentimentScore.toFixed(2)));

  const headerDiv = document.createElement('div');
  headerDiv.classList.add('message-header');
  headerDiv.appendChild(usernameDiv);
  headerDiv.appendChild(timeDiv);
  headerDiv.appendChild(sentimentScoreDiv);

  const bodyDiv = document.createElement('div');
  bodyDiv.classList.add('message-body');
  bodyDiv.appendChild(document.createTextNode(message.text));
  const messageDiv = document.createElement('div');
  messageDiv.classList.add("message-div");
  messageDiv.appendChild(headerDiv);
  messageDiv.appendChild(bodyDiv);

  return messageDiv;
}

// Gets the selected language to be translated to and fetch translated messages from server.
function submitTransReq() {
  language = document.getElementById('language').value;
  const messageContainer = document.getElementById('message-container');
  messageContainer.innerText = 'Loading...';

  fetchMessages();
}

// Gets the selected cinema and fetch messages from the specific cinema.
function submitCinemaReq() {
  cinemaKey = document.getElementById('cinema').value;
  const messageContainer = document.getElementById('message-container');
  messageContainer.innerText = 'Loading...';

  fetchMessages();
}

function initializeUrlParams(url) {
  const search_params = new URLSearchParams(new URL(window.location.href).search);
  language = search_params.get('language') || "original";
  cinemaKey = search_params.get('cinemaKey') || "all";
}

function createCinemaOptions() {
  cinemaSelect = document.getElementById("cinema");
  fetch('/cinema-data')
  .then(response => response.json())
  .then(jsonData => {
    jsonData.forEach((cinema) => {
      option = document.createElement("option");
      option.value = cinema.key;
      option.innerHTML = cinema.content;
      cinemaSelect.appendChild(option);
    });
    cinemaSelect.value = cinemaKey;
  });
}

function loadOnce() {
  if (!window.location.hash) {
    window.location = window.location + '#loaded';
    window.location.reload();
  }
}

// Fetch data and populate the UI of the page.
function buildUI() {
  initializeUrlParams();
  createCinemaOptions();
  fetchMessages();
  setTimeout(loadOnce, 4500);
}
