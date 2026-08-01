"use strict";

const EngineV8 = {
  stageWidth: 1920,
  stageHeight: 1080,

  locked: false,
  mode: "live",
  quality: "ultra",

  fps: 60,
  smoothedFps: 60,
  lastFrameTime: performance.now(),

  noticeTimer: null,
  performanceTimer: null,

  elements: {},

  presets: {
    calm: {
      name: "Calm",
      musicSensitivity: 3.2,
      voiceSensitivity: 4.8,
      bassSensitivity: 1.4,
      neonIntensity: 1.15,
      effectMultiplier: 0.72,
      particleMultiplier: 0.55,
      speedMultiplier: 0.75
    },

    live: {
      name: "Live",
      musicSensitivity: 4.5,
      voiceSensitivity: 6,
      bassSensitivity: 2,
      neonIntensity: 1.6,
      effectMultiplier: 1,
      particleMultiplier: 1,
      speedMultiplier: 1
    },

    party: {
      name: "Party",
      musicSensitivity: 5.6,
      voiceSensitivity: 6.4,
      bassSensitivity: 2.7,
      neonIntensity: 2.1,
      effectMultiplier: 1.3,
      particleMultiplier: 1.35,
      speedMultiplier: 1.25
    },

    legendary: {
      name: "Legendary",
      musicSensitivity: 6.4,
      voiceSensitivity: 7,
      bassSensitivity: 3.3,
      neonIntensity: 2.65,
      effectMultiplier: 1.65,
      particleMultiplier: 1.75,
      speedMultiplier: 1.45
    }
  },

  init() {
    this.cacheElements();
    this.initializeCanvases();
    this.fitStage();
    this.bindShortcuts();
    this.bindPanelButtons();
    this.setMode("live", false);
    this.startPerformanceMonitor();

    window.addEventListener(
      "resize",
      () => this.fitStage()
    );

    document.addEventListener(
      "visibilitychange",
      () => this.handleVisibilityChange()
    );

    this.showNotice(
      "Soul Music Engine V8 Premium pornit"
    );
  },

  cacheElements() {
    this.elements.viewport =
      document.getElementById("viewport");

    this.elements.stage =
      document.getElementById("stage");

    this.elements.controlPanel =
      document.getElementById("controlPanel");

    this.elements.shortcutNotice =
      document.getElementById("shortcutNotice");

    this.elements.hidePanel =
      document.getElementById("hidePanel");

    this.elements.calmMode =
      document.getElementById("calmMode");

    this.elements.partyMode =
      document.getElementById("partyMode");

    this.elements.musicSensitivity =
      document.getElementById(
        "musicSensitivity"
      );

    this.elements.voiceSensitivity =
      document.getElementById(
        "voiceSensitivity"
      );

    this.elements.bassSensitivity =
      document.getElementById(
        "bassSensitivity"
      );

    this.elements.neonIntensity =
      document.getElementById(
        "neonIntensity"
      );

    this.elements.ambientCanvas =
      document.getElementById(
        "ambientCanvas"
      );

    this.elements.visualizerCanvas =
      document.getElementById(
        "visualizerCanvas"
      );

    this.elements.effectsCanvas =
      document.getElementById(
        "effectsCanvas"
      );
  },

  initializeCanvases() {
    const canvases = [
      this.elements.ambientCanvas,
      this.elements.visualizerCanvas,
      this.elements.effectsCanvas
    ];

    canvases.forEach(canvas => {
      if (!canvas) {
        return;
      }

      canvas.width = this.stageWidth;
      canvas.height = this.stageHeight;
    });
  },

  fitStage() {
    const viewportWidth =
      window.innerWidth;

    const viewportHeight =
      window.innerHeight;

    const scaleX =
      viewportWidth / this.stageWidth;

    const scaleY =
      viewportHeight / this.stageHeight;

    const scale =
      Math.min(scaleX, scaleY);

    if (!this.elements.stage) {
      return;
    }

    this.elements.stage.style.transform = `
      translate(-50%, -50%)
      scale(${scale})
    `;
  },

  bindShortcuts() {
    window.addEventListener(
      "keydown",
      async event => {
        const key =
          event.key.toLowerCase();

        if (key === "l") {
          this.locked = !this.locked;

          this.showNotice(
            this.locked
              ? "Comenzile au fost blocate"
              : "Comenzile au fost deblocate"
          );

          return;
        }

        if (this.locked) {
          return;
        }

        if (key === "c") {
          this.toggleControlPanel();
        }

        if (key === "f") {
          await this.toggleFullscreen();
        }

        if (key === "1") {
          this.setMode("calm");
        }

        if (key === "2") {
          this.setMode("live");
        }

        if (key === "3") {
          this.setMode("party");
        }

        if (key === "4") {
          this.setMode("legendary");
        }

        if (key === "r") {
          this.resetAudioControls();
        }
      }
    );
  },

  bindPanelButtons() {
    this.elements.hidePanel
      ?.addEventListener(
        "click",
        () => {
          if (!this.locked) {
            this.hideControlPanel();
          }
        }
      );

    this.elements.calmMode
      ?.addEventListener(
        "click",
        () => this.setMode("calm")
      );

    this.elements.partyMode
      ?.addEventListener(
        "click",
        () => this.setMode("party")
      );
  },

  toggleControlPanel() {
    this.elements.controlPanel
      ?.classList.toggle("hidden");
  },

  hideControlPanel() {
    this.elements.controlPanel
      ?.classList.add("hidden");
  },

  showControlPanel() {
    this.elements.controlPanel
      ?.classList.remove("hidden");
  },

  async toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement
          .requestFullscreen();

        this.showNotice(
          "Fullscreen activat"
        );
      } else {
        await document.exitFullscreen();

        this.showNotice(
          "Fullscreen dezactivat"
        );
      }

      window.setTimeout(
        () => this.fitStage(),
        120
      );
    } catch (error) {
      console.error(
        "Fullscreen error:",
        error
      );

      this.showNotice(
        "Browserul nu permite fullscreen"
      );
    }
  },

  setMode(mode, notify = true) {
    const preset =
      this.presets[mode];

    if (!preset) {
      return;
    }

    this.mode = mode;

    document.body.dataset.engineMode =
      mode;

    this.applyPreset(preset);

    window.dispatchEvent(
      new CustomEvent(
        "soulmusic:modechange",
        {
          detail: {
            mode,
            preset: { ...preset }
          }
        }
      )
    );

    if (notify) {
      this.showNotice(
        `Mod ${preset.name} activat`
      );
    }
  },

  applyPreset(preset) {
    this.setInputValue(
      this.elements.musicSensitivity,
      preset.musicSensitivity
    );

    this.setInputValue(
      this.elements.voiceSensitivity,
      preset.voiceSensitivity
    );

    this.setInputValue(
      this.elements.bassSensitivity,
      preset.bassSensitivity
    );

    this.setInputValue(
      this.elements.neonIntensity,
      preset.neonIntensity
    );
  },

  setInputValue(element, value) {
    if (!element) {
      return;
    }

    element.value =
      String(value);

    element.dispatchEvent(
      new Event(
        "input",
        { bubbles: true }
      )
    );
  },

  resetAudioControls() {
    this.setMode("live", false);

    this.showNotice(
      "Setările audio au fost resetate"
    );
  },

  getPreset() {
    return (
      this.presets[this.mode] ||
      this.presets.live
    );
  },

  getPerformanceState() {
    return {
      mode: this.mode,
      quality: this.quality,
      fps: this.smoothedFps,
      locked: this.locked,
      preset: {
        ...this.getPreset()
      }
    };
  },

  startPerformanceMonitor() {
    const measureFrame = now => {
      const delta =
        Math.max(
          1,
          now - this.lastFrameTime
        );

      this.lastFrameTime = now;

      this.fps =
        1000 / delta;

      this.smoothedFps +=
        (
          this.fps -
          this.smoothedFps
        ) * 0.08;

      window.requestAnimationFrame(
        measureFrame
      );
    };

    window.requestAnimationFrame(
      measureFrame
    );

    this.performanceTimer =
      window.setInterval(
        () => this.adjustQuality(),
        2500
      );
  },

  adjustQuality() {
    const previousQuality =
      this.quality;

    if (this.smoothedFps < 36) {
      this.quality = "performance";
    } else if (
      this.smoothedFps < 50
    ) {
      this.quality = "balanced";
    } else {
      this.quality = "ultra";
    }

    if (
      previousQuality !==
      this.quality
    ) {
      document.body.dataset.quality =
        this.quality;

      window.dispatchEvent(
        new CustomEvent(
          "soulmusic:qualitychange",
          {
            detail: {
              quality: this.quality,
              fps: this.smoothedFps
            }
          }
        )
      );

      if (
        this.quality ===
        "performance"
      ) {
        this.showNotice(
          "Optimizare automată activată"
        );
      }
    }
  },

  getQualityMultiplier() {
    if (
      this.quality ===
      "performance"
    ) {
      return 0.58;
    }

    if (
      this.quality ===
      "balanced"
    ) {
      return 0.8;
    }

    return 1;
  },

  handleVisibilityChange() {
    const eventName =
      document.hidden
        ? "soulmusic:pause"
        : "soulmusic:resume";

    window.dispatchEvent(
      new CustomEvent(eventName)
    );

    if (!document.hidden) {
      this.lastFrameTime =
        performance.now();

      this.fitStage();
    }
  },

  showNotice(message) {
    const notice =
      this.elements.shortcutNotice;

    if (!notice) {
      return;
    }

    notice.textContent =
      message;

    notice.classList.add(
      "visible"
    );

    window.clearTimeout(
      this.noticeTimer
    );

    this.noticeTimer =
      window.setTimeout(
        () => {
          notice.classList.remove(
            "visible"
          );
        },
        1600
      );
  }
};

window.EngineV8 = EngineV8;

window.addEventListener(
  "DOMContentLoaded",
  () => EngineV8.init()
);
