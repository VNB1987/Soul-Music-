# DJ Soul — Engine X Live: Îngeri și Dansatori

> **ACTIVE DEVELOPMENT / STABLE BASELINE**  
> Acesta este engine-ul activ. Nu este versiunea finală a proiectului. Toate dezvoltările noi pornesc de aici; engine-ul vechi rămâne separat și nu se modifică.

Versiunea cu dansatori și scene cerești, conectată în mod sigur la playlistul YouTube Soul Music.

## Prima configurare DJ Soul

1. Rulează `configure-dj-soul.bat`.
2. Lipește cheia YouTube API. Textul rămâne ascuns.
3. La Playlist ID apasă Enter pentru playlistul implicit Soul Music.
4. Pornește proiectul cu `PORNESTE-DJ-SOUL.bat`.

Cheia este salvată numai în `dj-soul.local.json`, fișier local ascuns și exclus prin `.gitignore`. Nu trimite acest fișier și nu îl urca pe GitHub.

În panoul de control trebuie să apară mesajul verde `DJ Soul: YouTube conectat • ... melodii`.

Aplicație vizuală locală, Full HD 1920×1080, creată separat de Engine X.

Scena nu afișează logo-uri. Centrul folosește un portal abstract RGB audio-reactiv, potrivit pentru canale TikTok fără branding.

Versiunea LIVE include o structură de scenă cu reflectoare și un banner inferior cu 20 de mesaje rotative. Luminile se estompează automat în liniște; în modul microfon, tonalitățile joase favorizează roșul, iar cele înalte albastrul.

## Pornire

1. Dublu-click pe `start-live.bat`.
2. În TikTok LIVE Studio adaugă Browser Source: `http://127.0.0.1:8770/`.
3. Setează 1920×1080 și 60 FPS.
4. Alege **MUZICĂ** pentru un fișier audio sau **MICROFON** pentru sunet live.

Poți deschide `index.html` direct pentru a vedea modul DEMO. Pentru CABLE, microfon și utilizarea în TikTok LIVE Studio pornește obligatoriu `start-live.bat`, apoi folosește `http://127.0.0.1:8770/`.

Pentru muzica din VB-CABLE: apasă **SURSE**, permite accesul audio, verifică să fie selectat **CABLE Output**, apoi apasă **ACTIVEAZĂ**. Selectorul recomandă automat CABLE Output atunci când este disponibil.

Modul DEMO pornește automat și permite verificarea vizualurilor fără audio. Tasta `F` activează ecranul complet, iar `D` revine la demo.

Panoul de control este ascuns în transmisie. Apasă tasta `C` pentru a-l deschide sau închide.

Textele sunt dimensionate pentru lizibilitate pe telefon: banner inferior de 154 px, mesaje principale de până la 47 px și notificări superioare de până la 28 px.

Modul de lizibilitate maximă folosește banner de 308 px, text principal de până la 94 px, notificări superioare de până la 54 px și indicatoare LIVE/TikTok mărite.

Headerul superior unește indicatorul LIVE, mesajele temporare și elementul TikTok într-o singură bandă. Bannerul inferior rezervă întreaga lățime exclusiv mesajelor, fără etichetă laterală.

Dansatorii sunt încadrați spre laterale, cu o zonă centrală generoasă rezervată pentru un viitor element vizual.

Zona centrală folosește temporar portalul orbital. Orga de lumină a fost eliminată; următorul concept central va fi aprobat vizual înainte de implementare.

Bannerul promoțional superior ocupă toată lățimea și pulsează lent. Indicatorul LIVE este poziționat în stânga, deasupra bannerului inferior, iar elementul TikTok în dreapta, imediat sub bannerul superior.

## Arhitectură

- `audio-engine.js` — analiză audio și surse;
- `visual-engine.js` — fundal RGB, fascicule și particule;
- `assets/poses/` — zece cadre: cinci pentru fiecare dansator;
- `visual-engine.js` — animația pe cadre, fundalul RGB și particulele;
- `app.js` — interfață și orchestrare.

Proiectul nu importă și nu modifică niciun fișier din Soul Music Live 2 / Engine X.