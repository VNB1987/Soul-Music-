class AudioEngine {
  constructor(player) {
    this.player = player;
    this.ctx = null;
    this.elementSource = null;
    this.mode = 'idle';
    this.music = this.channel();
    this.mic = this.channel();
    this.monitorGain = null;
    this.outputDeviceId = 'default';
    this.level = 0; this.raw = 0; this.bass = 0; this.mid = 0; this.high = 0; this.tone = .5;
    this.musicLevel = 0; this.micLevel = 0; this.musicRaw = 0; this.micRaw = 0;
  }

  channel() {
    return {
      analyser:null, freq:null, time:null, stream:null, source:null, monitor:null,
      level:0, raw:0, detected:0, peak:0, bass:0, mid:0, high:0, tone:.5,
      active:false, label:'', voice:false, noiseFloor:.01, calibration:0,
      lastSignalAt:0
    };
  }

  checkSupport() {
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) throw new Error('AUDIO_REQUIRES_HTTP');
  }

  async setup() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) throw new Error('AUDIO_CONTEXT_UNAVAILABLE');
      this.ctx = new AudioCtx();
      this.monitorGain = this.ctx.createGain();
      this.monitorGain.gain.value = 1;
      this.monitorGain.connect(this.ctx.destination);
    }
    await this.ctx.resume();
  }

  prepare(ch) {
    if (ch.analyser) return;
    ch.analyser = this.ctx.createAnalyser();
    ch.analyser.fftSize = 2048;
    ch.analyser.smoothingTimeConstant = .68;
    ch.freq = new Uint8Array(ch.analyser.frequencyBinCount);
    ch.time = new Uint8Array(ch.analyser.fftSize);
  }

  stopChannel(ch) {
    try { ch.source?.disconnect(); } catch {}
    try { ch.monitor?.disconnect(); } catch {}
    ch.source = null;
    ch.monitor = null;
    ch.stream?.getTracks().forEach(t => t.stop());
    ch.stream = null;
    ch.active = false;
    ch.level = ch.raw = ch.detected = ch.peak = ch.bass = ch.mid = ch.high = 0;
  }

  disconnect() {
    this.stopChannel(this.music);
    this.stopChannel(this.mic);
    this.player.pause();
    this.mode = 'idle';
  }

  async requestPermissions() {
    this.checkSupport();
    const permission = await navigator.mediaDevices.getUserMedia({ audio:true });
    permission.getTracks().forEach(t => t.stop());
  }

  async listAllDevices() {
    await this.requestPermissions();
    return navigator.mediaDevices.enumerateDevices();
  }

  async chooseOutputDevice() {
    if (!navigator.mediaDevices?.selectAudioOutput) throw new Error('OUTPUT_PICKER_UNSUPPORTED');
    return navigator.mediaDevices.selectAudioOutput();
  }

  async setOutputDevice(deviceId) {
    await this.setup();
    const sinkId = deviceId || 'default';
    if (typeof this.ctx.setSinkId === 'function') {
      await this.ctx.setSinkId(sinkId);
      this.outputDeviceId = sinkId;
      return sinkId;
    }
    throw new Error('OUTPUT_SELECTION_UNSUPPORTED');
  }

  async capture(deviceId, voice=false) {
    const audio = deviceId ? { deviceId:{ exact:deviceId } } : true;
    if (audio === true) return navigator.mediaDevices.getUserMedia({ audio:true });
    try {
      return await navigator.mediaDevices.getUserMedia({
        audio:{
          ...audio,
          echoCancellation:voice,
          noiseSuppression:voice,
          autoGainControl:voice
        }
      });
    } catch {
      return navigator.mediaDevices.getUserMedia({ audio });
    }
  }

  routeToMonitor(ch) {
    if (!this.monitorGain || !ch.source) return;
    ch.monitor = this.ctx.createGain();
    ch.monitor.gain.value = 1;
    ch.source.connect(ch.monitor);
    ch.monitor.connect(this.monitorGain);
  }

  async connectDevice(ch, deviceId, label, voice=false) {
    this.checkSupport();
    await this.setup();
    this.prepare(ch);
    this.stopChannel(ch);
    ch.voice = voice;
    ch.noiseFloor = .01;
    ch.calibration = voice ? 90 : 0;
    ch.stream = await this.capture(deviceId, voice);
    const track = ch.stream.getAudioTracks()[0];
    if (!track || track.readyState !== 'live') throw new Error('AUDIO_TRACK_NOT_LIVE');
    ch.source = this.ctx.createMediaStreamSource(ch.stream);
    ch.source.connect(ch.analyser);
    if (!voice) this.routeToMonitor(ch);
    ch.active = true;
    ch.label = label || track.label || '';
    this.mode = 'live';
    return ch;
  }

  async useMusicDevice(deviceId, label='') {
    this.player.pause();
    return this.connectDevice(this.music, deviceId, label, false);
  }

  async useMicDevice(deviceId, label='') {
    return this.connectDevice(this.mic, deviceId, label, true);
  }

  async useFile(file) {
    await this.setup();
    this.prepare(this.music);
    this.stopChannel(this.music);
    this.player.src = URL.createObjectURL(file);
    if (!this.elementSource) this.elementSource = this.ctx.createMediaElementSource(this.player);
    this.elementSource.connect(this.music.analyser);
    this.music.source = this.elementSource;
    this.routeToMonitor(this.music);
    this.music.active = true;
    this.music.label = file.name;
    await this.player.play();
    this.mode = 'live';
  }

  async testOutput() {
    await this.setup();
    const osc=this.ctx.createOscillator(), gain=this.ctx.createGain();
    osc.frequency.value=440;
    gain.gain.setValueAtTime(.0001,this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.12,this.ctx.currentTime+.03);
    gain.gain.exponentialRampToValueAtTime(.0001,this.ctx.currentTime+.35);
    osc.connect(gain); gain.connect(this.monitorGain);
    osc.start(); osc.stop(this.ctx.currentTime+.4);
  }

  async useSystemAudio() {
    this.checkSupport();
    await this.setup();
    this.prepare(this.music);
    this.stopChannel(this.music);
    this.player.pause();
    const capture = await navigator.mediaDevices.getDisplayMedia({ video:true, audio:true });
    const tracks = capture.getAudioTracks();
    if (!tracks.length) {
      capture.getTracks().forEach(t => t.stop());
      throw new Error('NO_SYSTEM_AUDIO');
    }
    this.music.stream = capture;
    const audioOnly = new MediaStream(tracks);
    this.music.source = this.ctx.createMediaStreamSource(audioOnly);
    this.music.source.connect(this.music.analyser);
    this.routeToMonitor(this.music);
    this.music.active = true;
    this.music.label = tracks[0]?.label || 'Audio sistem';
    this.mode = 'live';
  }

  demo() { this.disconnect(); this.mode = 'demo'; }

  analyse(ch) {
    if (!ch.active || !ch.analyser) {
      ch.level *= .7;
      ch.raw = ch.detected = ch.peak = ch.bass = ch.mid = ch.high = 0;
      return;
    }
    ch.analyser.getByteFrequencyData(ch.freq);
    ch.analyser.getByteTimeDomainData(ch.time);
    const avg = (a,b) => {
      let n=0;
      for (let i=a; i<Math.min(b,ch.freq.length); i++) n += ch.freq[i];
      return n / Math.max(1, Math.min(b,ch.freq.length)-a) / 255;
    };
    let sum=0, peak=0;
    for (const value of ch.time) {
      const s=(value-128)/128;
      sum += s*s;
      peak = Math.max(peak, Math.abs(s));
    }
    const rms=Math.sqrt(sum/ch.time.length), low=avg(1,12), middle=avg(12,100), treble=avg(100,420), spectral=(low+middle+treble)/3;
    ch.raw=Math.min(1,Math.max(spectral,rms*3,peak*.85));
    if (ch.raw > .006) ch.lastSignalAt = performance.now();
    ch.peak=peak;
    ch.bass=ch.bass*.55+low*.45;
    ch.mid=ch.mid*.62+middle*.38;
    ch.high=ch.high*.68+treble*.32;
    if (ch.voice) {
      if (ch.calibration>0) {
        ch.noiseFloor=ch.calibration===90?ch.raw:ch.noiseFloor*.94+ch.raw*.06;
        ch.calibration--;
        ch.detected=0;
        ch.level*=.72;
      } else {
        const threshold=Math.max(.012,ch.noiseFloor*1.55+.006);
        if (ch.raw<threshold*1.08) ch.noiseFloor=ch.noiseFloor*.997+ch.raw*.003;
        ch.detected=Math.max(0,Math.min(1,(ch.raw-threshold)*7.5));
        const speed=ch.detected>ch.level?.42:.09;
        ch.level+=(ch.detected-ch.level)*speed;
      }
    } else {
      ch.detected=ch.raw;
      ch.level=ch.level*.62+ch.raw*.38;
    }
    const tone=(ch.mid*.45+ch.high)/(ch.bass+ch.mid*.45+ch.high+.001);
    ch.tone=ch.tone*.82+tone*.18;
  }

  signalState(ch) {
    if (!ch.active) return 'off';
    if (ch.calibration > 0) return 'calibrating';
    return performance.now() - ch.lastSignalAt < 1200 ? 'signal' : 'silent';
  }

  update(t) {
    if (this.mode==='demo') {
      const beat=Math.max(0,Math.sin(t*.006))**9;
      this.music.bass=.3+beat*.65;
      this.music.mid=.28+(Math.sin(t*.0021+1)+1)*.18;
      this.music.high=.22+(Math.sin(t*.0043)+1)*.12;
      this.music.level=(this.music.bass+this.music.mid+this.music.high)/3;
      this.music.raw=this.music.detected=this.music.level;
      this.music.tone=.5+Math.sin(t*.001)*.28;
      this.mic.level=this.mic.raw=this.mic.detected=0;
    } else {
      this.analyse(this.music);
      this.analyse(this.mic);
    }
    this.musicLevel=this.music.level;
    this.micLevel=this.mic.level;
    this.musicRaw=this.music.detected;
    this.micRaw=this.mic.detected;
    this.level=Math.max(this.musicLevel,this.micLevel);
    this.raw=Math.max(this.musicRaw,this.micRaw);
    const lead=this.musicLevel>.002?this.music:this.mic;
    this.bass=lead.bass; this.mid=lead.mid; this.high=lead.high; this.tone=lead.tone;
    return this;
  }
}
window.AudioEngine=AudioEngine;
