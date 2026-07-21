# Projektregeln

## Sitemap aktuell halten

Sobald eine neue Unterseite (neue `.html`-Datei, die indexiert werden soll) erstellt wird, muss `sitemap.xml` im selben Arbeitsschritt um einen `<url><loc>`-Eintrag mit der sauberen URL (ohne `.html`, siehe `vercel.json` cleanUrls) ergänzt werden. Seiten, die per `robots.txt` von der Indexierung ausgeschlossen sind (aktuell `/impressum`, `/datenschutz`), gehören nicht in die Sitemap.
