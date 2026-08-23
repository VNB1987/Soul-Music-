(()=>{
  const BaseAudioEngine=window.AudioEngine;
  if(!BaseAudioEngine)return;

  class V15AudioEngine extends BaseAudioEngine{
    constructor(player){
      super(player);
      this.voice=this.channel();
      this.voiceLevel=0;
      this.voiceRaw=0;
    }
    disconnect(){
      this.stopChannel(this.voice);
      super.disconnect();
    }
    async useVoiceDevice(deviceId,label=''){
      return this.connectDevice(this.voice,deviceId,label,true);
    }
    async useSystemAudio(){
      if(!navigator.mediaDevices?.getDisplayMedia)throw new Error('SYSTEM_CAPTURE_UNSUPPORTED');
      await this.setup();
      this.prepare(this.music);
      this.stopChannel(this.music);
      this.player.pause();
      const options={
        video:{displaySurface:'monitor'},
        audio:{suppressLocalAudioPlayback:false},
        systemAudio:'include',
        selfBrowserSurface:'exclude',
        surfaceSwitching:'exclude',
        monitorTypeSurfaces:'include'
      };
      let capture;
      try{capture=await navigator.mediaDevices.getDisplayMedia(options)}
      catch{capture=await navigator.mediaDevices.getDisplayMedia({video:true,audio:true})}
      const tracks=capture.getAudioTracks();
      if(!tracks.length){capture.getTracks().forEach(t=>t.stop());throw new Error('NO_SYSTEM_AUDIO')}
      this.music.stream=capture;
      const audioOnly=new MediaStream(tracks);
      this.music.source=this.ctx.createMediaStreamSource(audioOnly);
      this.music.source.connect(this.music.analyser);
      // IMPORTANT V15: system audio is analysed only; it is NOT routed back to speakers.
      // This prevents doubled sound/feedback and keeps the analyser independent of Chrome playback.
      this.music.active=true;
      this.music.label=tracks[0]?.label||'Windows System Audio';
      this.mode='live';
    }
    update(t){
      super.update(t);
      this.analyse(this.voice);
      this.voiceLevel=this.voice.level;
      this.voiceRaw=this.voice.detected;
      this.level=Math.max(this.level,this.voiceLevel);
      this.raw=Math.max(this.raw,this.voiceRaw);
      return this;
    }
  }
  window.AudioEngine=V15AudioEngine;

  const BaseVisualEngine=window.VisualEngine;
  if(BaseVisualEngine){
    const originalFrame=BaseVisualEngine.prototype.frame;
    BaseVisualEngine.prototype.frame=function(t,a){
      originalFrame.call(this,t,a);
      const level=Math.max(0,Math.min(1,((a.voiceLevel||0)-.003)*15));
      this.__djVoiceMix=(this.__djVoiceMix||0)+(level-(this.__djVoiceMix||0))*(level>(this.__djVoiceMix||0)?.34:.12);
      const v=this.__djVoiceMix;
      if(v<.004)return;
      const c=this.x;
      c.save();
      c.globalCompositeOperation='lighter';
      const halo=c.createRadialGradient(960,500,30,960,500,760);
      halo.addColorStop(0,`rgba(255,247,210,${v*.30})`);
      halo.addColorStop(.38,`rgba(255,185,60,${v*.18})`);
      halo.addColorStop(1,'rgba(0,0,0,0)');
      c.fillStyle=halo;c.fillRect(0,184,1920,588);
      c.translate(960,500);
      for(let i=0;i<4;i++){
        const r=115+i*55+Math.sin(t*.006+i)*12*v;
        c.strokeStyle=`rgba(255,235,170,${v*(.26-i*.035)})`;
        c.lineWidth=2+v*8;
        c.shadowColor='#ffe8a0';c.shadowBlur=18+v*42;
        c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.stroke();
      }
      c.restore();
    };
  }
})();
