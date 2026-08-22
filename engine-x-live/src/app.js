const $=s=>document.querySelector(s),audio=new AudioEngine($('#player')),visual=new VisualEngine($('#visuals')),status=$('#statusText');
const messages=[
  'Bine ați venit pe acest LIVE <mark>UNIC</mark>!',
  'Aici muzica unește suflete și creează momente <mark class="divine">DIVINE</mark>.',
  'Alături de voi este <mark class="name">Nicolae Bogdan</mark> — bucurați-vă de muzică!',
  'Dacă îți place energia, oferă-ne un tap tap din inimă.',
  'Apasă Follow și ne revedem la următorul dans.',
  'Distribuie LIVE-ul unui prieten care iubește muzica bună.',
  'Darurile sunt binevenite doar dacă le oferi cu bucurie.',
  'Prezența și energia voastră sunt cel mai frumos cadou.',
  'Respectul este regula principală în familia Soul Music.',
  'Salută familia Soul Music înainte de a solicita gazda.',
  'În gazdă urcă doar membrii care au inimă de membru.',
  'Păstrăm conversația elegantă, calmă și fără jigniri.',
  'Fără conflicte, provocări sau comentarii răutăcioase.',
  'Ascultăm, respectăm și oferim fiecăruia timp să vorbească.',
  'Nu cerem și nu presăm pe nimeni să trimită daruri.',
  'Un tap tap ajută LIVE-ul să ajungă la mai mulți oameni.',
  'Scrie în comentarii ce melodie îți atinge sufletul.',
  'Rămâi aproape — următorul moment poate fi preferatul tău.',
  'Mulțumim moderatorilor și membrilor care păstrează armonia.',
  'Respiră, zâmbește și lasă muzica să te poarte.'
];
let messageIndex=0,messageStarted=performance.now();const messageEl=$('#liveMessage'),messageProgress=$('#messageProgress');
function showMessage(index){messageEl.classList.add('out');setTimeout(()=>{messageEl.className=`live-message palette-${index%4}`;messageEl.innerHTML=messages[index];messageStarted=performance.now()},430)}showMessage(0);
setInterval(()=>{messageIndex=(messageIndex+1)%messages.length;showMessage(messageIndex)},7600);
const topPrompts=[
  'Pentru o dedicație specială poți trimite <span class="diamond">◆</span> <strong>100 DIAMANTE</strong>.',
  'Acest LIVE difuzează exclusiv muzică <strong>SOUL MUSIC</strong>.',
  'Apasă <strong>FOLLOW</strong> pentru seri LIVE pline de muzică Soul.',
  'Trimite LIVE-ul unui prieten care iubește muzica <strong>SOUL MUSIC</strong>.',
  'Pentru o melodie dedicată, scrie titlul și trimite <span class="diamond">◆</span> <strong>100 DIAMANTE</strong>.'
];
const manualTitleRoute=document.createElement('div');manualTitleRoute.className='route manual-title-route';manualTitleRoute.innerHTML='<strong>TITLU TIKTOK</strong><input id="manualMusicTitle" type="text" placeholder="Scrie titlul melodiei" autocomplete="off"><button id="setManualTitle">AFIȘEAZĂ</button><button id="clearManualTitle">AUTOMAT</button>';$('.audio-routing').appendChild(manualTitleRoute);
const topPrompt=$('#topPrompt'),musicTitleData=$('#musicTitleData'),manualMusicTitle=$('#manualMusicTitle');let promptIndex=0,nextIsMusicTitle=true,manualTitle=localStorage.getItem('manualMusicTitle')||'';
manualMusicTitle.value=manualTitle;
const currentMusicTitle=()=>manualTitle||musicTitleData.textContent.trim();
function showPrompt(){topPrompt.classList.remove('show');setTimeout(()=>{const title=currentMusicTitle(),showTitle=Boolean(title&&nextIsMusicTitle),content=document.createElement('span');content.className=showTitle?'prompt-content track-title':'prompt-content';if(showTitle){content.textContent=title;nextIsMusicTitle=false}else{content.innerHTML=topPrompts[promptIndex];promptIndex=(promptIndex+1)%topPrompts.length;if(title)nextIsMusicTitle=true}topPrompt.replaceChildren(content);topPrompt.classList.toggle('music-mode',showTitle);topPrompt.classList.add('show')},600)}
showPrompt();setInterval(showPrompt,10000);
musicTitleData.addEventListener('live-title-change',e=>{if(e.detail?.playing){nextIsMusicTitle=true;showPrompt()}});
$('#setManualTitle').onclick=()=>{manualTitle=manualMusicTitle.value.trim();if(!manualTitle)return;localStorage.setItem('manualMusicTitle',manualTitle);nextIsMusicTitle=true;showPrompt();status.textContent='TITLU MANUAL ACTIV'};
$('#clearManualTitle').onclick=()=>{manualTitle='';manualMusicTitle.value='';localStorage.removeItem('manualMusicTitle');nextIsMusicTitle=true;showPrompt();status.textContent='TITLU AUTOMAT ACTIV'};
manualMusicTitle.addEventListener('keydown',e=>{if(e.key==='Enter')$('#setManualTitle').click()});
const controls=$('.controls'),musicDevice=$('#musicDevice'),micDevice=$('#micDevice'),outputDevice=$('#outputDevice');function toggleControls(force){const open=force??!controls.classList.contains('open');controls.classList.toggle('open',open);controls.setAttribute('aria-hidden',String(!open))}$('#closeControls').onclick=()=>toggleControls(false);
function connected(id,on=true){$(id).classList.toggle('connected',on)}
function fillSelect(select,devices,prefix){select.innerHTML='';devices.forEach((d,i)=>{const option=document.createElement('option');option.value=d.deviceId;option.textContent=d.label||`${prefix} ${i+1}`;select.appendChild(option)})}
async function loadDevices(){try{status.textContent='SE CAUTĂ SURSELE AUDIO';const devices=await audio.listAllDevices(),inputs=devices.filter(d=>d.kind==='audioinput'),outputs=devices.filter(d=>d.kind==='audiooutput');fillSelect(musicDevice,inputs,'Intrare audio');fillSelect(micDevice,inputs,'Microfon');fillSelect(outputDevice,outputs,'Ieșire audio');const cable=[...musicDevice.options].find(o=>/CABLE Output|VB-Audio|Virtual/i.test(o.textContent));const physical=[...micDevice.options].find(o=>!/CABLE|VB-Audio|Virtual/i.test(o.textContent));const s6=[...outputDevice.options].find(o=>/\bS6\b/i.test(o.textContent));const defaultOut=[...outputDevice.options].find(o=>o.value==='default'||/Default/i.test(o.textContent));if(cable)musicDevice.value=cable.value;if(physical)micDevice.value=physical.value;if(s6)outputDevice.value=s6.value;else if(defaultOut)outputDevice.value=defaultOut.value;status.textContent=s6?'S6 GĂSITĂ · ALEGE MUZICA ȘI TRIMITE SUNET':'SURSE GĂSITE · ALEGE IEȘIREA AUDIO'}catch(err){status.textContent=err?.message==='AUDIO_REQUIRES_HTTP'?'DESCHIDE PRIN LINKUL HTTP':'ACCES AUDIO REFUZAT'}}
$('#devicesBtn').onclick=loadDevices;
$('#outputBtn').onclick=async()=>{try{if(!outputDevice.options.length)await loadDevices();const selected=outputDevice.options[outputDevice.selectedIndex];if(!selected){status.textContent='ALEGE IEȘIREA AUDIO';return}await audio.setOutputDevice(selected.value);connected('#outputBtn');status.textContent=`SUNET TRIMIS → ${selected.textContent}`}catch(err){status.textContent=err?.message==='OUTPUT_SELECTION_UNSUPPORTED'?'CHROME NU PERMITE ALEGEREA IEȘIRII':'EROARE LA IEȘIREA AUDIO'}};
$('#musicBtn').onclick=async()=>{try{if(!musicDevice.options.length)await loadDevices();const selected=musicDevice.options[musicDevice.selectedIndex];if(!selected?.value){status.textContent='ALEGE SURSA PENTRU MUZICĂ';return}await audio.useMusicDevice(selected.value,selected.textContent);connected('#musicBtn');connected('#systemBtn',false);status.textContent='MUZICĂ RGB · CONECTATĂ'}catch{status.textContent='EROARE LA SURSA DE MUZICĂ'}};
$('#micBtn').onclick=async()=>{try{if(!micDevice.options.length)await loadDevices();const selected=micDevice.options[micDevice.selectedIndex];if(!selected?.value){status.textContent='ALEGE MICROFONUL';return}await audio.useMicDevice(selected.value,selected.textContent);connected('#micBtn');status.textContent='MICROFON ROȘU · CONECTAT'}catch{status.textContent='EROARE LA MICROFON'}};
$('#musicFile').onchange=async e=>{if(!e.target.files[0])return;try{await audio.useFile(e.target.files[0]);connected('.file');connected('#musicBtn',false);connected('#systemBtn',false);status.textContent='FIȘIER MUZICAL · CONECTAT'}catch{status.textContent='EROARE FIȘIER AUDIO'}};
$('#systemBtn').onclick=async()=>{try{status.textContent='ALEGE ECRANUL ȘI BIFEAZĂ SUNETUL';await audio.useSystemAudio();connected('#systemBtn');connected('#musicBtn',false);status.textContent='AUDIO SISTEM · CONECTAT'}catch(err){status.textContent=err?.message==='NO_SYSTEM_AUDIO'?'SUNETUL SISTEMULUI NU A FOST BIFAT':'CAPTURĂ SISTEM ANULATĂ'}};
$('#demoBtn').onclick=()=>{audio.demo();document.querySelectorAll('.connected').forEach(x=>x.classList.remove('connected'));$('#demoBtn').classList.add('connected');status.textContent='DEMO · SURSELE LIVE SUNT OPRITE'};
$('#sceneBtn').onclick=()=>{const mode=visual.toggleScene(),celestial=mode==='celestial';$('#sceneBtn').classList.toggle('celestial-active',celestial);$('#sceneBtn').textContent=celestial?'✦ REVINO LA SCENA SOUL':'☁ SCENĂ CELESTĂ';status.textContent=celestial?'TRANZIȚIE CĂTRE SCENA CELESTĂ':'TRANZIȚIE CĂTRE SCENA SOUL'};
$('#fullscreenBtn').onclick=()=>document.fullscreenElement?document.exitFullscreen():$('#stage').requestFullscreen();
const musicMeter=$('#musicMeter'),micMeter=$('#micMeter'),musicSignal=$('#musicSignal'),micSignal=$('#micSignal');
const FRAME_INTERVAL=1000/30;let lastRenderedFrame=0;
function loop(t){requestAnimationFrame(loop);if(t-lastRenderedFrame<FRAME_INTERVAL)return;lastRenderedFrame=t-(t-lastRenderedFrame)%FRAME_INTERVAL;audio.update(t);visual.frame(t,audio);const musicEnergy=audio.mode==='demo'?Math.min(1,audio.musicLevel*1.35):Math.max(0,Math.min(1,(audio.musicLevel-.002)*12)),micEnergy=Math.max(0,Math.min(1,(audio.micLevel-.002)*12)),energy=Math.max(musicEnergy,micEnergy);musicMeter.style.width=`${musicEnergy*100}%`;micMeter.style.width=`${micEnergy*100}%`;musicSignal.textContent=`${Math.round((audio.musicRaw||0)*100)}%`;micSignal.textContent=audio.mic.calibration>0?'CAL':`${Math.round((audio.micRaw||0)*100)}%`;document.documentElement.style.setProperty('--audio',energy.toFixed(3));document.documentElement.style.setProperty('--music',musicEnergy.toFixed(3));document.documentElement.style.setProperty('--voice',micEnergy.toFixed(3));document.documentElement.style.setProperty('--tone',audio.tone.toFixed(3));document.documentElement.style.setProperty('--mic-r',micEnergy>.01?255:Math.round(35+(1-audio.tone)*220));document.documentElement.style.setProperty('--mic-b',micEnergy>.01?35:Math.round(35+audio.tone*220));messageProgress.style.width=`${Math.min(100,(performance.now()-messageStarted)/76)}%`}
requestAnimationFrame(loop);
document.addEventListener('keydown',e=>{const key=e.key.toLowerCase(),editing=['SELECT','INPUT','TEXTAREA'].includes(document.activeElement?.tagName);if(key==='f')$('#fullscreenBtn').click();if(key==='d'&&!editing)$('#demoBtn').click();if(key==='c')toggleControls();if(key==='s'&&!editing)$('#sceneBtn').click()});
toggleControls(true);status.textContent=location.protocol==='file:'?'DESCHIDE PRIN PORNESTE-LIVE-CURAT':'1. REÎNCARCĂ SURSE · 2. ALEGE IEȘIREA · 3. CONECTEAZĂ MUZICA';
window.addEventListener('djsoul:youtubeplaylistready',event=>{const state=event.detail||{},first=state.items?.[0];if(first&&!manualTitle){musicTitleData.textContent=first.title||'';musicTitleData.dispatchEvent(new CustomEvent('live-title-change',{detail:{playing:true,source:'youtube'}}))}});
