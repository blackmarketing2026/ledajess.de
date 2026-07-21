# Projektregeln

## Sitemap aktuell halten

Sobald eine neue Unterseite (neue `.html`-Datei, die indexiert werden soll) erstellt wird, muss `sitemap.xml` im selben Arbeitsschritt um einen `<url><loc>`-Eintrag mit der sauberen URL (ohne `.html`, siehe `vercel.json` cleanUrls) ergänzt werden. Seiten, die per `robots.txt` von der Indexierung ausgeschlossen sind (aktuell `/impressum`, `/datenschutz`), gehören nicht in die Sitemap.

## SEO-Themen-Hubs und Blogstruktur

SEO-Themen-Hubs werden auf oberster Ebene angelegt, zum Beispiel `/change-teamfuehrung/`. Sie werden auf der Website nicht als technischer Seitentyp bezeichnet, sondern als normale Themenseite oder Leistungsseite formuliert.

Themenbezogene Blogbeiträge liegen in der passenden Ordnerstruktur unter `/blog/<kategorie>/`. Die Übersichtslisten auf Themen- und Kategorieseiten sollen aus dem Kategorie-Datenmodell geladen werden, nicht hart codiert.

URLs, Slugs, Dateinamen und technische Kategorie-IDs bleiben ohne Umlaute. Sichtbare deutsche Texte dürfen und sollen Umlaute verwenden.
