"""Sensor, der alle Label -> Icon Zuordnungen als Attribut bereitstellt."""
from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import EntityCategory
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.components.sensor import SensorEntity

from .const import CONF_ICON_STYLE, CONF_MAPPINGS, DEFAULT_ICON_STYLE, DOMAIN


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    async_add_entities([GroceryIconMapSensor(entry)])


class GroceryIconMapSensor(SensorEntity):
    """Hält die aktuelle Label -> Icon Zuordnung als Attribut vor.

    Die Lovelace-Karte liest diesen Sensor aus (Attribut `mappings`) statt
    einer im JS hart codierten Liste.
    """

    _attr_has_entity_name = True
    _attr_name = "Zuordnungen"
    _attr_icon = "mdi:cart-outline"
    _attr_entity_category = EntityCategory.DIAGNOSTIC

    def __init__(self, entry: ConfigEntry) -> None:
        self._entry = entry
        self._attr_unique_id = f"{DOMAIN}_{entry.entry_id}_mappings"
        self._attr_device_info = {
            "identifiers": {(DOMAIN, entry.entry_id)},
            "name": "Grocery Icon Map",
            "manufacturer": "Selbst gebaut",
        }

    @property
    def native_value(self) -> int:
        return len(self._entry.options.get(CONF_MAPPINGS, {}))

    @property
    def extra_state_attributes(self) -> dict:
        return {
            "mappings": self._entry.options.get(CONF_MAPPINGS, {}),
            "icon_style": self._entry.data.get(CONF_ICON_STYLE, DEFAULT_ICON_STYLE),
        }
