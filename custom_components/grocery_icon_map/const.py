"""Konstanten für Grocery Icon Map."""

DOMAIN = "grocery_icon_map"
CONF_MAPPINGS = "mappings"
CONF_LABEL = "label"
CONF_ICON = "icon"
DEFAULT_ICON = "mdi:cart-outline"

# Vorschlag beim ersten Einrichten. Rein als Startpunkt gedacht -
# über den Optionen-Dialog frei editierbar, erweiterbar und entfernbar.
DEFAULT_MAPPINGS: dict[str, str] = {
    "Obst": "mdi:food-apple",
    "Gemüse": "mdi:carrot",
    "Milchprodukte": "mdi:cheese",
    "Backwaren": "mdi:bread-slice",
    "Fleisch & Wurst": "mdi:food-steak",
    "Fisch": "mdi:fish",
    "Getränke": "mdi:cup-water",
    "Tiefkühl": "mdi:snowflake",
    "Süßes & Snacks": "mdi:cookie",
    "Trockenwaren & Konserven": "mdi:food-variant",
    "Gewürze & Öle": "mdi:shaker-outline",
    "Drogerie & Hygiene": "mdi:bottle-tonic-outline",
    "Reinigung & Haushalt": "mdi:spray-bottle",
    "Tierbedarf": "mdi:dog-side",
    "Sonstiges": "mdi:cart-outline",
}
