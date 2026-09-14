# Changelog

## v1.2.0

- Alle ~55 bisher fest im Karten-Code hinterlegten Einzel-Artikel-Icons (Apfel, Milch, Brot, ...) sind jetzt Teil der GUI-verwalteten Zuordnungen - über "Zuordnung hinzufügen" bearbeitbar, erweiterbar, entfernbar
- Neues Kategorie-Feld pro Zuordnung (für die Gruppen-Ansicht der Karte), mit Dropdown bestehender Kategorien + Freitext für neue
- Bestehende Installationen: alte Zuordnungen bleiben unverändert erhalten, nur frisch eingerichtete Instanzen erhalten den neuen erweiterten Standard-Satz

## v1.1.0

- Icon-Stil-Auswahl (Emoji Standard, MDI optional), jederzeit umstellbar
- Sensor liefert zusätzlich `icon_style`

## v1.0.2

- Fix: ungültige mdi-Icon-Namen ersetzt

## v1.0.1

- Fix: Options-Flow AttributeError auf neueren HA-Core-Versionen

## v1.0.0

- Erste Veröffentlichung

## v1.2.1 (nachträglich, HACS-Validierung)

- manifest.json: fehlenden Pflichtschlüssel `issue_tracker` ergänzt
- Brand-Icon unter `custom_components/grocery_icon_map/brand/icon.png` ergänzt (lokale Brand-Assets erfüllen die HACS-Prüfung, keine PR beim offiziellen brands-Repo nötig)
- Hinweis: Repository-Beschreibung und Topics müssen zusätzlich in den GitHub-Repo-Einstellungen gesetzt werden (kein Datei-Fix möglich)

## v1.2.2 (nachträglich, hassfest-Validierung)

- manifest.json: `dependencies: ["http", "frontend"]` ergänzt - `hass.http` und `frontend.add_extra_js_url` werden im Code verwendet, hassfest verlangt das explizit im Manifest

## v1.2.3 (nachträglich, hassfest-Validierung)

- manifest.json: Schlüsselreihenfolge korrigiert (domain, name, dann alphabetisch) - hassfest verlangt das strikt
