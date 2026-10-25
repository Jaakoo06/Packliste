
"use strict";

const STORAGE_KEY = "gipfelbereit-packliste-v1";

const categories = [
  {
    id: "camera",
    title: "Kamera & Technik",
    subtitle: "Für die besonderen Momente",
    icon: "📷",
    items: [
      { id: "camera", name: "Kamera", note: "Vor der Tour kurz auf Funktion prüfen." },
      { id: "lenses", name: "Objektiv(e)" },
      { id: "battery", name: "Ersatzakku für die Kamera", note: "Am besten körpernah und warm transportieren." },
      { id: "memory", name: "Speicherkarte", note: "Genug freien Speicherplatz kontrollieren." },
      { id: "tripod", name: "Kameragurt und ggf. Stativ" },
      { id: "phone", name: "Handy", note: "Voll geladen." },
      { id: "powerbank", name: "Powerbank", note: "Optional, falls du sie brauchst." }
    ]
  },
  {
    id: "gear",
    title: "Wanderausrüstung",
    subtitle: "Sicher unterwegs im Dunkeln",
    icon: "🥾",
    items: [
      { id: "boots", name: "Wanderschuhe mit gutem Profil" },
      { id: "headlamp", name: "Stirnlampe", note: "Akku laden oder Batterien prüfen." },
      { id: "backpack", name: "Kleiner Rucksack" },
      { id: "poles", name: "Wanderstöcke", note: "Optional, je nach Route und Bedingungen." },
      { id: "sunglasses", name: "Sonnenbrille" }
    ]
  },
  {
    id: "clothes",
    title: "Kleidung & Wärme",
    subtitle: "Am Gipfel kann es richtig kalt werden",
    icon: "🧤",
    items: [
      { id: "jacket", name: "Warme, winddichte Jacke" },
      { id: "fleece", name: "Fleece oder zusätzliche Isolationsschicht" },
      { id: "hat", name: "Mütze oder Stirnband" },
      { id: "gloves", name: "Handschuhe" },
      { id: "socks", name: "Warme Wandersocken" },
      { id: "rainwear", name: "Regen- und Wetterschutz" },
      { id: "pants", name: "Lange Wanderhose" }
    ]
  },
  {
    id: "food",
    title: "Essen & Trinken",
    subtitle: "Energie für den frühen Start",
    icon: "🥨",
    items: [
      { id: "water", name: "Wasser oder warmer Tee", note: "Eine Thermosflasche hält Getränke länger warm." },
      { id: "snack", name: "Snack für unterwegs", note: "Zum Beispiel Banane, Riegel oder Brot." },
      { id: "breakfast", name: "Kleines Frühstück", note: "Optional – perfekt für den Sonnenaufgang." }
    ]
  },
  {
    id: "safety",
    title: "Sicherheit & Kleinkram",
    subtitle: "Die kleinen Dinge nicht vergessen",
    icon: "🧭",
    items: [
      { id: "id", name: "Ausweis und etwas Bargeld" },
      { id: "map", name: "Offline-Karte und Route", note: "Wegverhältnisse und Wetter vorab prüfen." },
      { id: "tissues", name: "Taschentücher" },
      { id: "firstaid", name: "Kleines Erste-Hilfe-Set" },
      { id: "sunscreen", name: "Sonnencreme" },
      { id: "keys", name: "Schlüssel" }
    ]
  }
];

const allItems = categories.flatMap(category => category.items);
const validIds = new Set(allItems.map(item => item.id));

let checkedItems = loadProgress();
let currentFilter = "all";

const checklist = document.getElementById("checklist");
const completedCount = document.getElementById("completed-count");
const totalCount = document.getElementById("total-count");
const progressMessage = document.getElementById("progress-message");
const progressDetail = document.getElementById("progress-detail");
const progressTrack = document.getElementById("progress-track");
const progressFill = document.getElementById("progress-fill");
const visibleCount = document.getElementById("visible-count");
const emptyState = document.getElementById("empty-state");
const showAllButton = document.getElementById("show-all-button");
const resetButton = document.getElementById("reset-button");
const filterButtons = document.querySelectorAll("[data-filter]");

function loadProgress() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return new Set();
    }

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return new Set();
    }

    return new Set(parsed.filter(id => validIds.has(id)));
  } catch (error) {
    console.warn("Der gespeicherte Fortschritt konnte nicht geladen werden.", error);
    return new Set();
  }
}

function saveProgress() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([...checkedItems])
    );
  } catch (error) {
    console.warn("Der Fortschritt konnte nicht gespeichert werden.", error);
  }
}

function getVisibleItems(category) {
  if (currentFilter === "open") {
    return category.items.filter(item => !checkedItems.has(item.id));
  }

  if (currentFilter === "done") {
    return category.items.filter(item => checkedItems.has(item.id));
  }

  return category.items;
}

