# Engine X Live — Status

**Status:** ACTIVE DEVELOPMENT / STABLE BASELINE

Aceasta este versiunea activă din care continuăm dezvoltarea Engine X cu îngeri și dansatori.
Nu este produsul final. Este punctul de bază stabil, verificat și separat de engine-ul vechi.

## Reguli de lucru

- Toate modificările noi pentru Engine X se fac numai în `engine-x-live/`.
- Engine-ul vechi nu se modifică și rămâne doar referință/legacy.
- `dj-soul.local.json` este strict local și nu se comite niciodată.
- Înainte de schimbări mari se păstrează un commit/punct de revenire.
- Fișierele din `engine-x-backups/` sunt copii de siguranță, nu sursa activă.

## Verificări baseline

- JavaScript runtime: verificare de sintaxă trecută pentru fișierele active din `src/`.
- Configurația locală cu cheia API: exclusă din Git.
- Asset-urile necesare runtime-ului curent: păstrate în `assets/poses/` și `assets/celestial/`.
- Conceptele și asset-urile nefolosite de runtime nu sunt în folderul live; sunt păstrate în backup.

## De făcut

Engine X este încă în dezvoltare. Funcții, scene, comportamente vizuale și integrarea DJ Soul pot fi schimbate în continuare.
