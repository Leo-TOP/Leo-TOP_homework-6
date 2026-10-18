const API_URL = "http://localhost:3000/artists";

const dataUiEndpoint = document.querySelector('[data-ui="endpoint"]');
dataUiEndpoint.textContent = API_URL;

const dataUiStatus = document.querySelector('[data-ui="status"]');
const dataUiStatusTitle = dataUiStatus.querySelector(".status__title");
const dataUiStatusText = dataUiStatus.querySelector(".status__text");
const dataUiCollection = document.querySelector('[data-ui="collection"]');
const dataUiReload = document.querySelector('[data-action="reload"]');

const STATUS_STATES = new Set(["loading", "success", "error"]);

async function loadArtists(url) {
  try {
    dataUiCollection.replaceChildren();
    showState("loading", "Загрузка", "Данные музыкантов подгружаются...");

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();

    if (data.length === 0) {
      showState("empty", "Пусто", "Список музыкантов пуст.");
      return;
    }

    renderArtists(data);
    showState("success", "Успех!", `Загружено исполнителей: ${data.length}`);
  } catch (error) {
    console.error(error);
    showState("error", "Ошибка", "Не удалось загрузить данные.");
  }
}

function renderArtists(artists) {
  artists.forEach((artist) => {
    const card = document.createElement("div");
    card.classList.add("card");

    const image = setUpImage(artist);

    const name = document.createElement("h3");
    name.classList.add("card__title");
    name.textContent = artist.name;

    const description = document.createElement("p");
    description.classList.add("card__description");
    description.textContent = artist.description;

    const meta = document.createElement("div");
    meta.classList.add("card__meta");

    const year = document.createElement("span");
    year.classList.add("card__year");
    year.textContent = `Год основания: ${artist.formedYear ?? "—"}`;

    const active = document.createElement("span");
    active.classList.add("card__active");
    active.textContent = `Статус: ${artist.isActive ? "Активен" : "Неактивен"}`;

    meta.append(year, active);


    const genres = setUpGenres(artist);

    card.append(image, name, description, meta, genres);
    dataUiCollection.append(card);
  });
}

function setUpImage(artist) {
    const image = document.createElement("img");
    image.classList.add("card__image");
    image.src = artist.imageUrl;
    image.alt = artist.name;
    image.loading = "lazy";
    image.addEventListener("error", () => {
      image.remove();
    });

    return image;
}

function setUpGenres(artist) {
    const genres = document.createElement("ul");
    genres.classList.add("card__genres");

    (artist.genres ?? []).forEach((genre) => {
      const badge = document.createElement("li");
      badge.classList.add("card__genre");
      badge.textContent = genre;
      genres.append(badge);
    });

    return genres;
}

function showState(state, title, text) {
  dataUiStatusTitle.textContent = title;
  dataUiStatusText.textContent = text;

  dataUiStatus.classList.remove("status--loading", "status--success", "status--error");
  if (STATUS_STATES.has(state)) {
    dataUiStatus.classList.add(`status--${state}`);
  }
}

dataUiReload.addEventListener("click", () => loadArtists(API_URL));
loadArtists(API_URL);