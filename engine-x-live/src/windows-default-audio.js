// DJ Soul V15 — Engine X Windows default/system audio patch
// Music analysis comes from Windows system audio instead of the Chrome-only VB-CABLE route.
(() => {
  const status = document.querySelector('#statusText');
  const musicState = document.querySelector('#musicState');
  const systemBtn = document.querySelector('#systemBtn');
  const autoBtn = document.querySelector('#autoAudioBtn');
  const musicBtn = document.querySelector('#musicBtn');

  const setState = (el, text, state='off') => {
    if (!el) return;
    el.textContent = text;
    el.dataset.state = state;
  };

  async function useWindowsDefaultAudio() {
    if (!navigator.mediaDevices?.getDisplayMedia) throw new Error('SYSTEM_CAPTURE_UNSUPPORTED');

    await audio.setup();
    audio.prepare(audio.music);
    audio.stopChannel(audio.music);
    audio.player.pause();

    // Chromium/Windows: request the full Windows/system mix. The browser still
    // requires one user confirmation for privacy; choose Entire Screen and
    // enable Share system audio in the picker.
    let capture;
    try {
      capture = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'monitor' },
        audio: true,
        systemAudio: 'include',
        selfBrowserSurface: 'exclude',
        surfaceSwitching: 'exclude'
      });
    } catch (err) {
      throw err;
    }

    const tracks = capture.getAudioTracks();
    if (!tracks.length) {
      capture.getTracks().forEach(t => t.stop());
      throw new Error('NO_SYSTEM_AUDIO');
    }

    audio.music.stream = capture;
    const audioOnly = new MediaStream(tracks);
    audio.music.source = audio.ctx.createMediaStreamSource(audioOnly);
    audio.music.source.connect(audio.music.analyser);

    // IMPORTANT: analyse only. Do not send captured Windows audio back to the
    // speakers, otherwise it doubles/echoes the sound.
    audio.music.monitor = null;
    audio.music.active = true;
    audio.music.label = tracks[0]?.label || 'Windows Default Audio';
    audio.mode = 'live';
    return audio.music;
  }

  window.useWindowsDefaultAudio = useWindowsDefaultAudio;

  async function connectWindowsDefault() {
    try {
      if (status) status.textContent = 'ENGINE X · ALEGE ECRAN ÎNTREG ȘI ACTIVEAZĂ SHARE SYSTEM AUDIO';
      setState(musicState, 'CONECTARE WINDOWS…', 'warn');
      await useWindowsDefaultAudio();
      systemBtn?.classList.add('connected');
      musicBtn?.classList.remove('connected');
      setState(musicState, 'WINDOWS DEFAULT', 'ok');
      if (status) status.textContent = 'ENGINE X · AUDIO GENERAL WINDOWS CONECTAT';
    } catch (err) {
      setState(musicState, 'EROARE', 'warn');
      if (status) status.textContent = err?.message === 'NO_SYSTEM_AUDIO'
        ? 'NU A FOST ACTIVAT SHARE SYSTEM AUDIO'
        : 'CAPTURA AUDIO WINDOWS A FOST ANULATĂ';
    }
  }

  // Override the old Chrome/VB-CABLE-first behaviour.
  if (systemBtn) {
    systemBtn.textContent = 'AUDIO WINDOWS DEFAULT';
    systemBtn.onclick = connectWindowsDefault;
  }

  // Auto configuration now uses Windows system audio for MUSIC. Output/mic
  // stay handled by the existing V15 controls and are not changed here.
  if (autoBtn) {
    autoBtn.onclick = connectWindowsDefault;
    autoBtn.textContent = 'CONECTEAZĂ AUDIO WINDOWS';
  }
})();
