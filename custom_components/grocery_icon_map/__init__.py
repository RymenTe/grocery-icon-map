"""Grocery Icon Map Integration.

Bringt die begleitende Lovelace-Karte selbst mit und registriert sie beim
Start automatisch als Frontend-Ressource. Kein zweites HACS-Paket und keine
manuelle Ressourcen-Konfiguration nötig - ein Install genügt. Stellt zudem
Services bereit, über die die Karte selbst (langes Klicken auf einen Artikel)
Zuordnungen anlegen/ändern/entfernen kann, ohne die Options-Flow-UI zu öffnen.
"""
from __future__ import annotations

import json
from pathlib import Path

import voluptuous as vol

from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers import config_validation as cv

from .const import (
    CONF_CATEGORY,
    CONF_ICON,
    CONF_ICON_STYLE,
    CONF_LABEL,
    CONF_MAPPINGS,
    DEFAULT_CATEGORY,
    DEFAULT_ICON_STYLE,
    DEFAULT_MAPPINGS_BY_STYLE,
    DOMAIN,
)

PLATFORMS = ["sensor"]

CARD_FILE = Path(__file__).parent / "www" / "grocery-icon-card.js"
_MANIFEST = json.loads((Path(__file__).parent / "manifest.json").read_text())
_CARD_VERSION = _MANIFEST.get("version", "0")

# Versions-Query-Parameter als Cache-Busting: jede neue Version bekommt
# dadurch automatisch eine neue URL, die Browser/App-WebView/Service-Worker
# zwingend neu laden - ohne das müssten Nutzer nach jedem Update manuell den
# Cache leeren (kam z.B. beim Zugriff via Nabu Casa Remote/Companion-App-
# WebView vor, weil das dort einen eigenen, hartnäckigeren Cache hat als der
# normale Browser). "cache_headers=False" bei der Registrierung allein
# reicht nicht aus, da es nur bedeutet "keine speziellen Header setzen",
# nicht "aktiv nicht cachen".
# Wichtig: die REGISTRIERTE Route braucht den reinen Pfad ohne Query-String
# (aiohttp würde sonst nach einem Pfad suchen, der das "?..." wörtlich
# enthält) - nur die im <script>-Tag verwendete URL bekommt den Parameter.
CARD_PATH = f"/{DOMAIN}_files/grocery-icon-card.js"
CARD_URL = f"{CARD_PATH}?v={_CARD_VERSION}"
CARD_FILE = Path(__file__).parent / "www" / "grocery-icon-card.js"

SERVICE_SET_MAPPING = "set_mapping"
SERVICE_REMOVE_MAPPING = "remove_mapping"

SET_MAPPING_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_LABEL): cv.string,
        vol.Required(CONF_ICON): cv.string,
        vol.Optional(CONF_CATEGORY, default=DEFAULT_CATEGORY): cv.string,
    }
)
REMOVE_MAPPING_SCHEMA = vol.Schema({vol.Required(CONF_LABEL): cv.string})


def _get_entry(hass: HomeAssistant) -> ConfigEntry | None:
    entries = hass.config_entries.async_entries(DOMAIN)
    return entries[0] if entries else None


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    # Absicherung für Entries aus älteren Versionen (vor der Stil-Auswahl)
    # oder falls Optionen aus anderem Grund fehlen: sinnvollen Standardsatz
    # passend zum (ggf. Default-) Icon-Stil vorbefüllen. Der Nutzer kann
    # diese über den Optionen-Dialog jederzeit bearbeiten, ergänzen oder
    # entfernen - dies ist nur der Startpunkt, keine feste Vorgabe.
    if CONF_MAPPINGS not in entry.options:
        style = entry.data.get(CONF_ICON_STYLE, DEFAULT_ICON_STYLE)
        hass.config_entries.async_update_entry(
            entry, options={CONF_MAPPINGS: dict(DEFAULT_MAPPINGS_BY_STYLE[style])}
        )

    # Karte + Services nur einmal pro HA-Laufzeit registrieren, nicht bei
    # jedem Reload (der bei jeder Options-Änderung automatisch ausgelöst
    # wird). Eigener Marker statt hass.data[DOMAIN]-Präsenz, da dieser Key
    # durch die Entry-Verwaltung weiter unten immer existiert.
    if not hass.data.get(f"{DOMAIN}_globals_registered"):
        await hass.http.async_register_static_paths(
            [StaticPathConfig(CARD_PATH, str(CARD_FILE), cache_headers=False)]
        )
        add_extra_js_url(hass, CARD_URL)
        _register_services(hass)
        hass.data[f"{DOMAIN}_globals_registered"] = True

    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = entry
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    entry.async_on_unload(entry.add_update_listener(_update_listener))
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    unloaded = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unloaded:
        hass.data[DOMAIN].pop(entry.entry_id, None)
        # Services/Card-Ressource bewusst NICHT hier entfernen: unload wird
        # bei jeder Options-Änderung (Reload) durchlaufen, nicht nur beim
        # endgültigen Entfernen der Integration. Da nur eine Instanz
        # unterstützt wird, ist ein dauerhaft registrierter Service
        # unschädlich (Handler prüft ohnehin, ob ein Entry existiert).
    return unloaded


async def _update_listener(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Bei Änderung der Optionen (neue/entfernte Zuordnung) neu laden."""
    await hass.config_entries.async_reload(entry.entry_id)


def _register_services(hass: HomeAssistant) -> None:
    async def handle_set_mapping(call: ServiceCall) -> None:
        entry = _get_entry(hass)
        if entry is None:
            return
        mappings = dict(entry.options.get(CONF_MAPPINGS, {}))
        mappings[call.data[CONF_LABEL]] = {
            CONF_ICON: call.data[CONF_ICON],
            CONF_CATEGORY: call.data.get(CONF_CATEGORY) or DEFAULT_CATEGORY,
        }
        hass.config_entries.async_update_entry(
            entry, options={CONF_MAPPINGS: mappings}
        )

    async def handle_remove_mapping(call: ServiceCall) -> None:
        entry = _get_entry(hass)
        if entry is None:
            return
        mappings = dict(entry.options.get(CONF_MAPPINGS, {}))
        mappings.pop(call.data[CONF_LABEL], None)
        hass.config_entries.async_update_entry(
            entry, options={CONF_MAPPINGS: mappings}
        )

    hass.services.async_register(
        DOMAIN, SERVICE_SET_MAPPING, handle_set_mapping, schema=SET_MAPPING_SCHEMA
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_REMOVE_MAPPING,
        handle_remove_mapping,
        schema=REMOVE_MAPPING_SCHEMA,
    )
