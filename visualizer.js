"use strict";

const SoulVisualizer = {
  canvas: null,
  context: null,

  width: 1920,
  height: 1080,

  logoBox: {
    x: 565,
    y: 110,
    width: 790,
    height: 520
  },

  particles: [],

  previousBass: 0,
  beatEnergy: 0,
  voiceEnergy: 0,

  init() {
    this.canvas =
      document.getElementById("visualizerCanvas");

    if (!this.canvas) {
      console.error(
        "Nu a fost găsit visualizerCanvas."
      );

      return;
    }

    this.context =
      this.canvas.getContext("2d");

    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.createParticles();

    requestAnimationFrame(
      time => this.animate(time)
    );
  },

  createParticles() {
    this.particles = [];

    for (
      let index = 0;
      index < 110;
      index += 1
    ) {
      this.particles.push({
        angle:
          Math.random() *
          Math.PI *
          2,

        distance:
          210 +
          Math.random() *
          230,

        size:
          0.8 +
          Math.random() *
          3.2,

        speed:
          0.00015 +
          Math.random() *
          0.0011,

        phase:
          Math.random() *
          Math.PI *
          2
      });
    }
  },

  animate(time = 0) {
    requestAnimationFrame(
      nextTime =>
        this.animate(nextTime)
    );

    if (!window.SoulAudio) {
      return;
    }

    SoulAudio.update();

    const audio =
      SoulAudio.getState();

    const music =
      audio.music;

    const voice =
      audio.voice;

    const musicLevel =
      Number(music.level || 0);

    const voiceLevel =
      Number(voice.level || 0);

    const musicActive =
      music.active &&
      (
        musicLevel > 0.008 ||
        music.bass > 0.008
      );

    /*
      Vocea devine vizibilă doar când:
      1. microfonul este activ;
      2. nivelul depășește zgomotul ambiental;
      3. vocea are suficientă intensitate.
    */

    const voiceThreshold = 0.10;

    const voiceDetected =
      voice.active &&
      voiceLevel > voiceThreshold;

    /*
      Nu înlocuim muzica.
      Vocea este doar un strat roșu peste muzică.
    */

    const targetVoiceEnergy =
      voiceDetected
        ? Math.min(
            1,
            (
              voiceLevel -
              voiceThreshold
            ) * 5
          )
        : 0;

    this.voiceEnergy +=
      (
        targetVoiceEnergy -
        this.voiceEnergy
      ) *
      (
        targetVoiceEnergy >
        this.voiceEnergy
          ? 0.32
          : 0.12
      );

    this.detectBeat(music);

    this.context.clearRect(
      0,
      0,
      this.width,
      this.height
    );

    this.drawBaseHalo(
      time,
      musicLevel,
      this.voiceEnergy
    );

    if (musicActive) {
      this.drawMusicVisualizer(
        time,
        music,
        audio.neonIntensity
      );

      this.drawMusicBeams(
        time,
        music,
        audio.neonIntensity
      );

      this.drawMusicParticles(
        time,
        music
      );
    }

    if (this.voiceEnergy > 0.01) {
      this.drawVoiceRays(
        time,
        voice,
        this.voiceEnergy,
        audio.neonIntensity
      );

      this.drawVoicePulse(
        time,
        this.voiceEnergy
      );
    }

    this.animateLogo(
      time,
      music,
      this.voiceEnergy
    );
  },

  detectBeat(music) {
    const bass =
      Number(music.bass || 0);

    const difference =
      bass -
      this.previousBass;

    if (
      music.active &&
      bass > 0.18 &&
      difference > 0.035
    ) {
      this.beatEnergy = 1;
    }

    this.previousBass = bass;

    this.beatEnergy *= 0.86;
  },

  getCenter() {
    return {
      x:
        this.logoBox.x +
        this.logoBox.width / 2,

      y:
        this.logoBox.y +
        this.logoBox.height / 2
    };
  },

  getRainbowColor(
    index,
    time,
    opacity = 1
  ) {
    const hue =
      (
        time * 0.045 +
        index * 6.8
      ) % 360;

    return `
      hsla(
        ${hue},
        100%,
        64%,
        ${opacity}
      )
    `;
  },

  getVoiceColor(
    index,
    opacity = 1
  ) {
    const colors = [
      `rgba(255, 25, 65, ${opacity})`,
      `rgba(145, 0, 38, ${opacity})`,
      `rgba(196, 65, 35, ${opacity})`,
      `rgba(95, 14, 25, ${opacity})`
    ];

    return colors[
      index %
      colors.length
    ];
  },

  drawBaseHalo(
    time,
    musicLevel,
    voiceEnergy
  ) {
    const context =
      this.context;

    const center =
      this.getCenter();

    const energy =
      Math.max(
        musicLevel,
        voiceEnergy
      );

    const radius =
      260 +
      energy * 110 +
      this.beatEnergy * 35;

    const gradient =
      context.createRadialGradient(
        center.x,
        center.y,
        20,
        center.x,
        center.y,
        radius
      );

    const hue =
      (
        time * 0.025
      ) % 360;

    gradient.addColorStop(
      0,
      `hsla(
        ${hue},
        100%,
        62%,
        ${0.05 + musicLevel * 0.16}
      )`
    );

    gradient.addColorStop(
      0.35,
      `rgba(
        255,
        205,
        70,
        ${0.03 + musicLevel * 0.08}
      )`
    );

    if (voiceEnergy > 0.01) {
      gradient.addColorStop(
        0.55,
        `rgba(
          150,
          0,
          35,
          ${voiceEnergy * 0.18}
        )`
      );
    }

    gradient.addColorStop(
      1,
      "rgba(0, 0, 0, 0)"
    );

    context.save();

    context.fillStyle =
      gradient;

    context.beginPath();

    context.arc(
      center.x,
      center.y,
      radius,
      0,
      Math.PI * 2
    );

    context.fill();

    context.restore();
  },

  getLogoAnchors() {
    const box =
      this.logoBox;

    const points = [];

    /*
      Aripa stângă
    */

    for (
      let index = 0;
      index < 42;
      index += 1
    ) {
      const progress =
        index / 41;

      points.push({
        x:
          box.x +
          30 +
          progress * 315,

        y:
          box.y +
          145 -
          Math.sin(
            progress *
            Math.PI
          ) * 110,

        directionX:
          -1 +
          progress * 0.42,

        directionY:
          -0.55 +
          progress * 0.72
      });
    }

    /*
      Aripa dreaptă
    */

    for (
      let index = 0;
      index < 42;
      index += 1
    ) {
      const progress =
        index / 41;

      points.push({
        x:
          box.x +
          box.width -
          30 -
          progress * 315,

        y:
          box.y +
          145 -
          Math.sin(
            progress *
            Math.PI
          ) * 110,

        directionX:
          1 -
          progress * 0.42,

        directionY:
          -0.55 +
          progress * 0.72
      });
    }

    /*
      Literele SOUL
    */

    for (
      let index = 0;
      index < 44;
      index += 1
    ) {
      const progress =
        index / 43;

      points.push({
        x:
          box.x +
          180 +
          progress * 430,

        y:
          box.y +
          245 +
          Math.sin(
            progress *
            Math.PI
          ) * 18,

        directionX:
          (
            progress -
            0.5
          ) * 0.65,

        directionY:
          -0.85
      });
    }

    /*
      Literele MUSIC
    */

    for (
      let index = 0;
      index < 46;
      index += 1
    ) {
      const progress =
        index / 45;

      points.push({
        x:
          box.x +
          160 +
          progress * 470,

        y:
          box.y +
          395 +
          Math.sin(
            progress *
            Math.PI
          ) * 30,

        directionX:
          (
            progress -
            0.5
          ) * 0.62,

        directionY:
          1
      });
    }

    /*
      Discul central
    */

    const center =
      this.getCenter();

    for (
      let index = 0;
      index < 48;
      index += 1
    ) {
      const angle =
        index /
        48 *
        Math.PI *
        2;

      points.push({
        x:
          center.x +
          Math.cos(angle) *
          112,

        y:
          center.y -
          35 +
          Math.sin(angle) *
          112,

        directionX:
          Math.cos(angle),

        directionY:
          Math.sin(angle)
      });
    }

    return points;
  },

  drawMusicVisualizer(
    time,
    music,
    neonIntensity
  ) {
    const context =
      this.context;

    const anchors =
      this.getLogoAnchors();

    const data =
      music.frequencyData;

    if (!data) {
      return;
    }

    anchors.forEach(
      (anchor, index) => {
        const frequencyIndex =
          Math.floor(
            index /
            anchors.length *
            data.length *
            0.68
          );

        const frequency =
          data[
            frequencyIndex
          ] / 255;

        const shapedFrequency =
          Math.pow(
            frequency,
            1.2
          );

        const rayLength =
          8 +
          shapedFrequency * 135 +
          music.bass * 70 +
          this.beatEnergy * 85;

        const startX =
          anchor.x +
          anchor.directionX * 5;

        const startY =
          anchor.y +
          anchor.directionY * 5;

        const endX =
          startX +
          anchor.directionX *
          rayLength;

        const endY =
          startY +
          anchor.directionY *
          rayLength;

        const color =
          this.getRainbowColor(
            index,
            time,
            0.18 +
            music.level * 0.66
          );

        context.save();

        context.beginPath();

        context.moveTo(
          startX,
          startY
        );

        context.lineTo(
          endX,
          endY
        );

        context.lineWidth =
          1.5 +
          shapedFrequency * 4.8 +
          this.beatEnergy * 2;

        context.strokeStyle =
          color;

        context.shadowColor =
          color;

        context.shadowBlur =
          (
            10 +
            shapedFrequency * 34 +
            this.beatEnergy * 24
          ) *
          neonIntensity;

        context.stroke();

        context.restore();
      }
    );
  },

  drawVoiceRays(
    time,
    voice,
    voiceEnergy,
    neonIntensity
  ) {
    const context =
      this.context;

    const anchors =
      this.getLogoAnchors();

    anchors.forEach(
      (anchor, index) => {
        const movement =
          0.5 +
          0.5 *
          Math.sin(
            time * 0.014 +
            index * 0.38
          );

        const length =
          10 +
          voiceEnergy *
          (
            45 +
            movement * 55
          );

        const startX =
          anchor.x +
          anchor.directionX * 7;

        const startY =
          anchor.y +
          anchor.directionY * 7;

        const endX =
          startX +
          anchor.directionX *
          length;

        const endY =
          startY +
          anchor.directionY *
          length;

        const color =
          this.getVoiceColor(
            index,
            0.20 +
            voiceEnergy * 0.76
          );

        context.save();

        context.beginPath();

        context.moveTo(
          startX,
          startY
        );

        context.lineTo(
          endX,
          endY
        );

        context.lineWidth =
          1.8 +
          voiceEnergy * 4.2;

        context.strokeStyle =
          color;

        context.shadowColor =
          color;

        context.shadowBlur =
          (
            12 +
            voiceEnergy * 36
          ) *
          neonIntensity;

        context.stroke();

        context.restore();
      }
    );
  },

  drawMusicBeams(
    time,
    music,
    neonIntensity
  ) {
    const context =
      this.context;

    const center =
      this.getCenter();

    const bass =
      Number(
        music.bass || 0
      );

    if (bass < 0.055) {
      return;
    }

    const beamCount =
      14 +
      Math.round(
        bass * 25
      );

    for (
      let index = 0;
      index < beamCount;
      index += 1
    ) {
      const angle =
        -Math.PI * 0.92 +
        (
          index /
          Math.max(
            1,
            beamCount - 1
          )
        ) *
        Math.PI *
        1.84;

      const length =
        110 +
        bass * 370 +
        this.beatEnergy * 190;

      const startRadius =
        190;

      const startX =
        center.x +
        Math.cos(angle) *
        startRadius;

      const startY =
        center.y +
        Math.sin(angle) *
        startRadius *
        0.55;

      const endX =
        startX +
        Math.cos(angle) *
        length;

      const endY =
        startY +
        Math.sin(angle) *
        length *
        0.70;

      const color =
        this.getRainbowColor(
          index * 5,
          time,
          0.04 +
          bass * 0.28
        );

      context.save();

      context.beginPath();

      context.moveTo(
        startX,
        startY
      );

      context.lineTo(
        endX,
        endY
      );

      context.lineWidth =
        1 +
        bass * 3.2;

      context.strokeStyle =
        color;

      context.shadowColor =
        color;

      context.shadowBlur =
        (
          10 +
          bass * 26
        ) *
        neonIntensity;

      context.stroke();

      context.restore();
    }
  },

  drawVoicePulse(
    time,
    voiceEnergy
  ) {
    const context =
      this.context;

    const center =
      this.getCenter();

    const pulse =
      0.5 +
      0.5 *
      Math.sin(
        time * 0.012
      );

    const radiusX =
      320 +
      voiceEnergy * 55 +
      pulse * 12;

    const radiusY =
      175 +
      voiceEnergy * 36 +
      pulse * 8;

    for (
      let layer = 0;
      layer < 3;
      layer += 1
    ) {
      const color =
        this.getVoiceColor(
          layer,
          0.12 +
          voiceEnergy * 0.35
        );

      context.save();

      context.beginPath();

      context.ellipse(
        center.x,
        center.y,
        radiusX +
        layer * 15,
        radiusY +
        layer * 10,
        0,
        0,
        Math.PI * 2
      );

      context.lineWidth =
        2 + layer;

      context.strokeStyle =
        color;

      context.shadowColor =
        color;

      context.shadowBlur =
        16 +
        voiceEnergy * 38;

      context.stroke();

      context.restore();
    }
  },

  drawMusicParticles(
    time,
    music
  ) {
    const context =
      this.context;

    const center =
      this.getCenter();

    const highs =
      Number(
        music.highs || 0
      );

    const bass =
      Number(
        music.bass || 0
      );

    this.particles.forEach(
      (particle, index) => {
        particle.angle +=
          particle.speed *
          (
            1 +
            highs * 7
          ) *
          16;

        const pulse =
          Math.sin(
            time * 0.002 +
            particle.phase
          );

        const distance =
          particle.distance +
          pulse * 22 +
          highs * 100 +
          this.beatEnergy * 24;

        const x =
          center.x +
          Math.cos(
            particle.angle
          ) *
          distance;

        const y =
          center.y +
          Math.sin(
            particle.angle
          ) *
          distance *
          0.58;

        const opacity =
          0.05 +
          highs * 0.72 +
          this.beatEnergy * 0.20;

        const color =
          this.getRainbowColor(
            index * 3,
            time,
            opacity
          );

        context.save();

        context.beginPath();

        context.arc(
          x,
          y,
          particle.size +
          highs * 3.5,
          0,
          Math.PI * 2
        );

        context.fillStyle =
          color;

        context.shadowColor =
          color;

        context.shadowBlur =
          8 +
          highs * 24;

        context.fill();

        context.restore();
      }
    );
  },

  animateLogo(
    time,
    music,
    voiceEnergy
  ) {
    const logo =
      document.getElementById(
        "soulLogo"
      );

    const halo =
      document.getElementById(
        "logoHalo"
      );

    if (!logo || !halo) {
      return;
    }

    const musicLevel =
      Number(
        music.level || 0
      );

    const bass =
      Number(
        music.bass || 0
      );

    const scale =
      1 +
      musicLevel * 0.025 +
      bass * 0.025 +
      voiceEnergy * 0.020 +
      this.beatEnergy * 0.025;

    logo.style.transform =
      `scale(${scale})`;

    const hue =
      (
        time *
        0.035
      ) %
      360;

    logo.style.filter = `
      drop-shadow(
        0 16px 30px
        rgba(0, 0, 0, 0.95)
      )
      drop-shadow(
        0 0 ${14 + musicLevel * 38}px
        hsla(
          ${hue},
          100%,
          62%,
          ${0.25 + musicLevel * 0.62}
        )
      )
      drop-shadow(
        0 0 ${voiceEnergy * 42}px
        rgba(
          255,
          25,
          65,
          ${voiceEnergy * 0.92}
        )
      )
    `;

    halo.style.background = `
      radial-gradient(
        ellipse at center,
        hsla(
          ${hue},
          100%,
          62%,
          ${0.06 + musicLevel * 0.18}
        ),
        rgba(
          255,
          32,
          70,
          ${voiceEnergy * 0.20}
        ) 45%,
        transparent 72%
      )
    `;

    halo.style.transform = `
      translate(-50%, -50%)
      scale(
        ${
          1 +
          musicLevel * 0.08 +
          voiceEnergy * 0.10
        }
      )
    `;
  }
};

window.SoulVisualizer =
  SoulVisualizer;

window.addEventListener(
  "DOMContentLoaded",
  () =>
    SoulVisualizer.init()
);
