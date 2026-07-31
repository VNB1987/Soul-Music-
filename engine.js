"use strict";

const EngineV8 = {
  stageWidth: 1920,
  stageHeight: 1080,
  locked: false,
  mode: "calm",

  elements: {},

  init() {
    this.cacheElements();
    this.fitStage();
    this.bindShortcuts();
    this.bindPanelButtons();
    this.initializeCanvases();
    this.showNotice("Soul Music Engine V8 pornit");

    window.addEventListener("resize", () => this.fitStage());
  },

  cacheElements() {
    this.elements.viewport = document.getElementById("viewport");
    this.elements.stage = document.getElementById("stage");
    this.elements.controlPanel = document.getElementById("controlPanel");
    this.elements.shortcutNotice =
      document.getElementById("shortcutNotice");

    this.elements.hidePanel =
      document.getElementById("hidePanel");

    this.elements.calmMode =
      document.getElementById("calmMode");

    this.elements.partyMode =
      document.getElementById("partyMode");

    this.elements.ambientCanvas =
      document.getElementById("ambientCanvas");

    this.elements.visualizerCanvas =
      document.getElementById("visualizerCanvas");

    this.elements.effectsCanvas =
      document.getElementById("effectsCanvas");
  },

  fitStage() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const scaleX = viewportWidth / this.stageWidth;
    const scaleY = viewportHeight / this.stageHeight;

    const scale = Math.min(scaleX, scaleY);

    const stage = this.elements.stage;

    stage.style.transform =
      `translate(-50%, -50%) scale(${scale})`;
  },

  initializeCanvases() {
    const canvases = [
      this.elements.ambientCanvas,
      this.elements.visualizerCanvas,
      this.elements.effectsCanvas
    ];

    for (const canvas of canvases) {
      if (!canvas) {
        continue;
      }

      canvas.width = this.stageWidth;
      canvas.height = this.stageHeight;
    }
  },

  bindShortcuts() {
    window.addEventListener("keydown", async event => {
      const key = event.key.toLowerCase();

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
    });
  },

  bindPanelButtons() {
    this.elements.hidePanel?.addEventListener(
      "click",
      () => {
        if (!this.locked) {
          this.hideControlPanel();
        }
      }
    );

    this.elements.calmMode?.addEventListener(
      "click",
      () => this.setMode("calm")
    );

    this.elements.partyMode?.addEventListener(
      "click",
      () => this.setMode("party")
    );
  },

  toggleControlPanel() {
    const panel = this.elements.controlPanel;

    panel.classList.toggle("hidden");
  },

  hideControlPanel() {
    this.elements.controlPanel.classList.add("hidden");
  },

  showControlPanel() {
    this.elements.controlPanel.classList.remove("hidden");
  },

  async toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();

        this.showNotice("Fullscreen activat");
      } else {
        await document.exitFullscreen();

        this.showNotice("Fullscreen dezactivat");
      }
    } catch (error) {
      console.error("Fullscreen error:", error);

      this.showNotice(
        "Browserul nu permite fullscreen"
      );
    }
  },

  setMode(mode) {
    this.mode = mode;

    document.body.dataset.engineMode = mode;

    this.showNotice(
      mode === "party"
        ? "Mod Party activat"
        : "Mod Calm activat"
    );

    window.dispatchEvent(
      new CustomEvent(
        "soulmusic:modechange",
        {
          detail: { mode }
        }
      )
    );
  },

  showNotice(message) {
    const notice = this.elements.shortcutNotice;

    notice.textContent = message;
    notice.classList.add("visible");

    window.clearTimeout(this.noticeTimer);

    this.noticeTimer = window.setTimeout(
      () => {
        notice.classList.remove("visible");
      },
      1500
    );
  }
};

window.EngineV8 = EngineV8;

window.addEventListener(
  "DOMContentLoaded",
  () => EngineV8.init()
);
