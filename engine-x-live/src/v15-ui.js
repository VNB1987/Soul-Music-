(()=>{
  const audioConsole=document.querySelector('.audio-console');
  if(!audioConsole||typeof audio==='undefined')return;

  const help=audioConsole.querySelector('.audio-help');
  const card=document.createElement('div');
  card.className='audio-card';
  card.innerHTML='<strong>4 · VOCE DJ SOUL</strong><select id="voiceDevice" aria-label="Voce DJ Soul"><option value="">Alege canalul dedicat</option></select><button id="voiceBtn">CONECTEAZĂ</button><span id="voiceState" class="state" data-state="off">NECONECTAT</span>';
  if(help)audioConsole.insertBefore(card,help);else audioConsole.appendChild(card);

  const voiceDevice=document.getElementById('voiceDevice');
  const voiceBtn=document.getElementById('voiceBtn');
  const voiceState=document.getElementById('voiceState');
  const systemBtn=document.getElementById('systemBtn');
  if(systemBtn)systemBtn.textContent='AUDIO WINDOWS GENERAL';
  if(help)help.textContent='V15: muzica = AUDIO WINDOWS GENERAL (alege Ecran întreg + Share system audio) · microfon = Microphone (S6) · voce DJ Soul = canal virtual separat (CABLE/VoiceMeeter). Muzica nu mai trebuie să intre pe canalul DJ Soul.';

  function setVoiceState(text,state='off'){voiceState.textContent=text;voiceState.dataset.state=state}
  function fillVoice(devices){
    const inputs=devices.filter(d=>d.kind==='audioinput');
    voiceDevice.innerHTML='';
    for(const [i,d] of inputs.entries()){
      const o=document.createElement('option');o.value=d.deviceId;o.textContent=d.label||`Intrare audio ${i+1}`;voiceDevice.appendChild(o);
    }
    const dedicated=[...voiceDevice.options].find(o=>/CABLE Output|VoiceMeeter Output|Virtual Cable|DJ.?Soul|VB-Audio/i.test(o.textContent)&&!/Microphone.*\bS6\b|\bS6\b.*Microphone/i.test(o.textContent));
    if(dedicated)voiceDevice.value=dedicated.value;
  }
  async function refreshVoice(){
    try{fillVoice(await audio.listAllDevices())}catch{}
  }
  async function connectVoice(){
    if(!voiceDevice.options.length)await refreshVoice();
    const selected=voiceDevice.options[voiceDevice.selectedIndex];
    if(!selected?.value)throw new Error('NO_VOICE_DEVICE');
    setVoiceState('CALIBRARE…','warn');
    await audio.useVoiceDevice(selected.value,selected.textContent);
    setVoiceState('CONECTAT','warn');
    if(typeof status!=='undefined')status.textContent=`VOCE DJ SOUL: ${selected.textContent}`;
  }
  voiceBtn.onclick=()=>connectVoice().catch(()=>setVoiceState('EROARE','warn'));
  refreshVoice();

  const oldAuto=document.getElementById('autoAudioBtn');
  if(oldAuto){
    oldAuto.addEventListener('click',()=>setTimeout(async()=>{
      try{
        await refreshVoice();
        if(voiceDevice.value&&!audio.voice?.active)await connectVoice();
      }catch{}
    },600));
  }

  const meterWrap=document.querySelector('.dual-meters');
  if(meterWrap){
    const row=document.createElement('div');
    row.innerHTML='<span>DJ SOUL</span><div class="meter"><i id="voiceMeter"></i></div><b id="voiceSignal">0%</b>';
    meterWrap.appendChild(row);
    const meter=document.getElementById('voiceMeter'),signal=document.getElementById('voiceSignal');
    setInterval(()=>{
      const e=Math.max(0,Math.min(1,((audio.voiceLevel||0)-.002)*12));
      meter.style.width=`${e*100}%`;signal.textContent=audio.voice?.calibration>0?'CAL':`${Math.round((audio.voiceRaw||0)*100)}%`;
      document.documentElement.style.setProperty('--djvoice',e.toFixed(3));
      if(audio.voice?.active){const s=audio.signalState(audio.voice);setVoiceState(s==='signal'?'SEMNAL OK':s==='silent'?'FĂRĂ SEMNAL':'CALIBRARE…',s==='signal'?'ok':'warn')}
    },120);
  }
})();
