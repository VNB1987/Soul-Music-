"use strict";

const SoulAudio = {
  music: {
    stream: null,
    context: null,
    analyser: null,
    frequencyData: null,
    timeData: null,
    level: 0,
    bass: 0,
    mids: 0,
    highs: 0,
    active: false
  },

  voice: {
    stream: null,
    context: null,
    analyser: null,
    frequencyData: null,
    timeData: null,
    level: 0,
    bass: 0,
    mids: 0,
    highs: 0,
    active: false
  },

  elements: {},

  async init() {
    this.cacheElements();
    this.bindButtons();
    await this.loadDevices();

    window.dispatchEvent(
      new CustomEvent("soulmusic:audioready")
    );
  },

  cacheElements() {
    this.elements.musicDevice =
      document.getElementById("musicDevice");

    this.elements.voiceDevice =
      document.getElementById("voiceDevice");

    this.elements.activateMusic =
      document.getElementById("activateMusic");

    this.elements.activateVoice =
      document.getElementById("activateVoice");

    this.elements.musicSensitivity =
      document.getElementById("musicSensitivity");

    this.elements.voiceSensitivity =
      document.getElementById("voiceSensitivity");

    this.elements.bassSensitivity =
      document.getElementById("bassSensitivity");

    this.elements.neonIntensity =
      document.getElementById("neonIntensity");

    this.elements.statusText =
      document.getElementById("statusText");
  },

  bindButtons() {
    this.elements.activateMusic?.addEventListener(
      "click",
      async () => {
        await this.activateInput(
          "music",
          this.elements.musicDevice
        );
      }
    );

    this.elements.activateVoice?.addEventListener(
      "click",
      async () => {
        await this.activateInput(
          "voice",
          this.elements.voiceDevice
        );
      }
    );

    navigator.mediaDevices?.addEventListener(
      "devicechange",
      () => this.loadDevices()
    );
  },

  async loadDevices() {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "Browserul nu permite accesul audio."
        );
      }

      const permissionStream =
        await navigator.mediaDevices.getUserMedia({
          audio: true
        });

      permissionStream
        .getTracks()
        .forEach(track => track.stop());

      const devices =
        await navigator.mediaDevices.enumerateDevices();

      const audioInputs = devices.filter(
        device => device.kind === "audioinput"
      );

      this.fillSelect(
        this.elements.musicDevice,
        audioInputs
      );

      this.fillSelect(
        this.elements.voiceDevice,
        audioInputs
      );

      this.selectRecommendedDevices();

      this.setStatus(
        "Dispozitive încărcate. Selectează CABLE Output pentru muzică și microfonul real pentru voce."
      );
    } catch (error) {
      console.error("Audio device error:", error);

      this.setStatus(
        `Eroare audio: ${error.name || error.message}`
      );
    }
  },

  fillSelect(select, devices) {
    if (!select) {
      return;
    }

    select.innerHTML = "";

    devices.forEach((device, index) => {
      const option = document.createElement("option");

      option.value = device.deviceId;
      option.textContent =
        device.label ||
        `Dispozitiv audio ${index + 1}`;

      select.appendChild(option);
    });
  },

  selectRecommendedDevices() {
    const musicOptions = [
      ...this.elements.musicDevice.options
    ];

    const cableOutput = musicOptions.find(option =>
      /CABLE Output/i.test(option.textContent)
    );

    if (cableOutput) {
      this.elements.musicDevice.value =
        cableOutput.value;
    }

    const voiceOptions = [
      ...this.elements.voiceDevice.options
    ];

    const realMicrophone = voiceOptions.find(option =>
      /S6|Webcam|Microphone|Microfon/i.test(
        option.textContent
      ) &&
      !/CABLE|Steam/i.test(option.textContent)
    );

    if (realMicrophone) {
      this.elements.voiceDevice.value =
        realMicrophone.value;
    }
  },

  async activateInput(type, select) {
    try {
      if (!select?.value) {
        throw new Error(
          "Nu este selectat niciun dispozitiv."
        );
      }

      await this.stopInput(type);

      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: {
            deviceId: {
              exact: select.value
            },

            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
          }
        });

      const AudioContextClass =
        window.AudioContext ||
        window.webkitAudioContext;

      const context =
        new AudioContextClass();

      await context.resume();

      const source =
        context.createMediaStreamSource(stream);

      const analyser =
        context.createAnalyser();

      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.82;
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;

      source.connect(analyser);

      const target = this[type];

      target.stream = stream;
      target.context = context;
      target.analyser = analyser;

      target.frequencyData =
        new Uint8Array(
          analyser.frequencyBinCount
        );

      target.timeData =
        new Uint8Array(
          analyser.fftSize
        );

      target.active = true;

      this.setStatus(
        type === "music"
          ? "Muzica este activă."
          : "Microfonul este activ."
      );

      window.dispatchEvent(
        new CustomEvent(
          "soulmusic:inputactivated",
          {
            detail: { type }
          }
        )
      );
    } catch (error) {
      console.error(
        `${type} activation error:`,
        error
      );

      this.setStatus(
        `Eroare ${type}: ${
          error.name || error.message
        }`
      );
    }
  },

  async stopInput(type) {
    const target = this[type];

    if (target.stream) {
      target.stream
        .getTracks()
        .forEach(track => track.stop());
    }

    if (
      target.context &&
      target.context.state !== "closed"
    ) {
      await target.context.close();
    }

    target.stream = null;
    target.context = null;
    target.analyser = null;
    target.frequencyData = null;
    target.timeData = null;
    target.active = false;
  },

  update() {
    this.updateInput("music");
    this.updateInput("voice");
  },

  updateInput(type) {
    const target = this[type];

    if (
      !target.active ||
      !target.analyser ||
      !target.frequencyData
    ) {
      target.level *= 0.88;
      target.bass *= 0.88;
      target.mids *= 0.88;
      target.highs *= 0.88;

      return;
    }

    target.analyser.getByteFrequencyData(
      target.frequencyData
    );

    const data = target.frequencyData;
    const length = data.length;

    const bassEnd =
      Math.floor(length * 0.10);

    const midsEnd =
      Math.floor(length * 0.38);

    const highsEnd =
      Math.floor(length * 0.78);

    const bassValue =
      this.averageRange(
        data,
        1,
        bassEnd
      ) / 255;

    const midsValue =
      this.averageRange(
        data,
        bassEnd,
        midsEnd
      ) / 255;

    const highsValue =
      this.averageRange(
        data,
        midsEnd,
        highsEnd
      ) / 255;

    const rawLevel =
      bassValue * 0.48 +
      midsValue * 0.34 +
      highsValue * 0.18;

    const sensitivity =
      type === "music"
        ? Number(
            this.elements.musicSensitivity.value
          )
        : Number(
            this.elements.voiceSensitivity.value
          );

    const bassSensitivity =
      Number(
        this.elements.bassSensitivity.value
      );

    const targetLevel =
      Math.min(1, rawLevel * sensitivity);

    const targetBass =
      Math.min(
        1,
        bassValue *
          sensitivity *
          bassSensitivity
      );

    const targetMids =
      Math.min(1, midsValue * sensitivity);

    const targetHighs =
      Math.min(1, highsValue * sensitivity);

    target.level +=
      (targetLevel - target.level) * 0.24;

    target.bass +=
      (targetBass - target.bass) * 0.30;

    target.mids +=
      (targetMids - target.mids) * 0.22;

    target.highs +=
      (targetHighs - target.highs) * 0.34;
  },

  averageRange(data, start, end) {
    let total = 0;
    let count = 0;

    for (
      let index = start;
      index < end;
      index += 1
    ) {
      total += data[index];
      count += 1;
    }

    return count > 0
      ? total / count
      : 0;
  },

  getState() {
    return {
      music: {
        active: this.music.active,
        level: this.music.level,
        bass: this.music.bass,
        mids: this.music.mids,
        highs: this.music.highs,
        frequencyData:
          this.music.frequencyData
      },

      voice: {
        active: this.voice.active,
        level: this.voice.level,
        bass: this.voice.bass,
        mids: this.voice.mids,
        highs: this.voice.highs,
        frequencyData:
          this.voice.frequencyData
      },

      neonIntensity: Number(
        this.elements.neonIntensity?.value || 1.6
      )
    };
  },

  setStatus(message) {
    if (this.elements.statusText) {
      this.elements.statusText.textContent =
        message;
    }
  }
};

window.SoulAudio = SoulAudio;

window.addEventListener(
  "DOMContentLoaded",
  () => SoulAudio.init()
);
