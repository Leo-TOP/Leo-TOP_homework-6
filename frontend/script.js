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

    if (artist.imageUrl) {
      const image = setUpImage(artist);
      card.append(image);
    }

    const name = document.createElement("h3");
    name.classList.add("card__title");
    name.textContent = artist.name;
    card.append(name);

    const description = document.createElement("p");
    description.classList.add("card__description");
    description.textContent = artist.description;
    card.append(description);

    const meta = document.createElement("div");
    meta.classList.add("card__meta");

    const year = document.createElement("span");
    year.classList.add("card__year");
    year.textContent = `Год основания: ${artist.formedYear ?? "—"}`;

    const active = document.createElement("span");
    active.classList.add("card__active");
    active.textContent = `Статус: ${artist.isActive ? "Активен" : "Неактивен"}`;

    meta.append(year, active);
    card.append(meta);

    if (artist.genres?.length) {
      const genres = setUpGenres(artist);
      card.append(genres);
    }

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



const artistForm = document.querySelector('[data-form="entry"]');

const formMessage = document.querySelector('[data-ui="form-message"]');
const submitButton = artistForm.querySelector('button[type="submit"]');

function showFormMessage(text, variant) {
  formMessage.textContent = text;
  formMessage.classList.remove("entry-form__message--success", "entry-form__message--error");
  if (variant) {
    formMessage.classList.add(`entry-form__message--${variant}`);
  }
}

artistForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(artistForm);
  const artist = {
    name: formData.get("name").trim(),
    description: formData.get("description").trim(),
    imageUrl: formData.get("imageUrl").trim(),
    formedYear: Number(formData.get("formedYear")),
    isActive: formData.has("isActive"),
    genres: formData
      .get("genres")
      .split(",")
      .map((genre) => genre.trim())
      .filter(Boolean),
  };

  submitButton.disabled = true;
  showFormMessage("", "success");

  try {
    await createArtist(artist);
    artistForm.reset();
    showFormMessage("Исполнитель добавлен.", "success");
    await loadArtists(API_URL);
  } catch (error) {
    console.error(error);
    showFormMessage(
      "Не удалось добавить исполнителя. Введённые данные сохранены в форме — попробуйте ещё раз.",
      "error"
    );
  } finally {
    submitButton.disabled = false;
  }
});


async function createArtist(artist) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(artist),
  });

  if (!response.ok) {
    throw new Error(`Failed to post artist: ${response.status}`);
  }

  return response.json();
}


dataUiReload.addEventListener("click", () => loadArtists(API_URL));
loadArtists(API_URL);