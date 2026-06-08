const DEBOUNCE_MS = 300;

const searchInput = document.getElementById("search");
const statusEl = document.getElementById("status");
const listEl = document.getElementById("recipe-list");
const modalEl = document.getElementById("modal");
const modalImageEl = document.getElementById("modal-image");
const modalPlaceholderEl = document.getElementById("modal-placeholder");
const modalTitleEl = document.getElementById("modal-title");
const modalIngredientsEl = document.getElementById("modal-ingredients");
const modalInstructionsEl = document.getElementById("modal-instructions");

let debounceTimer = null;
let activeController = null;
let lastFocusedEl = null;

function debounce(fn, delay) {
  return (...args) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fn(...args), delay);
  };
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function truncate(text, max = 140) {
  if (!text || text.length <= max) return text ?? "";
  return `${text.slice(0, max).trimEnd()}…`;
}

function resolveImageUrl(imageUrl) {
  if (!imageUrl) return "";
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  if (imageUrl.startsWith("/")) return imageUrl.slice(1);
  return imageUrl;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function createPlaceholder() {
  const el = document.createElement("div");
  el.className = "placeholder";
  el.setAttribute("aria-hidden", "true");
  el.textContent = "🍽";
  return el;
}

function createClickableThumb(recipe) {
  const thumb = document.createElement("button");
  thumb.type = "button";
  thumb.className = "recipe-thumb recipe-thumb--clickable";
  thumb.setAttribute("aria-label", `View instructions for ${recipe.name}`);

  const overlay = document.createElement("span");
  overlay.className = "recipe-thumb-overlay";
  overlay.textContent = "View recipe";

  const imageUrl = resolveImageUrl(recipe.imageUrl);

  if (imageUrl) {
    const img = document.createElement("img");
    img.src = imageUrl;
    img.alt = "";
    img.loading = "lazy";
    img.addEventListener("error", () => {
      img.remove();
      thumb.insertBefore(createPlaceholder(), overlay);
    });
    thumb.append(img, overlay);
  } else {
    thumb.append(createPlaceholder(), overlay);
  }

  thumb.addEventListener("click", () => openModal(recipe));
  return thumb;
}

function openModal(recipe) {
  lastFocusedEl = document.activeElement;

  modalTitleEl.textContent = recipe.name;
  modalIngredientsEl.textContent = recipe.ingredients || "No ingredients listed.";
  modalInstructionsEl.textContent =
    recipe.instructions || "No instructions listed.";

  const imageUrl = resolveImageUrl(recipe.imageUrl);

  if (imageUrl) {
    modalImageEl.src = imageUrl;
    modalImageEl.alt = recipe.name;
    modalImageEl.hidden = false;
    modalPlaceholderEl.hidden = true;
    modalImageEl.onerror = () => {
      modalImageEl.hidden = true;
      modalPlaceholderEl.hidden = false;
    };
  } else {
    modalImageEl.hidden = true;
    modalPlaceholderEl.hidden = false;
  }

  modalEl.hidden = false;
  document.body.classList.add("modal-open");
  modalEl.querySelector(".modal-close").focus();
}

function closeModal() {
  modalEl.hidden = true;
  document.body.classList.remove("modal-open");
  modalImageEl.removeAttribute("src");
  lastFocusedEl?.focus();
}

modalEl.addEventListener("click", (event) => {
  if (event.target.closest("[data-close]")) {
    closeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (!modalEl.hidden && event.key === "Escape") {
    closeModal();
  }
});

function renderRecipes(recipes) {
  listEl.innerHTML = "";

  if (recipes.length === 0) {
    statusEl.textContent = "No recipes match your search.";
    statusEl.classList.remove("error");
    listEl.hidden = true;
    return;
  }

  const query = searchInput.value.trim();
  statusEl.textContent = query
    ? `${recipes.length} result${recipes.length === 1 ? "" : "s"} for “${query}”`
    : `${recipes.length} recipe${recipes.length === 1 ? "" : "s"}`;

  statusEl.classList.remove("error");

  for (const recipe of recipes) {
    const item = document.createElement("li");
    item.className = "recipe-card";

    const body = document.createElement("div");
    body.innerHTML = `
      <h2>${escapeHtml(recipe.name)}</h2>
      <p class="meta">Updated ${formatDate(recipe.updatedAt || recipe.createdAt)}</p>
      <p>${escapeHtml(truncate(recipe.ingredients))}</p>
    `;

    item.append(createClickableThumb(recipe), body);
    listEl.appendChild(item);
  }

  listEl.hidden = false;
}

async function fetchRecipes(query = "") {
  activeController?.abort();
  activeController = new AbortController();

  const params = new URLSearchParams();
  if (query) {
    params.set("name", query);
  }

  const url = `${API_BASE}/api/recipes${params.size ? `?${params}` : ""}`;

  statusEl.textContent = query ? "Searching…" : "Loading recipes…";
  statusEl.classList.remove("error");

  try {
    const response = await fetch(url, { signal: activeController.signal });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const recipes = await response.json();
    renderRecipes(recipes);
  } catch (error) {
    if (error.name === "AbortError") return;

    listEl.hidden = true;
    statusEl.textContent = `Could not reach the API at ${API_BASE}. Is your API running?`;
    statusEl.classList.add("error");
    console.error(error);
  }
}

const onSearch = debounce(() => {
  fetchRecipes(searchInput.value.trim());
}, DEBOUNCE_MS);

searchInput.addEventListener("input", onSearch);

fetchRecipes();
