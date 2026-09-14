/**
 * Grocery Icon Card
 * ------------------
 * Custom Lovelace Card für Home Assistant.
 * Zeigt eine oder mehrere `todo`-Entitäten (z. B. Bring! und Mealie) als
 * umschaltbares Icon-Raster an. Artikel werden automatisch mit einem Symbol
 * versehen - standardmäßig per Emoji (volle Lebensmittel-Abdeckung, kein
 * Download, keine Lizenz), optional per MDI-Icon. Rein clientseitig.
 *
 * Konfiguration (YAML, kein visueller Editor):
 *
 * type: custom:grocery-icon-card
 * icon_sensor: sensor.grocery_icon_map_zuordnungen   # optional
 * icon_style: emoji   # "emoji" (Standard) oder "mdi" - nur Fallback, siehe unten
 * default_view: flat   # "flat" (Standard) oder "category" - Startansicht beim Laden
 * lists:
 *   - entity: todo.einkaufsliste
 *     name: Bring
 *   - entity: todo.mealie_einkaufsliste
 *     name: Mealie
 *
 * icon_sensor (optional):
 * Wenn die begleitende "Grocery Icon Map"-Integration installiert ist, wird
 * deren Sensor-Attribut `mappings` (Label -> {icon, category}) zusätzlich zur
 * eingebauten Stichwortliste ausgewertet und hat Vorrang. Icon-Werte mit
 * "mdi:"-Präfix werden als MDI-Icon gerendert, alles andere als Emoji-Text.
 * Ältere Versionen mit reinen String-Werten (Label -> Icon) werden weiterhin
 * unterstützt. Liefert der Sensor ein Attribut `icon_style`, hat das Vorrang
 * vor der Karten-Konfiguration.
 *
 * icon_style (optional, Standard "emoji"):
 * Legt fest, welche eingebaute Stichwortliste als Fallback dient, wenn weder
 * externe Zuordnung noch etwas anderes passt: Emoji (Standard, deckt so gut
 * wie alle Lebensmittel ab) oder MDI (dort, wo es keine Emoji-Entsprechung
 * gibt oder rein MDI gewünscht ist - dann greift für unbekannte Artikel immer
 * das MDI-Fallback-Icon "mdi:cart-outline", nie ein Emoji).
 *
 * Installation:
 * 1. Diese Datei nach config/www/grocery-icon-card.js kopieren.
 * 2. In Einstellungen -> Dashboards -> Ressourcen:
 *    URL: /local/grocery-icon-card.js, Typ: JavaScript-Modul
 * 3. Karte wie oben im Dashboard einbinden.
 */

