"""Grocery Icon Map Integration.

Bringt die begleitende Lovelace-Karte selbst mit und registriert sie beim
Start automatisch als Frontend-Ressource. Kein zweites HACS-Paket und keine
manuelle Ressourcen-Konfiguration nötig - ein Install genügt.
"""
from __future__ import annotations

from pathlib import Path

from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import (
    CONF_ICON_STYLE,
    CONF_MAPPINGS,
    DEFAULT_ICON_STYLE,
    DEFAULT_MAPPINGS_BY_STYLE,
    DOMAIN,
)

PLATFORMS = ["sensor"]

CARD_URL = f"/{DOMAIN}_files/grocery-icon-card.js"
CARD_FILE = Path(__file__).parent / "www" / "grocery-icon-card.js"


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

    # Karte einmalig als statischen Pfad + globale Frontend-Ressource
    # registrieren (Äquivalent zu einer manuell angelegten Lovelace-
    # Ressource, nur automatisch beim Setup der Integration).
    if DOMAIN not in hass.data:
        await hass.http.async_register_static_paths(
            [StaticPathConfig(CARD_URL, str(CARD_FILE), cache_headers=False)]
        )
        add_extra_js_url(hass, CARD_URL)

    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = entry
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    entry.async_on_unload(entry.add_update_listener(_update_listener))
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    unloaded = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unloaded:
        hass.data[DOMAIN].pop(entry.entry_id, None)
    return unloaded


async def _update_listener(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Bei Änderung der Optionen (neue/entfernte Zuordnung) neu laden."""
    await hass.config_entries.async_reload(entry.entry_id)
