/**
 * Grocery Icon Card
 * ------------------
 * Custom Lovelace Card für Home Assistant.
 * Zeigt eine oder mehrere `todo`-Entitäten (z. B. Bring! und Mealie) als
 * Icon-Raster an – ähnlich wie in der Bring!-App oder der Mealie-Weboberfläche.
 * Artikelnamen werden per lokaler Stichwort-Zuordnung automatisch mit einem
 * passenden mdi-Icon versehen (kein Cloud-Dienst, rein clientseitig).
 *
 * Konfiguration (YAML, kein visueller Editor):
 *
 * type: custom:grocery-icon-card
 * icon_sensor: sensor.grocery_icon_map_zuordnungen   # optional, siehe unten
 * lists:
 *   - entity: todo.einkaufsliste
 *     name: Bring
 *     icon: mdi:cart
 *   - entity: todo.mealie_einkaufsliste
 *     name: Mealie
 *     icon: mdi:chef-hat
 *
 * icon_sensor (optional):
 * Wenn die begleitende "Grocery Icon Map"-Integration installiert ist, wird
 * deren Sensor-Attribut `mappings` (Label -> Icon) zusätzlich zur eingebauten
 * Stichwortliste ausgewertet und hat Vorrang. Ohne die Integration
 * funktioniert die Karte unverändert mit der eingebauten Liste.
 *
 * Installation:
 * 1. Diese Datei nach config/www/grocery-icon-card.js kopieren.
 * 2. In Einstellungen -> Dashboards -> Ressourcen:
 *    URL: /local/grocery-icon-card.js, Typ: JavaScript-Modul
 * 3. Karte wie oben im Dashboard einbinden.
 */

// -----------------------------------------------------------------------
// Lokale Stichwort -> Icon Zuordnung (Deutsch, erweiterbar).
// Reihenfolge: längere/spezifischere Stichwörter zuerst prüfen.
// -----------------------------------------------------------------------
const ICON_RULES = [
  // Milchprodukte
  { keys: ["vollmilch", "milch"], icon: "mdi:cup" },
  { keys: ["butter"], icon: "mdi:food-variant" },
  { keys: ["joghurt", "yoghurt"], icon: "mdi:cup-outline" },
  { keys: ["quark"], icon: "mdi:cup-outline" },
  { keys: ["sahne", "schlagsahne"], icon: "mdi:cup-outline" },
  { keys: ["käse", "kaese", "gouda", "emmentaler"], icon: "mdi:cheese" },
  { keys: ["ei", "eier"], icon: "mdi:egg" },
  // Backwaren
  { keys: ["brot", "brötchen", "broetchen", "baguette"], icon: "mdi:bread-slice" },
  { keys: ["croissant"], icon: "mdi:food-croissant" },
  { keys: ["mehl"], icon: "mdi:barley" },
  // Obst
  { keys: ["apfel", "äpfel", "aepfel"], icon: "mdi:food-apple" },
  { keys: ["birne"], icon: "mdi:fruit-pear" },
  { keys: ["banane"], icon: "mdi:food-apple-outline" },
  { keys: ["traube", "weintrauben"], icon: "mdi:fruit-grapes" },
  { keys: ["kirsche"], icon: "mdi:fruit-cherries" },
  { keys: ["zitrone"], icon: "mdi:fruit-citrus" },
  { keys: ["orange", "apfelsine"], icon: "mdi:fruit-citrus" },
  { keys: ["wassermelone"], icon: "mdi:fruit-watermelon" },
  { keys: ["ananas"], icon: "mdi:fruit-pineapple" },
  { keys: ["avocado"], icon: "mdi:food-apple-outline" },
  // Gemüse
  { keys: ["kartoffel"], icon: "mdi:potato" },
  { keys: ["karotte", "möhre", "moehre"], icon: "mdi:carrot" },
  { keys: ["zwiebel"], icon: "mdi:circle-outline" },
  { keys: ["knoblauch"], icon: "mdi:garlic" },
  { keys: ["tomate"], icon: "mdi:fruit-watermelon" },
  { keys: ["salat"], icon: "mdi:food-apple-outline" },
  { keys: ["paprika"], icon: "mdi:chili-mild" },
  { keys: ["gurke"], icon: "mdi:food-apple-outline" },
  { keys: ["pilz", "champignon"], icon: "mdi:mushroom" },
  // Fleisch / Fisch
  { keys: ["hähnchen", "haehnchen", "huhn", "geflügel", "gefluegel"], icon: "mdi:food-drumstick" },
  { keys: ["hackfleisch", "rind", "schwein", "fleisch"], icon: "mdi:food-steak" },
  { keys: ["wurst", "salami", "schinken"], icon: "mdi:sausage" },
  { keys: ["fisch", "lachs", "thunfisch"], icon: "mdi:fish" },
  // Getränke
  { keys: ["wasser", "mineralwasser"], icon: "mdi:cup-water" },
  { keys: ["saft"], icon: "mdi:cup" },
  { keys: ["kaffee"], icon: "mdi:coffee" },
  { keys: ["tee"], icon: "mdi:tea" },
  { keys: ["bier"], icon: "mdi:beer" },
  { keys: ["wein"], icon: "mdi:bottle-wine" },
  // Trockenwaren / Sonstiges
  { keys: ["nudel", "pasta", "spaghetti"], icon: "mdi:pasta" },
  { keys: ["reis"], icon: "mdi:rice" },
  { keys: ["zucker"], icon: "mdi:cube-outline" },
  { keys: ["salz"], icon: "mdi:shaker-outline" },
  { keys: ["öl", "oel", "olivenöl", "olivenoel"], icon: "mdi:oil" },
  { keys: ["schokolade"], icon: "mdi:candy-outline" },
  { keys: ["keks", "kekse", "cookie"], icon: "mdi:cookie" },
  { keys: ["kuchen"], icon: "mdi:cupcake" },
  { keys: ["eis"], icon: "mdi:ice-cream" },
  { keys: ["müsli", "muesli", "cornflakes"], icon: "mdi:bowl-mix" },
  { keys: ["marmelade", "honig"], icon: "mdi:jar" },
  { keys: ["katzenfutter", "hundefutter", "tierfutter"], icon: "mdi:dog-side" },
  { keys: ["toilettenpapier", "klopapier"], icon: "mdi:paper-roll" },
  { keys: ["spülmittel", "spuelmittel", "putzmittel"], icon: "mdi:spray-bottle" },
  { keys: ["waschmittel"], icon: "mdi:washing-machine" },
  { keys: ["zahnpasta", "zahnbürste"], icon: "mdi:tooth" },
];