// -----------------------------------------------------------------------
// Lokale Stichwort -> Symbol Zuordnung (Deutsch, erweiterbar), je einmal für
// Emoji (Standard) und MDI (Option). Gleiche Reihenfolge/Keys in beiden.
// -----------------------------------------------------------------------
const ICON_RULES_EMOJI = [
  { keys: ["vollmilch", "milch"], icon: "🥛" },
  { keys: ["butter"], icon: "🧈" },
  { keys: ["joghurt", "yoghurt", "quark", "müsli", "muesli", "cornflakes"], icon: "🥣" },
  { keys: ["sahne", "schlagsahne"], icon: "🥛" },
  { keys: ["käse", "kaese", "gouda", "emmentaler"], icon: "🧀" },
  { keys: ["ei", "eier"], icon: "🥚" },
  { keys: ["brot", "brötchen", "broetchen", "baguette"], icon: "🍞" },
  { keys: ["croissant"], icon: "🥐" },
  { keys: ["mehl"], icon: "🌾" },
  { keys: ["apfel", "äpfel", "aepfel"], icon: "🍎" },
  { keys: ["birne"], icon: "🍐" },
  { keys: ["banane"], icon: "🍌" },
  { keys: ["traube", "weintrauben"], icon: "🍇" },
  { keys: ["kirsche"], icon: "🍒" },
  { keys: ["zitrone"], icon: "🍋" },
  { keys: ["orange", "apfelsine"], icon: "🍊" },
  { keys: ["wassermelone"], icon: "🍉" },
  { keys: ["ananas"], icon: "🍍" },
  { keys: ["avocado"], icon: "🥑" },
  { keys: ["kartoffel"], icon: "🥔" },
  { keys: ["karotte", "möhre", "moehre"], icon: "🥕" },
  { keys: ["zwiebel"], icon: "🧅" },
  { keys: ["knoblauch"], icon: "🧄" },
  { keys: ["tomate"], icon: "🍅" },
  { keys: ["salat"], icon: "🥬" },
  { keys: ["paprika"], icon: "🫑" },
  { keys: ["gurke"], icon: "🥒" },
  { keys: ["pilz", "champignon"], icon: "🍄" },
  { keys: ["hähnchen", "haehnchen", "huhn", "geflügel", "gefluegel"], icon: "🍗" },
  { keys: ["hackfleisch", "rind", "schwein", "fleisch"], icon: "🥩" },
  { keys: ["wurst", "salami", "schinken"], icon: "🌭" },
  { keys: ["fisch", "lachs", "thunfisch"], icon: "🐟" },
  { keys: ["wasser", "mineralwasser"], icon: "💧" },
  { keys: ["saft"], icon: "🧃" },
  { keys: ["kaffee"], icon: "☕" },
  { keys: ["tee"], icon: "🍵" },
  { keys: ["bier"], icon: "🍺" },
  { keys: ["wein"], icon: "🍷" },
  { keys: ["nudel", "pasta", "spaghetti"], icon: "🍝" },
  { keys: ["reis"], icon: "🍚" },
  { keys: ["zucker"], icon: "🧊" },
  { keys: ["salz"], icon: "🧂" },
  { keys: ["öl", "oel", "olivenöl", "olivenoel"], icon: "🫒" },
  { keys: ["schokolade"], icon: "🍫" },
  { keys: ["keks", "kekse", "cookie"], icon: "🍪" },
  { keys: ["kuchen"], icon: "🍰" },
  { keys: ["eis"], icon: "🍨" },
  { keys: ["marmelade", "honig"], icon: "🍯" },
  { keys: ["katzenfutter", "hundefutter", "tierfutter"], icon: "🐾" },
  { keys: ["toilettenpapier", "klopapier"], icon: "🧻" },
  { keys: ["spülmittel", "spuelmittel", "putzmittel"], icon: "🧽" },
  { keys: ["waschmittel"], icon: "🧴" },
  { keys: ["zahnpasta", "zahnbürste"], icon: "🪥" },
];

const ICON_RULES_MDI = [
  { keys: ["vollmilch", "milch"], icon: "mdi:cup" },
  { keys: ["butter"], icon: "mdi:food-variant" },
  { keys: ["joghurt", "yoghurt", "quark", "müsli", "muesli", "cornflakes"], icon: "mdi:bowl-mix" },
  { keys: ["sahne", "schlagsahne"], icon: "mdi:cup-outline" },
  { keys: ["käse", "kaese", "gouda", "emmentaler"], icon: "mdi:cheese" },
  { keys: ["ei", "eier"], icon: "mdi:egg" },
  { keys: ["brot", "brötchen", "broetchen", "baguette"], icon: "mdi:bread-slice" },
  { keys: ["croissant"], icon: "mdi:food-croissant" },
  { keys: ["mehl"], icon: "mdi:barley" },
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
  { keys: ["kartoffel"], icon: "mdi:sack-outline" },
  { keys: ["karotte", "möhre", "moehre"], icon: "mdi:carrot" },
  { keys: ["zwiebel"], icon: "mdi:circle-outline" },
  { keys: ["knoblauch"], icon: "mdi:circle-outline" },
  { keys: ["tomate"], icon: "mdi:fruit-watermelon" },
  { keys: ["salat"], icon: "mdi:food-apple-outline" },
  { keys: ["paprika"], icon: "mdi:chili-mild" },
  { keys: ["gurke"], icon: "mdi:food-apple-outline" },
  { keys: ["pilz", "champignon"], icon: "mdi:mushroom" },
  { keys: ["hähnchen", "haehnchen", "huhn", "geflügel", "gefluegel"], icon: "mdi:food-drumstick" },
  { keys: ["hackfleisch", "rind", "schwein", "fleisch"], icon: "mdi:food-steak" },
  { keys: ["wurst", "salami", "schinken"], icon: "mdi:sausage" },
  { keys: ["fisch", "lachs", "thunfisch"], icon: "mdi:fish" },
  { keys: ["wasser", "mineralwasser"], icon: "mdi:cup-water" },
  { keys: ["saft"], icon: "mdi:cup" },
  { keys: ["kaffee"], icon: "mdi:coffee" },
  { keys: ["tee"], icon: "mdi:tea" },
  { keys: ["bier"], icon: "mdi:beer" },
  { keys: ["wein"], icon: "mdi:bottle-wine" },
  { keys: ["nudel", "pasta", "spaghetti"], icon: "mdi:pasta" },
  { keys: ["reis"], icon: "mdi:rice" },
  { keys: ["zucker"], icon: "mdi:cube-outline" },
  { keys: ["salz"], icon: "mdi:shaker-outline" },
  { keys: ["öl", "oel", "olivenöl", "olivenoel"], icon: "mdi:oil" },
  { keys: ["schokolade"], icon: "mdi:candy-outline" },
  { keys: ["keks", "kekse", "cookie"], icon: "mdi:cookie" },
  { keys: ["kuchen"], icon: "mdi:cupcake" },
  { keys: ["eis"], icon: "mdi:ice-cream" },
  { keys: ["marmelade", "honig"], icon: "mdi:beehive-outline" },
  { keys: ["katzenfutter", "hundefutter", "tierfutter"], icon: "mdi:dog-side" },
  { keys: ["toilettenpapier", "klopapier"], icon: "mdi:paper-roll" },
  { keys: ["spülmittel", "spuelmittel", "putzmittel"], icon: "mdi:spray-bottle" },
  { keys: ["waschmittel"], icon: "mdi:washing-machine" },
  { keys: ["zahnpasta", "zahnbürste"], icon: "mdi:tooth" },
];

