"""Config Flow für Grocery Icon Map.

Bietet:
- Einmaliges Einrichten mit Wahl des Icon-Stils (Emoji Standard, MDI Option)
- Danach über den "Konfigurieren"-Button einen Options-Flow zum
  Hinzufügen/Entfernen von Label -> Icon Zuordnungen (nativer HA-Icon-Picker
  bei MDI, Freitext bei Emoji) sowie zum späteren Wechsel des Icon-Stils.
"""
from __future__ import annotations

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import callback
from homeassistant.helpers import selector

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
    STYLE_EMOJI,
    STYLE_MDI,
)

STYLE_OPTIONS = [
    selector.SelectOptionDict(value=STYLE_EMOJI, label="Emoji (empfohlen)"),
    selector.SelectOptionDict(value=STYLE_MDI, label="MDI-Icons"),
]


class GroceryIconMapConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Ersteinrichtung. Es gibt nur eine Instanz."""

    VERSION = 1

    async def async_step_user(self, user_input: dict | None = None):
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()

        if user_input is not None:
            style = user_input[CONF_ICON_STYLE]
            return self.async_create_entry(
                title="Grocery Icon Map",
                data={CONF_ICON_STYLE: style},
                options={CONF_MAPPINGS: dict(DEFAULT_MAPPINGS_BY_STYLE[style])},
            )

        schema = vol.Schema(
            {
                vol.Required(
                    CONF_ICON_STYLE, default=DEFAULT_ICON_STYLE
                ): selector.SelectSelector(
                    selector.SelectSelectorConfig(options=STYLE_OPTIONS, mode="dropdown")
                )
            }
        )
        return self.async_show_form(step_id="user", data_schema=schema)

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: config_entries.ConfigEntry):
        return GroceryIconMapOptionsFlow()


class GroceryIconMapOptionsFlow(config_entries.OptionsFlow):
    """Verwaltung der Label -> Icon Zuordnungen und des Icon-Stils.

    Kein eigener __init__ mit config_entry-Zuweisung: neuere HA-Core-Versionen
    stellen self.config_entry bereits automatisch bereit (read-only Property).
    """

    def _mappings(self) -> dict[str, dict]:
        return dict(self.config_entry.options.get(CONF_MAPPINGS, {}))

    def _categories(self) -> list[str]:
        cats = set()
        for value in self._mappings().values():
            if isinstance(value, dict) and value.get(CONF_CATEGORY):
                cats.add(value[CONF_CATEGORY])
        cats.add(DEFAULT_CATEGORY)
        return sorted(cats)

    def _style(self) -> str:
        return self.config_entry.data.get(CONF_ICON_STYLE, DEFAULT_ICON_STYLE)

    async def async_step_init(self, user_input: dict | None = None):
        return self.async_show_menu(
            step_id="init",
            menu_options=["add_mapping", "remove_mapping", "change_style"],
        )

    async def async_step_add_mapping(self, user_input: dict | None = None):
        errors: dict[str, str] = {}

        if user_input is not None:
            label = user_input[CONF_LABEL].strip()
            icon = user_input[CONF_ICON].strip()
            category = (user_input.get(CONF_CATEGORY) or DEFAULT_CATEGORY).strip()
            if not label:
                errors["base"] = "empty_label"
            elif not icon:
                errors["base"] = "empty_icon"
            else:
                mappings = self._mappings()
                mappings[label] = {CONF_ICON: icon, CONF_CATEGORY: category or DEFAULT_CATEGORY}
                return self.async_create_entry(
                    title="", data={CONF_MAPPINGS: mappings}
                )

        # Icon-Feld passend zum gewählten Stil: nativer Picker bei MDI,
        # sonst Freitext (Emoji direkt eintippen/einfügen).
        icon_field = (
            selector.IconSelector()
            if self._style() == STYLE_MDI
            else selector.TextSelector()
        )
        schema = vol.Schema(
            {
                vol.Required(CONF_LABEL): selector.TextSelector(),
                vol.Required(CONF_ICON): icon_field,
                vol.Optional(
                    CONF_CATEGORY, default=DEFAULT_CATEGORY
                ): selector.SelectSelector(
                    selector.SelectSelectorConfig(
                        options=self._categories(), mode="dropdown", custom_value=True
                    )
                ),
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

    async def async_step_change_style(self, user_input: dict | None = None):
        if user_input is not None:
            new_style = user_input[CONF_ICON_STYLE]
            # Nur der Stil-Merker und der Card-Fallback ändern sich; bestehende
            # Zuordnungen bleiben unangetastet (der Nutzer kann sie einzeln
            # über "Zuordnung hinzufügen" mit neuen Werten überschreiben).
            self.hass.config_entries.async_update_entry(
                self.config_entry,
                data={**self.config_entry.data, CONF_ICON_STYLE: new_style},
            )
            # Bestehende Zuordnungen unverändert zurückschreiben - sonst
            # würde async_create_entry mit leerem data die Options auf {}
            # zurücksetzen und alle Zuordnungen löschen.
            return self.async_create_entry(
                title="", data={CONF_MAPPINGS: self._mappings()}
            )

        schema = vol.Schema(
            {
                vol.Required(
                    CONF_ICON_STYLE, default=self._style()
                ): selector.SelectSelector(
                    selector.SelectSelectorConfig(options=STYLE_OPTIONS, mode="dropdown")
                )
            }
        )
        return self.async_show_form(step_id="change_style", data_schema=schema)