function createItemElement(item) {
  const label = document.createElement("label");
  label.className = "check-item";
  label.dataset.itemId = item.id;

  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = checkedItems.has(item.id);
  input.setAttribute("aria-label", item.name);

  const checkmark = document.createElement("span");
  checkmark.className = "checkmark";
  checkmark.setAttribute("aria-hidden", "true");
  checkmark.textContent = "✓";

  const copy = document.createElement("span");
  copy.className = "item-copy";

  const name = document.createElement("span");
  name.className = "item-name";
  name.textContent = item.name;

  copy.appendChild(name);

  if (item.note) {
    const note = document.createElement("span");
    note.className = "item-note";
    note.textContent = item.note;
    copy.appendChild(note);
  }

  label.append(input, checkmark, copy);

  if (input.checked) {
    label.classList.add("is-checked");
  }

  input.addEventListener("change", () => {
    if (input.checked) {
      checkedItems.add(item.id);
    } else {
      checkedItems.delete(item.id);
    }

    saveProgress();
    render();
  });

  return label;
}

function createCategoryElement(category, visibleItems) {
  const card = document.createElement("section");
  card.className = "category-card";
  card.setAttribute("aria-labelledby", `heading-${category.id}`);

  const heading = document.createElement("div");
  heading.className = "category-heading";

  const icon = document.createElement("span");
  icon.className = "category-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = category.icon;

  const titleWrapper = document.createElement("div");

  const title = document.createElement("h3");
  title.id = `heading-${category.id}`;
  title.textContent = category.title;

  const subtitle = document.createElement("p");
  subtitle.className = "category-subtitle";
  subtitle.textContent = category.subtitle;

  titleWrapper.append(title, subtitle);

  const count = document.createElement("span");
  count.className = "category-count";

  const completedInCategory = category.items.filter(item =>
    checkedItems.has(item.id)
  ).length;

  count.textContent = `${completedInCategory}/${category.items.length}`;

  heading.append(icon, titleWrapper, count);

  const itemsContainer = document.createElement("div");
  itemsContainer.className = "items";

  visibleItems.forEach(item => {
    itemsContainer.appendChild(createItemElement(item));
  });

  card.append(heading, itemsContainer);
  return card;
}

function render() {
  checklist.replaceChildren();

  let visibleItemsTotal = 0;

  categories.forEach(category => {
    const visibleItems = getVisibleItems(category);

    if (visibleItems.length === 0) {
      return;
    }

    visibleItemsTotal += visibleItems.length;

    checklist.appendChild(
      createCategoryElement(category, visibleItems)
    );
  });

  const completed = checkedItems.size;
  const total = allItems.length;
  const percentage = total === 0
    ? 0
    : Math.round((completed / total) * 100);

  completedCount.textContent = completed;
  totalCount.textContent = total;
  progressFill.style.width = `${percentage}%`;

  progressTrack.setAttribute("aria-valuenow", percentage);
  progressTrack.setAttribute("aria-valuemax", 100);
  progressTrack.setAttribute(
    "aria-valuetext",
    `${percentage} Prozent erledigt`
  );

  if (completed === total) {
    progressMessage.textContent = "Du bist startklar!";
    progressDetail.textContent = "Alles abgehakt – jetzt kann das Abenteuer beginnen.";
  } else if (completed === 0) {
    progressMessage.textContent = "Auf geht's!";
    progressDetail.textContent = "Noch nichts abgehakt – packen wir's an.";
  } else {
    progressMessage.textContent = "Du kommst gut voran!";
    progressDetail.textContent = `${percentage} % geschafft. Es fehlen noch ${total - completed} Gegenstände.`;
  }

  visibleCount.textContent = `${visibleItemsTotal} ${
    visibleItemsTotal === 1 ? "Eintrag" : "Einträge"
  }`;

  emptyState.hidden = visibleItemsTotal !== 0;
  checklist.hidden = visibleItemsTotal === 0;

  if (visibleItemsTotal === 0) {
    const title = emptyState.querySelector("h3");
    const description = emptyState.querySelector("p");

    if (currentFilter === "done") {
      title.textContent = "Noch nichts erledigt";
      description.textContent = "Hake deine ersten Gegenstände ab, dann erscheinen sie hier.";
    } else if (currentFilter === "open") {
      title.textContent = "Alles erledigt!";
      description.textContent = "Du bist bereit für deinen Sonnenaufgang am Berg.";
    } else {
      title.textContent = "Keine Gegenstände";
      description.textContent = "Es sind aktuell keine Gegenstände vorhanden.";
    }
  }

  filterButtons.forEach(button => {
    const isActive = button.dataset.filter === currentFilter;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    render();
  });
});

showAllButton.addEventListener("click", () => {
  currentFilter = "all";
  render();
});

resetButton.addEventListener("click", () => {
  if (checkedItems.size === 0) {
    return;
  }

  const confirmed = window.confirm(
    "Möchtest du wirklich alle Häkchen entfernen?"
  );

  if (!confirmed) {
    return;
  }

  checkedItems.clear();
  saveProgress();
  render();
});

render();
