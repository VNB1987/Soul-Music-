# DJ Soul — Engine X Live: Îngeri și Dansatori

> **ACTIVE DEVELOPMENT / STABLE BASELINE**  
> Acesta este engine-ul activ. Nu este versiunea finală a proiectului. Toate dezvoltările noi pornesc de aici; engine-ul vechi rămâne separat și nu se modifică.

Versiunea activă cu dansatori și scene cerești, conectată în mod sigur la playlistul YouTube Soul Music.

## Regula de bază

- Sursa activă este exclusiv `engine-x-live/`.
- Engine-ul vechi rămâne legacy și nu se modifică.
- Schimbările mari se fac cu punct de revenire Git înainte de modificare.
- Configurația locală și cheia API nu se urcă niciodată în repository.

## Prima configurare DJ Soul

1. Rulează `configure-dj-soul.bat`.
2. Lipește cheia YouTube API. Textul rămâne ascuns.
3. La Playlist ID apasă Enter pentru playlistul implicit Soul Music.
4. Pornește proiectul cu `PORNESTE-DJ-SOUL.bat`.

Cheia este salvată numai în `dj-soul.local.json`, fișier local ascuns și exclus prin `.gitignore`. Nu trimite acest fișier și nu îl urca pe GitHub.

În panoul de control trebuie să apară mesajul verde `DJ Soul: YouTube conectat • ... melodii`.

Aplicația rulează local în Full HD 1920×1080. Aceasta este versiunea activă Engine X și este separată de engine-ul vechi.

Scena nu afișează logo-uri. Centrul folosește temporar un portal abstract RGB audio-reactiv, potrivit pentru transmisie LIVE fără branding vizual suplimentar.

Versiunea LIVE include o structură de scenă cu reflectoare și un banner inferior cu mesaje rotative. Luminile se estompează automat în liniște; în modul microfon, tonalitățile joase favorizează roșul, iar cele înalte albastrul.

## Pornire LIVE

1. Dublu-click pe `start-live.bat` sau `PORNESTE-DJ-SOUL.bat`.
2. Serverul local pornește la `http://127.0.0.1:8988/`.
3. În TikTok LIVE Studio adaugă Browser Source: `http://127.0.0.1:8988/`.
4. Setează Browser Source la 1920×1080 și 60 FPS.
5. Alege **MUZICĂ** pentru sursa audio de muzică sau **MICROFON** pentru sunet live.

Poți deschide `index.html` direct numai pentru verificarea modului DEMO. Pentru CABLE, microfon, YouTube și utilizarea în TikTok LIVE Studio pornește obligatoriu serverul local și folosește `http://127.0.0.1:8988/`.

Pentru muzica din VB-CABLE: deschide panoul de control cu `C`, permite accesul audio, verifică să fie selectat **CABLE Output**, apoi conectează sursa. Selectorul recomandă automat CABLE Output atunci când este disponibil.

Modul DEMO permite verificarea vizualurilor fără audio. Tasta `F` activează ecranul complet, iar `D` revine la demo.

Panoul de control este ascuns în transmisie. Apasă tasta `C` pentru a-l deschide sau închide.

## Verificare înainte de LIVE

Înainte de fiecare sesiune LIVE verifică:

- `PORNESTE-DJ-SOUL.bat` pornește fără eroare;
- browserul deschide `http://127.0.0.1:8988/`;
- panoul afișează `DJ Soul: YouTube conectat • ... melodii`;
- sursa audio corectă este selectată;
- dansatorii, scena și bannerul se mișcă normal;
- Browser Source din TikTok LIVE Studio folosește tot portul `8988`.

## Scenă și layout

Textele sunt dimensionate pentru lizibilitate pe telefon: banner inferior de 154 px, mesaje principale de până la 47 px și notificări superioare de până la 28 px.

Modul de lizibilitate maximă folosește banner de 308 px, text principal de până la 94 px, notificări superioare de până la 54 px și indicatoare LIVE/TikTok mărite.

Headerul superior unește indicatorul LIVE, mesajele temporare și elementul TikTok într-o singură bandă. Bannerul inferior rezervă întreaga lățime exclusiv mesajelor.

Dansatorii sunt încadrați spre laterale, cu o zonă centrală generoasă rezervată pentru dezvoltările vizuale următoare.

Zona centrală folosește temporar portalul orbital. Orga de lumină a fost eliminată; conceptul central poate fi schimbat în dezvoltările următoare.

Bannerul promoțional superior ocupă toată lățimea și pulsează lent. Indicatorul LIVE este poziționat în stânga, iar elementul TikTok în dreapta.

## Arhitectură

- `src/audio-engine.js` — analiză audio și gestionarea surselor;
- `src/visual-engine.js` — animația dansatorilor, fundalul RGB, fasciculele și particulele;
- `src/dj-soul-youtube.js` — legătura UI cu datele DJ Soul / YouTube;
- `src/app.js` — interfață și orchestrare;
- `assets/poses/` — cadrele dansatorilor;
- `assets/celestial/` — asset-uri pentru scena cerească;
- `youtube-bridge.ps1` — acces local read-only la playlistul YouTube;
- `start-live.ps1` — serverul local pe portul `8988`.

## Securitate

`dj-soul.local.json` și orice `*.local.json` sunt excluse prin `.gitignore`. Cheia API rămâne locală și nu este returnată de endpoint-ul de status.

Proiectul din `engine-x-live/` nu importă și nu modifică fișierele engine-ului vechi din rădăcina repository-ului.