const DEFAULT_ICON_BY_STYLE = { emoji: "🛒", mdi: "mdi:cart-outline" };
const DEFAULT_CATEGORY = "Sonstiges";

/** Rendert einen Icon-/Emoji-Wert in ein DOM-Element. */
function renderIcon(value) {
  if (value && value.startsWith("mdi:")) {
    const el = document.createElement("ha-icon");
    el.setAttribute("icon", value);
    return el;
  }
  const el = document.createElement("span");
  el.className = "gic-emoji";
  el.textContent = value;
  return el;
}

/**
 * Bewertet alle Kandidaten-Stichwörter gegen den (bereits kleingeschriebenen)
 * Artikeltext und liefert den besten Treffer statt des ersten.
 *
 * Angelehnt an das Scoring-Prinzip aus rynecoop/ha-grocery-learning
 * (item_logic.category_for_term): mehrteilige/längere Stichwörter sind
 * spezifischer und gewinnen, ein zusätzlicher Bonus für einen Treffer am
 * ENDE des Artikeltextes bricht Gleichstände zugunsten des Grundworts -
 * im Deutschen sitzt das Grundwort bei Komposita meist am Wortende
 * ("Kirschtomate" -> "Tomate" statt "Kirsch", "Pilzsuppe" -> "Suppe"
 * statt "Pilz"), anders als im englischen Original (dort: letztes Token
 * der Phrase). Bei Punktgleichstand gewinnt der zuerst übergebene Eintrag.
 *
 * @param {string} n Bereits kleingeschriebener Artikeltext
 * @param {Iterable<any>} entries Kandidaten (z.B. Object.entries(mappings) oder ICON_RULES)
 * @param {(entry: any) => string[]} getKeys Liefert die zu prüfenden Stichwörter für einen Kandidaten
 * @returns {{entry: any, key: string}|null}
 */
function bestKeyMatch(n, entries, getKeys) {
  let best = null;
  let bestKey = "";
  let bestScore = -1;
  for (const entry of entries) {
    for (const rawKey of getKeys(entry)) {
      const key = (rawKey || "").toLowerCase();
      if (!key || !n.includes(key)) continue;
      let score = key.length * 2;
      if (n.endsWith(key)) score += 5; // Grundwort-Bonus (siehe oben)
      if (score > bestScore) {
        bestScore = score;
        best = entry;
        bestKey = key;
      }
    }
  }
  return best ? { entry: best, key: bestKey } : null;
}

/**
 * Ermittelt Icon, Kategorie UND das zugrundeliegende Label für einen
 * Artikelnamen. Prüfreihenfolge: externe Zuordnung (Label -> {icon,
 * category} aus der Grocery-Icon-Map-Integration, falls vorhanden) ->
 * eingebaute Stichwortliste -> Standard. Bei mehreren passenden Stichwörtern
 * gewinnt jeweils das spezifischste (siehe bestKeyMatch), nicht einfach das
 * zuerst gefundene.
 * @returns {{icon: string, category: string, label: string}}
 */