const DEFAULT_ICON = "mdi:cart-outline";

/**
 * Ermittelt das Icon für einen Artikelnamen.
 * Prüfreihenfolge: externe Zuordnung (aus der Grocery-Icon-Map-Integration,
 * falls vorhanden) -> eingebaute Stichwortliste -> Standard-Icon.
 * @param {string} name Artikelname
 * @param {Object<string,string>|null} externalMappings Label -> Icon, aus dem Sensor
 */
function iconForItem(name, externalMappings) {
  const n = (name || "").toLowerCase();

  if (externalMappings) {
    for (const [label, icon] of Object.entries(externalMappings)) {
      if (label && n.includes(label.toLowerCase())) return icon;
    }
  }

  for (const rule of ICON_RULES) {
    if (rule.keys.some((k) => n.includes(k))) return rule.icon;
  }

  return DEFAULT_ICON;
}

// -----------------------------------------------------------------------
// Custom Element
// -----------------------------------------------------------------------
class GroceryIconCard extends HTMLElement {
  static getStubConfig() {
    return { lists: [{ entity: "todo.einkaufsliste", name: "Liste" }] };
  }

  setConfig(config) {
    if (!config.lists || !config.lists.length) {
      throw new Error("grocery-icon-card: bitte mindestens eine Liste unter 'lists' angeben");
    }
    this._config = config;
    this._activeIndex = 0;
    this._items = [];
    this._buildDom();
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (first) this._fetchItems();
  }

  getCardSize() {
    return 4;
  }

