# Engine X Live — Status

**Status:** ACTIVE DEVELOPMENT / STABLE BASELINE

Aceasta este versiunea activă din care continuăm dezvoltarea Engine X cu îngeri și dansatori.
Nu este produsul final. Este punctul de bază stabil, verificat și separat de engine-ul vechi.

## Sursa activă

- Folder activ unic: `engine-x-live/`.
- Engine-ul vechi din rădăcina repository-ului este legacy și nu se modifică.
- Branch de revenire baseline: `backup/engine-x-stable-2026-08-22`.

## Reguli de lucru

- Toate modificările noi pentru Engine X se fac numai în `engine-x-live/`.
- Înainte de schimbări mari se păstrează un commit/punct de revenire.
- `dj-soul.local.json` este strict local și nu se comite niciodată.
- Orice `*.local.json` rămâne exclus din Git.
- Cheile API și alte secrete nu se introduc în fișiere urmărite de Git.

## Baseline verificat

- Runtime JavaScript activ în `src/`: `app.js`, `audio-engine.js`, `dj-soul-youtube.js`, `visual-engine.js`.
- Server local: `start-live.ps1`.
- Port runtime standardizat: `8988`.
- Pornire: `start-live.bat` / `PORNESTE-DJ-SOUL.bat`.
- Browser Source LIVE: `http://127.0.0.1:8988/`.
- Configurația YouTube este locală și exclusă prin `.gitignore`.
- Endpoint-ul de status nu expune cheia API.
- Playlistul YouTube este accesat read-only de bridge-ul local.
- Asset-urile runtime pentru dansatori și scena cerească sunt păstrate în `assets/`.
- Documentația README a fost aliniată cu configurația reală de runtime.

## Checklist înainte de LIVE

1. Pornește `PORNESTE-DJ-SOUL.bat`.
2. Confirmă că se deschide `http://127.0.0.1:8988/`.
3. Confirmă în panou mesajul verde de conectare DJ Soul / YouTube.
4. Verifică sursa audio și semnalul.
5. Verifică dansatorii, scena, bannerul și reacția audio.
6. Confirmă Browser Source în TikTok LIVE Studio la 1920×1080, 60 FPS și portul `8988`.

## De făcut

Engine X este încă în dezvoltare. Funcții, scene, comportamente vizuale, elementul central și integrarea DJ Soul pot fi îmbunătățite în continuare fără a modifica baseline-ul de backup.