function resolveItem(name, externalMappings, style) {
  const n = (name || "").toLowerCase();

  if (externalMappings) {
    const match = bestKeyMatch(n, Object.entries(externalMappings), ([label]) => [label]);
    if (match) {
      const [label, value] = match.entry;
      // Abwärtskompatibel: ältere Versionen speicherten nur einen reinen
      // Icon-String je Label statt {icon, category}.
      if (typeof value === "string") return { icon: value, category: label, label };
      return { icon: value.icon, category: value.category || label, label };
    }
  }

  const rules = style === "mdi" ? ICON_RULES_MDI : ICON_RULES_EMOJI;
  const ruleMatch = bestKeyMatch(n, rules, (rule) => rule.keys);
  if (ruleMatch) {
    return { icon: ruleMatch.entry.icon, category: DEFAULT_CATEGORY, label: ruleMatch.key };
  }

  return {
    icon: DEFAULT_ICON_BY_STYLE[style] || DEFAULT_ICON_BY_STYLE.emoji,
    category: DEFAULT_CATEGORY,
    label: name || "",
  };
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
    // Standardansicht per Config einstellbar: "category" oder "flat" (Standard).
    this._groupByCategory = config.default_view === "category";
    this._lastMappingsSnapshot = null;
    this._buildDom();
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;

    // Reagiert automatisch auf Änderungen am icon_sensor - egal ob durch
    // eigenen Service-Call (langes Klicken), die Options-Flow-UI der
    // Integration, oder irgendeine andere Quelle. Ohne das bliebe die Karte
    // nach einer Bearbeitung auf altem Stand, bis irgendeine andere Aktion
    // ein Neu-Rendern auslöst.
    const entityId = this._config && this._config.icon_sensor;
    if (entityId) {
      const state = hass.states[entityId];
      const snapshot = state ? JSON.stringify(state.attributes) : null;
      if (!first && snapshot !== this._lastMappingsSnapshot && this._items.length) {
        this._renderItems();
      }
      this._lastMappingsSnapshot = snapshot;
    }

    if (first) this._fetchItems();
  }

  getCardSize() {
    return 4;
  }

  _iconStyle() {
    const entityId = this._config.icon_sensor;
    if (entityId && this._hass) {
      const state = this._hass.states[entityId];
      if (state && state.attributes.icon_style) return state.attributes.icon_style;
    }
    return this._config.icon_style === "mdi" ? "mdi" : "emoji";
  }

  _buildDom() {
    this.innerHTML = "";
    const card = document.createElement("ha-card");
    card.header = this._config.title || "Einkaufsliste";

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

    // Umschalter Flach / Nach Kategorie
    const viewToggle = document.createElement("button");
    viewToggle.className = "gic-view-toggle";
    viewToggle.textContent = "Nach Kategorie";
    viewToggle.addEventListener("click", () => {
      this._groupByCategory = !this._groupByCategory;
      viewToggle.classList.toggle("active", this._groupByCategory);
      viewToggle.textContent = this._groupByCategory ? "Liste (flach)" : "Nach Kategorie";
      this._renderItems();
    });
    tabs.appendChild(viewToggle);

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

    const container = document.createElement("div");
    container.className = "gic-container";

    const style = document.createElement("style");
    style.textContent = `
      ha-card { position: relative; }
      .gic-tabs { display:flex; gap:8px; padding:0 16px 8px; flex-wrap:wrap; align-items:center; }
      .gic-tab, .gic-view-toggle { border:none; border-radius:16px; padding:6px 14px; background:var(--secondary-background-color);
                 color:var(--primary-text-color); cursor:pointer; font-size:0.9em; }
      .gic-tab.active, .gic-view-toggle.active { background:var(--primary-color); color:var(--text-primary-color, #fff); }
      .gic-view-toggle { margin-left:auto; }
      .gic-add-row { display:flex; gap:8px; padding:0 16px 12px; }
      .gic-input { flex:1; padding:8px 10px; border-radius:8px; border:1px solid var(--divider-color);
                   background:var(--card-background-color); color:var(--primary-text-color); }
      .gic-add-btn { border:none; border-radius:8px; padding:0 16px; background:var(--primary-color);
                     color:var(--text-primary-color, #fff); font-size:1.2em; cursor:pointer; }
      .gic-category { padding:0 16px; margin-bottom:8px; }
      .gic-category h3 { font-size:0.85em; color:var(--secondary-text-color); margin:0 0 8px; text-transform:uppercase; letter-spacing:0.04em; }
      .gic-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(84px,1fr)); gap:10px; padding:0 16px 16px; }
      .gic-item { display:flex; flex-direction:column; align-items:center; gap:4px; cursor:pointer;
                  padding:8px 4px; border-radius:12px; background:var(--secondary-background-color); text-align:center; }
      .gic-item.done { opacity:0.45; }
      .gic-item ha-icon { --mdc-icon-size:28px; color:var(--primary-color); }
      .gic-item .gic-emoji { font-size:28px; line-height:1; }
      .gic-item span:not(.gic-emoji) { font-size:0.78em; color:var(--primary-text-color); word-break:break-word; }
      .gic-empty { padding:16px; text-align:center; color:var(--secondary-text-color); }
      .gic-overlay { position:absolute; inset:0; background:rgba(0,0,0,0.5); display:flex;
                     align-items:center; justify-content:center; z-index:10; border-radius:inherit; }
      .gic-dialog { background:var(--card-background-color); border-radius:12px; padding:16px;
                    width:min(320px, 90%); box-shadow:0 4px 16px rgba(0,0,0,0.3); }
      .gic-dialog h3 { margin:0 0 12px; color:var(--primary-text-color); font-size:1.1em; }
      .gic-dialog-field { display:flex; flex-direction:column; gap:4px; margin-bottom:10px; }
      .gic-dialog-field label { font-size:0.8em; color:var(--secondary-text-color); }
      .gic-dialog-field input { padding:8px 10px; border-radius:8px; border:1px solid var(--divider-color);
                                 background:var(--secondary-background-color); color:var(--primary-text-color); }
      .gic-dialog-actions { display:flex; justify-content:flex-end; gap:8px; margin-top:8px; flex-wrap:wrap; }
      .gic-dialog-btn { border:none; border-radius:8px; padding:8px 14px; cursor:pointer; font-size:0.9em;
                         background:var(--secondary-background-color); color:var(--primary-text-color); }
      .gic-dialog-save { background:var(--primary-color); color:var(--text-primary-color, #fff); }
      .gic-dialog-delete { background:var(--error-color, #b71c1c); color:#fff; margin-right:auto; }
    `;

    card.appendChild(style);
    card.appendChild(tabs);
    card.appendChild(addRow);
    card.appendChild(container);
    this.appendChild(card);

    this._tabsEl = tabs;
    this._containerEl = container;
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
    Array.from(this._tabsEl.children).forEach((btn, idx) => {
      if (idx < this._config.lists.length) btn.classList.toggle("active", idx === this._activeIndex);
    });
    const entity = this._config.lists[this._activeIndex].entity;
    try {
      const res = await this._hass.callWS({ type: "todo/item/list", entity_id: entity });
      this._items = (res.items || []).filter((i) => i.status !== "completed");
    } catch (e) {
      this._items = [];
    }
    this._renderItems();
  }

  _makeTile(item) {
    const resolved = resolveItem(item.summary, this._externalMappings(), this._iconStyle());
    const tile = document.createElement("div");
    tile.className = "gic-item";
    tile.appendChild(renderIcon(resolved.icon));
    const label = document.createElement("span");
    label.textContent = item.summary;
    tile.appendChild(label);

    // Kurzer Tap = abhaken, langes Klicken/Halten (~500ms) = Icon-Zuordnung
    // bearbeiten. Nur ein Listener-Paar (Pointer-Events), kein separates
    // "click", um Doppelauslösung zu vermeiden.
    let pressTimer = null;
    let longPressFired = false;
    tile.addEventListener("pointerdown", () => {
      longPressFired = false;
      pressTimer = setTimeout(() => {
        longPressFired = true;
        this._openEditDialog(resolved);
      }, 500);
    });
    const cancelPress = () => {
      if (pressTimer) clearTimeout(pressTimer);
    };
    tile.addEventListener("pointerup", () => {
      cancelPress();
      if (!longPressFired) this._toggleItem(item);
    });
    tile.addEventListener("pointerleave", cancelPress);
    tile.addEventListener("pointercancel", cancelPress);

    return { tile, category: resolved.category };
  }

  /**
   * Öffnet ein kleines Formular (Label/Icon/Kategorie), identisch zu "Zuordnung
   * hinzufügen" der Integration, vorbefüllt mit dem aktuell greifenden Wert.
   * Setzt icon_sensor voraus - ohne Integration gibt es nichts zu speichern.
   */
  _openEditDialog(resolved) {
    if (!this._config.icon_sensor) {
      alert(
        "Bearbeiten braucht die Grocery-Icon-Map-Integration (icon_sensor in der Karten-Config)."
      );
      return;
    }

    const overlay = document.createElement("div");
    overlay.className = "gic-overlay";

    const box = document.createElement("div");
    box.className = "gic-dialog";

    const title = document.createElement("h3");
    title.textContent = "Zuordnung bearbeiten";
    box.appendChild(title);

    const labelInput = this._dialogField(box, "Label", resolved.label);
    const iconInput = this._dialogField(box, "Icon (mdi:... oder Emoji)", resolved.icon);
    const categoryInput = this._dialogField(box, "Kategorie", resolved.category);

    const actions = document.createElement("div");
    actions.className = "gic-dialog-actions";

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "gic-dialog-btn gic-dialog-delete";
    deleteBtn.textContent = "Entfernen";
    deleteBtn.addEventListener("click", async () => {
      await this._hass.callService("grocery_icon_map", "remove_mapping", {
        label: labelInput.value.trim(),
      });
      this._closeDialog(overlay);
    });

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "gic-dialog-btn";
    cancelBtn.textContent = "Abbrechen";
    cancelBtn.addEventListener("click", () => this._closeDialog(overlay));

    const saveBtn = document.createElement("button");
    saveBtn.className = "gic-dialog-btn gic-dialog-save";
    saveBtn.textContent = "Speichern";
    saveBtn.addEventListener("click", async () => {
      const label = labelInput.value.trim();
      const icon = iconInput.value.trim();
      if (!label || !icon) return;
      await this._hass.callService("grocery_icon_map", "set_mapping", {
        label,
        icon,
        category: categoryInput.value.trim() || "Sonstiges",
      });
      this._closeDialog(overlay);
    });

    actions.appendChild(deleteBtn);
    actions.appendChild(cancelBtn);
    actions.appendChild(saveBtn);
    box.appendChild(actions);
    overlay.appendChild(box);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) this._closeDialog(overlay);
    });
    this.querySelector("ha-card").appendChild(overlay);
  }

  _dialogField(container, labelText, value) {
    const wrap = document.createElement("div");
    wrap.className = "gic-dialog-field";
    const lbl = document.createElement("label");
    lbl.textContent = labelText;
    const input = document.createElement("input");
    input.type = "text";
    input.value = value || "";
    wrap.appendChild(lbl);
    wrap.appendChild(input);
    container.appendChild(wrap);
    return input;
  }

  _closeDialog(overlay) {
    overlay.remove();
    // Kein manuelles Timeout mehr nötig - der hass-Setter erkennt die
    // geänderten Sensor-Attribute automatisch, sobald sie ankommen, und
    // rendert dann neu (siehe set hass() oben).
  }

  _renderItems() {
    this._containerEl.innerHTML = "";
    if (!this._items.length) {
      const empty = document.createElement("div");
      empty.className = "gic-empty";
      empty.textContent = "Liste ist leer";
      this._containerEl.appendChild(empty);
      return;
    }

    if (!this._groupByCategory) {
      const grid = document.createElement("div");
      grid.className = "gic-grid";
      this._items.forEach((item) => grid.appendChild(this._makeTile(item).tile));
      this._containerEl.appendChild(grid);
      return;
    }

    const groups = new Map();
    this._items.forEach((item) => {
      const { tile, category } = this._makeTile(item);
      if (!groups.has(category)) groups.set(category, []);
      groups.get(category).push(tile);
    });
    // Sonstiges ans Ende
    const sortedKeys = [...groups.keys()].sort((a, b) => {
      if (a === DEFAULT_CATEGORY) return 1;
      if (b === DEFAULT_CATEGORY) return -1;
      return a.localeCompare(b, "de");
    });
    sortedKeys.forEach((cat) => {
      const section = document.createElement("div");
      section.className = "gic-category";
      const h3 = document.createElement("h3");
      h3.textContent = cat;
      const grid = document.createElement("div");
      grid.className = "gic-grid";
      groups.get(cat).forEach((tile) => grid.appendChild(tile));
      section.appendChild(h3);
      section.appendChild(grid);
      this._containerEl.appendChild(section);
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

if (!customElements.get("grocery-icon-card")) {
  customElements.define("grocery-icon-card", GroceryIconCard);

  window.customCards = window.customCards || [];
  window.customCards.push({
    type: "grocery-icon-card",
    name: "Grocery Icon Card",
    description: "Einkaufsliste(n) mit automatischer Emoji/MDI-Zuordnung, Kategorie-Ansicht, umschaltbar, bedienbar",
  });
}
