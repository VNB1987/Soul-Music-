"use strict";

const SoulBanner = {
  track: null,
  messages: [
    {
      text: "BINE AI VENIT ÎN FAMILIA SOUL MUSIC 🎶",
      color: "#ffffff"
    },
    {
      text: "MULȚUMESC CĂ EȘTI AICI ❤️",
      color: "#ff405c"
    },
    {
      text: "ASCULTĂ • SIMTE • TRĂIEȘTE MUZICA",
      color: "#36baff"
    },
    {
      text: "RESPECT • ENERGIE • VIBRAȚIE • FAMILIE",
      color: "#ffd55e"
    },
    {
      text: "DĂ FOLLOW ȘI RĂMÂI ALĂTURI DE NOI",
      color: "#ff5cdb"
    },
    {
      text: "MUZICA ÎNCEPE ACOLO UNDE CUVINTELE SE OPRESC",
      color: "#62f5ff"
    },
    {
      text: "SOUL MUSIC 🎶 — STARE, NU DOAR MUZICĂ",
      color: "#ffe89a"
    },
    {
      text: "ÎMPREUNĂ FACEM CEA MAI FRUMOASĂ ENERGIE",
      color: "#ffffff"
    }
  ],

  position: 0,
  speed: 115,
  lastTime: 0,
  contentWidth: 0,

  init() {
    this.track =
      document.getElementById("tickerTrack");

    if (!this.track) {
      console.error(
        "tickerTrack nu a fost găsit."
      );

      return;
    }

    this.buildMessages();
    this.measure();
    this.position = 1920;

    window.addEventListener(
      "resize",
      () => this.measure()
    );

    requestAnimationFrame(
      time => this.animate(time)
    );
  },

  buildMessages() {
    this.track.innerHTML = "";

    const duplicatedMessages = [
      ...this.messages,
      ...this.messages
    ];

    duplicatedMessages.forEach(
      (message, index) => {
        const item =
          document.createElement("span");

        item.textContent =
          message.text;

        item.style.color =
          message.color;

        item.style.marginRight =
          "100px";

        item.style.textShadow = `
          0 0 10px ${message.color},
          0 0 22px ${message.color}
        `;

        item.style.display =
          "inline-block";

        item.style.opacity =
          "0.98";

        item.dataset.index =
          String(index);

        this.track.appendChild(item);
      }
    );
  },

  measure() {
    this.contentWidth =
      this.track.scrollWidth / 2;
  },

  animate(time) {
    requestAnimationFrame(
      nextTime =>
        this.animate(nextTime)
    );

    if (!this.lastTime) {
      this.lastTime = time;
    }

    const deltaSeconds =
      Math.min(
        0.05,
        (time - this.lastTime) / 1000
      );

    this.lastTime = time;

    const audio =
      window.SoulAudio
        ? SoulAudio.getState()
        : null;

    const musicEnergy =
      audio
        ? Math.min(
            1,
            audio.music.level +
            audio.music.bass * 0.45
          )
        : 0;

    const voiceEnergy =
      audio
        ? Math.min(
            1,
            audio.voice.level
          )
        : 0;

    const mode =
      window.EngineV8?.mode ||
      "calm";

    const modeSpeed =
      mode === "party"
        ? 1.32
        : 1;

    const reactiveSpeed =
      1 +
      musicEnergy * 0.32 +
      voiceEnergy * 0.10;

    this.position -=
      this.speed *
      modeSpeed *
      reactiveSpeed *
      deltaSeconds;

    if (
      this.position <=
      -this.contentWidth
    ) {
      this.position +=
        this.contentWidth;
    }

    this.track.style.transform =
      `translate3d(${this.position}px, 0, 0)`;

    this.animateGlow(
      time,
      musicEnergy,
      voiceEnergy
    );
  },

  animateGlow(
    time,
    musicEnergy,
    voiceEnergy
  ) {
    const ticker =
      document.getElementById("ticker");

    const tickerGlow =
      document.getElementById(
        "tickerGlow"
      );

    if (!ticker || !tickerGlow) {
      return;
    }

    const hue =
      (time * 0.035) % 360;

    const voiceActive =
      voiceEnergy > 0.10;

    if (voiceActive) {
      tickerGlow.style.background = `
        linear-gradient(
          90deg,
          #5b0018,
          #ff284f,
          #8c001f,
          #c4572a,
          #5b0018
        )
      `;

      tickerGlow.style.backgroundSize =
        "300% 100%";

      ticker.style.boxShadow = `
        0 0 ${
          24 + voiceEnergy * 34
        }px rgba(255, 40, 79, 0.46),
        inset 0 0 ${
          18 + voiceEnergy * 22
        }px rgba(117, 0, 30, 0.26)
      `;
    } else {
      tickerGlow.style.background = `
        linear-gradient(
          90deg,
          hsl(${hue}, 100%, 62%),
          hsl(${(hue + 70) % 360}, 100%, 62%),
          hsl(${(hue + 145) % 360}, 100%, 62%),
          hsl(${(hue + 220) % 360}, 100%, 62%),
          hsl(${(hue + 290) % 360}, 100%, 62%)
        )
      `;

      tickerGlow.style.backgroundSize =
        "300% 100%";

      ticker.style.boxShadow = `
        0 0 ${
          18 + musicEnergy * 30
        }px hsla(
          ${hue},
          100%,
          62%,
          ${0.18 + musicEnergy * 0.24}
        ),
        inset 0 0 ${
          14 + musicEnergy * 18
        }px rgba(39, 232, 255, 0.10)
      `;
    }

    tickerGlow.style.opacity =
      String(
        0.68 +
        musicEnergy * 0.22 +
        voiceEnergy * 0.18
      );
  }
};

window.SoulBanner =
  SoulBanner;

window.addEventListener(
  "DOMContentLoaded",
  () => SoulBanner.init()
);
