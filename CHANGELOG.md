# Changelog

## v1.0.1

- Fix: `AttributeError: property 'config_entry' has no setter` beim Öffnen von "Konfigurieren" auf neueren HA-Core-Versionen (eigenes `__init__` im Options Flow entfernt, HA setzt `config_entry` inzwischen selbst)

## v1.0.0

- Erste Veröffentlichung
- GUI-Einrichtung über Config Flow, keine Zugangsdaten nötig
- Options-Flow zum Hinzufügen/Entfernen von Label-Icon-Zuordnungen inkl. nativem HA-Icon-Picker
- 15 vorbefüllte Standard-Kategorien beim ersten Einrichten (frei editierbar)
- Sensor mit Zuordnungen als Attribut, gedacht als Datenquelle für die [Grocery Icon Card](https://github.com/RymenTe/grocery-icon-card)
