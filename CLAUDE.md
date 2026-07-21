# Projektregeln

## Sitemap aktuell halten

Sobald eine neue Unterseite (neue `.html`-Datei, die indexiert werden soll) erstellt wird, muss `sitemap.xml` im selben Arbeitsschritt um einen `<url><loc>`-Eintrag mit der sauberen URL (ohne `.html`, siehe `vercel.json` cleanUrls) ergänzt werden. Seiten, die per `robots.txt` von der Indexierung ausgeschlossen sind (aktuell `/impressum`, `/datenschutz`), gehören nicht in die Sitemap.

## Blogstruktur und SEO-Kategorie-Hubs

SEO-relevante Themenübersichten werden als Kategorie-Hubs direkt im passenden Blog-Kategorieordner gespeichert. Es gibt dafür keinen zusätzlichen Ordner auf oberster Ebene.

Blogbeiträge werden immer in dieser Ordnerstruktur gespeichert:

```text
blog/
  <kategorie>/
    index.html
    articles.json
    <blogartikel>/
      index.html
```

Die Kategorieseite liegt unter `/blog/<kategorie>/` und verwendet `blog/<kategorie>/articles.json` als manuell gepflegte Übersicht der Beiträge dieser Kategorie. Einzelne Blogartikel liegen jeweils unter `/blog/<kategorie>/<blogartikel>/`. Blogartikel werden nicht außerhalb ihrer Kategorie abgelegt.

Die Übersichtslisten auf Kategorie-Hubs sollen aus der `articles.json` im jeweiligen Kategorieordner geladen werden, nicht hart codiert.

URLs, Slugs, Dateinamen und technische Kategorie-IDs bleiben ohne Umlaute. Sichtbare deutsche Texte dürfen und sollen Umlaute verwenden.
