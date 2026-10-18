const API_URL = "http://localhost:3000/artists"

const dataUiEndpoint = document.querySelector('[data-ui="endpoint"]');
dataUiEndpoint.textContent = API_URL;

const dataUiSTatus = document.querySelector('[data-ui="status"]');
const dataUiCollection = document.querySelector('[data-ui="collection"]');
const dataUiReload = document.querySelector('[data-action="reload"]');


async function getArtists(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    renderArtists(data);
  } catch (error) {
    console.error(error);
  }
}

function renderArtists(artists) {
  dataUiCollection.replaceChildren();
  artists.forEach(artist => {
    const card = document.createElement("div");
    card.classList.add("card");

    const name = document.createElement("h2");
    name.classList.add("card__title");
    name.textContent = artist.name;

    const description = document.createElement("p");
    description.textContent = artist.description;

    card.append(name, description);
    dataUiCollection.append(card);
  });
}

getArtists(API_URL);