  _buildDom() {
    this.innerHTML = "";
    const card = document.createElement("ha-card");
    card.header = this._config.title || "Einkaufsliste";

    // Tabs zum Umschalten zwischen Listen
    const tabs = document.createElement("div");
    tabs.className = "gic-tabs";
    this._config.lists.forEach((list, idx) => {
      const btn = document.createElement("button");
      btn.className = "gic-tab" + (idx === this._activeIndex ? " active" : "");
      btn.textContent = list.name || list.entity;
      btn.addEventListener("click", () => {
        this._activeIndex = idx;
        this._fetchItems();
      });
      tabs.appendChild(btn);
    });

    // Eingabezeile zum Hinzufügen
    const addRow = document.createElement("div");
    addRow.className = "gic-add-row";
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Artikel hinzufügen …";
    input.className = "gic-input";
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this._addItem(input);
    });
    const addBtn = document.createElement("button");
    addBtn.className = "gic-add-btn";
    addBtn.textContent = "+";
    addBtn.addEventListener("click", () => this._addItem(input));
    addRow.appendChild(input);
    addRow.appendChild(addBtn);

    const grid = document.createElement("div");
    grid.className = "gic-grid";

    const style = document.createElement("style");
    style.textContent = `
      .gic-tabs { display:flex; gap:8px; padding:0 16px 8px; flex-wrap:wrap; }
      .gic-tab { border:none; border-radius:16px; padding:6px 14px; background:var(--secondary-background-color);
                 color:var(--primary-text-color); cursor:pointer; font-size:0.9em; }
      .gic-tab.active { background:var(--primary-color); color:var(--text-primary-color, #fff); }
      .gic-add-row { display:flex; gap:8px; padding:0 16px 12px; }
      .gic-input { flex:1; padding:8px 10px; border-radius:8px; border:1px solid var(--divider-color);
                   background:var(--card-background-color); color:var(--primary-text-color); }
      .gic-add-btn { border:none; border-radius:8px; padding:0 16px; background:var(--primary-color);
                     color:var(--text-primary-color, #fff); font-size:1.2em; cursor:pointer; }
      .gic-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(84px,1fr)); gap:10px; padding:0 16px 16px; }
      .gic-item { display:flex; flex-direction:column; align-items:center; gap:4px; cursor:pointer;
                  padding:8px 4px; border-radius:12px; background:var(--secondary-background-color); text-align:center; }
      .gic-item.done { opacity:0.45; }
      .gic-item ha-icon { --mdc-icon-size:28px; color:var(--primary-color); }
      .gic-item span { font-size:0.78em; color:var(--primary-text-color); word-break:break-word; }
      .gic-empty { padding:16px; text-align:center; color:var(--secondary-text-color); }
    `;

    card.appendChild(style);
    card.appendChild(tabs);
    card.appendChild(addRow);
    card.appendChild(grid);
    this.appendChild(card);

    this._tabsEl = tabs;
    this._gridEl = grid;
  }

  _externalMappings() {
    const entityId = this._config.icon_sensor;
    if (!entityId || !this._hass) return null;
    const state = this._hass.states[entityId];
    if (!state) return null;
    return state.attributes.mappings || null;
  }

  async _fetchItems() {
    if (!this._hass || !this._config) return;
    Array.from(this._tabsEl.children).forEach((btn, idx) =>
      btn.classList.toggle("active", idx === this._activeIndex)
    );
    const entity = this._config.lists[this._activeIndex].entity;
    try {
      const res = await this._hass.callWS({ type: "todo/item/list", entity_id: entity });
      this._items = (res.items || []).filter((i) => i.status !== "completed");
    } catch (e) {
      this._items = [];
    }
    this._renderItems();
  }

  _renderItems() {
    this._gridEl.innerHTML = "";
    if (!this._items.length) {
      const empty = document.createElement("div");
      empty.className = "gic-empty";
      empty.textContent = "Liste ist leer";
      this._gridEl.appendChild(empty);
      return;
    }
    this._items.forEach((item) => {
      const tile = document.createElement("div");
      tile.className = "gic-item";
      const icon = document.createElement("ha-icon");
      icon.setAttribute("icon", iconForItem(item.summary, this._externalMappings()));
      const label = document.createElement("span");
      label.textContent = item.summary;
      tile.appendChild(icon);
      tile.appendChild(label);
      tile.addEventListener("click", () => this._toggleItem(item));
      this._gridEl.appendChild(tile);
    });
  }

  async _toggleItem(item) {
    const entity = this._config.lists[this._activeIndex].entity;
    await this._hass.callService("todo", "update_item", {
      entity_id: entity,
      item: item.uid || item.summary,
      status: "completed",
    });
    this._fetchItems();
  }

  async _addItem(input) {
    const value = input.value.trim();
    if (!value) return;
    const entity = this._config.lists[this._activeIndex].entity;
    await this._hass.callService("todo", "add_item", {
      entity_id: entity,
      item: value,
    });
    input.value = "";
    this._fetchItems();
  }
}

customElements.define("grocery-icon-card", GroceryIconCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "grocery-icon-card",
  name: "Grocery Icon Card",
  description: "Einkaufsliste(n) mit automatischer Icon-Zuordnung, umschaltbar, bedienbar",
});
