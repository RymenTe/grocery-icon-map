"""Config Flow für Grocery Icon Map.

Bietet:
- Einmaliges Einrichten der Integration über Einstellungen -> Geräte & Dienste
- Danach über den "Konfigurieren"-Button einen Options-Flow zum
  Hinzufügen/Entfernen von Label -> Icon Zuordnungen, inkl. nativem
  HA-Icon-Picker (selector.IconSelector).
"""
from __future__ import annotations

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import callback
from homeassistant.helpers import selector

from .const import CONF_ICON, CONF_LABEL, CONF_MAPPINGS, DOMAIN


class GroceryIconMapConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Ersteinrichtung. Es gibt nur eine Instanz."""

    VERSION = 1

    async def async_step_user(self, user_input: dict | None = None):
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()

        if user_input is not None:
            return self.async_create_entry(title="Grocery Icon Map", data={})

        return self.async_show_form(step_id="user")

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: config_entries.ConfigEntry):
        return GroceryIconMapOptionsFlow()


class GroceryIconMapOptionsFlow(config_entries.OptionsFlow):
    """Verwaltung der Label -> Icon Zuordnungen.

    Kein eigener __init__ mit config_entry-Zuweisung: neuere HA-Core-Versionen
    stellen self.config_entry bereits automatisch bereit (read-only Property).
    """

    def _mappings(self) -> dict[str, str]:
        return dict(self.config_entry.options.get(CONF_MAPPINGS, {}))

    async def async_step_init(self, user_input: dict | None = None):
        return self.async_show_menu(
            step_id="init",
            menu_options=["add_mapping", "remove_mapping"],
        )

    async def async_step_add_mapping(self, user_input: dict | None = None):
        errors: dict[str, str] = {}

        if user_input is not None:
            label = user_input[CONF_LABEL].strip()
            if not label:
                errors["base"] = "empty_label"
            else:
                mappings = self._mappings()
                mappings[label] = user_input[CONF_ICON]
                return self.async_create_entry(
                    title="", data={CONF_MAPPINGS: mappings}
                )

        schema = vol.Schema(
            {
                vol.Required(CONF_LABEL): selector.TextSelector(),
                vol.Required(CONF_ICON): selector.IconSelector(),
            }
        )
        return self.async_show_form(
            step_id="add_mapping", data_schema=schema, errors=errors
        )

    async def async_step_remove_mapping(self, user_input: dict | None = None):
        mappings = self._mappings()
        if not mappings:
            return self.async_abort(reason="no_mappings")

        if user_input is not None:
            mappings.pop(user_input[CONF_LABEL], None)
            return self.async_create_entry(title="", data={CONF_MAPPINGS: mappings})

        schema = vol.Schema(
            {
                vol.Required(CONF_LABEL): selector.SelectSelector(
                    selector.SelectSelectorConfig(
                        options=sorted(mappings.keys()), mode="dropdown"
                    )
                )
            }
        )
        return self.async_show_form(step_id="remove_mapping", data_schema=schema)
