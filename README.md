# Grocery Icon Map

All-in-one Home Assistant Integration für eine Einkaufslisten-Karte mit
automatischer Icon-Zuordnung – inklusive der Lovelace-Karte selbst. Eine
einzige HACS-Installation genügt: die Karte wird beim Einrichten der
Integration automatisch als Frontend-Ressource registriert, keine zweite
Installation und keine manuelle Ressourcen-Konfiguration nötig.

## Enthält

- **Config Flow**: GUI-Einrichtung ohne Zugangsdaten
- **Options Flow**: Icon-Zuordnungen hinzufügen/entfernen, inkl. nativem
  HA-Icon-Picker mit Suche
- **15 vorbefüllte Standard-Kategorien** beim ersten Einrichten (frei
  editierbar, erweiterbar, entfernbar)
- **`grocery-icon-card`**: umschaltbares Icon-Raster für beliebige
  `todo`-Entitäten (z. B. Bring!, Mealie), voll bedienbar (abhaken,
  hinzufügen), wird automatisch mitinstalliert

## Installation (via HACS)

1. HACS → Integrationen → drei Punkte oben rechts → **Custom repositories**
2. Repository-URL eintragen, Kategorie **Integration**
3. "Grocery Icon Map" suchen und installieren, HA **neu starten**
4. Einstellungen → Geräte & Dienste → Integration hinzufügen → "Grocery Icon Map"
5. Karte ist jetzt automatisch verfügbar, kein Ressourcen-Eintrag nötig

## Zuordnungen pflegen

Bei der Integration erscheint ein **Konfigurieren**-Button:

- **Zuordnung hinzufügen**: Label (Text) + Icon (nativer HA-Icon-Picker)
- **Zuordnung entfernen**: Auswahl aus bestehenden Labels per Dropdown

Kein Code, kein YAML. Nur beim Hinzufügen/Entfernen wird die Integration
automatisch neu geladen.

## Karte einbinden

```yaml
type: custom:grocery-icon-card
icon_sensor: sensor.grocery_icon_map_zuordnungen
lists:
  - entity: todo.einkaufsliste
    name: Bring
  - entity: todo.mealie_einkaufsliste
    name: Mealie
```

`icon_sensor` ist optional – ohne ihn nutzt die Karte ihre eingebaute
Stichwortliste als Fallback.

## Eigenständige Karte ohne Integration

Wer die Python-Integration nicht möchte, kann die Karte auch komplett
unabhängig nutzen: [grocery-icon-card](https://github.com/RymenTe/grocery-icon-card)
(reines Frontend-Paket, eigener HACS-Eintrag, eingebaute Stichwortliste statt
GUI-Pflege).

## Lizenz

MIT, siehe [LICENSE](LICENSE)
