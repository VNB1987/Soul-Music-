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
  beatFlash: 0,

  init() {
    this.canvas =
      document.getElementById("visualizerCanvas");

    if (!this.canvas) {
      console.error(
        "Visualizer canvas nu a fost găsit."
      );

      return;
    }

    this.context =
      this.canvas.getContext("2d");

    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.createParticles();
    this.animate();
  },

  createParticles() {
    this.particles = [];

    for (let index = 0; index < 85; index += 1) {
      this.particles.push({
        angle: Math.random() * Math.PI * 2,
        distance: 250 + Math.random() * 150,
        size: 1 + Math.random() * 3,
        speed: 0.0003 + Math.random() * 0.001,
        phase: Math.random() * Math.PI * 2
      });
    }
  },

  animate(time = 0) {
    window.requestAnimationFrame(
      nextTime => this.animate(nextTime)
    );

    if (!window.SoulAudio) {
      return;
    }

    SoulAudio.update();

    const audio = SoulAudio.getState();

    this.context.clearRect(
      0,
      0,
      this.width,
      this.height
    );

    const music = audio.music;
    const voice = audio.voice;

    const musicLevel = music.level;
    const voiceLevel = voice.level;

    const voiceActive =
      voice.active && voiceLevel > 0.025;

    this.detectBeat(music);

    this.drawAmbientHalo(
      time,
      musicLevel,
      voiceLevel,
      voiceActive
    );

    this.drawLogoAura(
      time,
      music,
      voice,
      voiceActive,
      audio.neonIntensity
    );

    this.drawWingRays(
      time,
      music,
      voice,
      voiceActive,
      audio.neonIntensity
    );

    this.drawDiscEnergy(
      time,
      music,
      voice,
      voiceActive
    );

    this.drawBassBeams(
      time,
      music,
      voice,
      voiceActive
    );

    this.drawParticles(
      time,
      music,
      voice,
      voiceActive
    );

    this.animateLogo(
      music,
      voice,
      voiceActive
    );
  },

  detectBeat(music) {
    const bassDifference =
      music.bass - this.previousBass;

    if (
      music.active &&
      music.bass > 0.22 &&
      bassDifference > 0.055
    ) {
      this.beatFlash = 1;
    }

    this.previousBass = music.bass;
    this.beatFlash *= 0.86;
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

  getColor(
    index,
    time,
    voiceActive,
    opacity = 1
  ) {
    if (voiceActive) {
      const voiceColors = [
        `rgba(255, 28, 66, ${opacity})`,
        `rgba(143, 0, 35, ${opacity})`,
        `rgba(196, 72, 35, ${opacity})`,
        `rgba(93, 10, 24, ${opacity})`
      ];

      return voiceColors[
        index % voiceColors.length
      ];
    }

    const hue =
      (
        time * 0.045 +
        index * 7
      ) % 360;

    return `hsla(
      ${hue},
      100%,
      64%,
      ${opacity}
    )`;
  },

  drawAmbientHalo(
    time,
    musicLevel,
    voiceLevel,
    voiceActive
  ) {
    const context = this.context;
    const center = this.getCenter();

    const energy = voiceActive
      ? voiceLevel
      : musicLevel;

    const radius =
      260 +
      energy * 95 +
      this.beatFlash * 30;

    const gradient =
      context.createRadialGradient(
        center.x,
        center.y,
        30,
        center.x,
        center.y,
        radius
      );

    if (voiceActive) {
      gradient.addColorStop(
        0,
        `rgba(255, 35, 70, ${
          0.14 + voiceLevel * 0.22
        })`
      );

      gradient.addColorStop(
        0.45,
        `rgba(115, 0, 28, ${
          0.08 + voiceLevel * 0.16
        })`
      );
    } else {
      gradient.addColorStop(
        0,
        `hsla(
          ${(time * 0.025) % 360},
          100%,
          62%,
          ${0.08 + musicLevel * 0.18}
        )`
      );

      gradient.addColorStop(
        0.45,
        `rgba(255, 206, 75, ${
          0.04 + musicLevel * 0.08
        })`
      );
    }

    gradient.addColorStop(
      1,
      "rgba(0, 0, 0, 0)"
    );

    context.save();

    context.fillStyle = gradient;

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

  drawLogoAura(
    time,
    music,
    voice,
    voiceActive,
    neonIntensity
  ) {
    const context = this.context;
    const center = this.getCenter();

    const level = voiceActive
      ? voice.level
      : music.level;

    const horizontalRadius =
      325 +
      level * 40 +
      this.beatFlash * 15;

    const verticalRadius =
      175 +
      level * 28 +
      this.beatFlash * 10;

    for (let layer = 0; layer < 3; layer += 1) {
      const color = this.getColor(
        layer * 18,
        time,
        voiceActive,
        0.16 + level * 0.28
      );

      context.save();

      context.beginPath();

      context.ellipse(
        center.x,
        center.y,
        horizontalRadius + layer * 13,
        verticalRadius + layer * 9,
        0,
        0,
        Math.PI * 2
      );

      context.lineWidth =
        2 + layer * 1.5;

      context.strokeStyle = color;
      context.shadowColor = color;

      context.shadowBlur =
        (
          14 +
          level * 38 +
          layer * 8
        ) * neonIntensity;

      context.stroke();
      context.restore();
    }
  },

  getLogoAnchors() {
    const box = this.logoBox;

    const points = [];

    /*
      Aripa stângă
    */

    for (let index = 0; index < 30; index += 1) {
      const progress = index / 29;

      points.push({
        x:
          box.x +
          40 +
          progress * 300,

        y:
          box.y +
          135 -
          Math.sin(progress * Math.PI) * 100,

        directionX:
          -0.95 +
          progress * 0.35,

        directionY:
          -0.50 +
          progress * 0.62
      });
    }

    /*
      Aripa dreaptă
    */

    for (let index = 0; index < 30; index += 1) {
      const progress = index / 29;

      points.push({
        x:
          box.x +
          box.width -
          40 -
          progress * 300,

        y:
          box.y +
          135 -
          Math.sin(progress * Math.PI) * 100,

        directionX:
          0.95 -
          progress * 0.35,

        directionY:
          -0.50 +
          progress * 0.62
      });
    }

    /*
      Partea inferioară MUSIC
    */

    for (let index = 0; index < 38; index += 1) {
      const progress = index / 37;

      points.push({
        x:
          box.x +
          170 +
          progress * 450,

        y:
          box.y +
          390 +
          Math.sin(progress * Math.PI) * 35,

        directionX:
          (progress - 0.5) * 0.55,

        directionY:
          0.95
      });
    }

    /*
      Discul central
    */

    const center = this.getCenter();

    for (let index = 0; index < 34; index += 1) {
      const angle =
        index / 34 *
        Math.PI *
        2;

      points.push({
        x:
          center.x +
          Math.cos(angle) * 105,

        y:
          center.y -
          35 +
          Math.sin(angle) * 105,

        directionX:
          Math.cos(angle),

        directionY:
          Math.sin(angle)
      });
    }

    return points;
  },

  drawWingRays(
    time,
    music,
    voice,
    voiceActive,
    neonIntensity
  ) {
    const context = this.context;
    const anchors = this.getLogoAnchors();

    const data =
      music.frequencyData;

    const level = voiceActive
      ? voice.level
      : music.level;

    if (
      level < 0.018 &&
      this.beatFlash < 0.02
    ) {
      return;
    }

    anchors.forEach((anchor, index) => {
      const frequencyIndex =
        data
          ? Math.floor(
              index /
              anchors.length *
              data.length *
              0.68
            )
          : 0;

      const frequency =
        data
          ? data[frequencyIndex] / 255
          : 0;

      const audioPower = voiceActive
        ? voice.level *
          (
            0.60 +
            0.40 *
            Math.sin(
              time * 0.012 +
              index * 0.42
            )
          )
        : frequency;

      const rayLength =
        10 +
        audioPower * 125 +
        music.bass * 65 +
        this.beatFlash * 80;

      const startX =
        anchor.x +
        anchor.directionX * 4;

      const startY =
        anchor.y +
        anchor.directionY * 4;

      const endX =
        startX +
        anchor.directionX *
        rayLength;

      const endY =
        startY +
        anchor.directionY *
        rayLength;

      const color = this.getColor(
        index,
        time,
        voiceActive,
        0.26 + level * 0.66
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
        1.4 +
        audioPower * 4.2 +
        this.beatFlash * 2;

      context.strokeStyle = color;
      context.shadowColor = color;

      context.shadowBlur =
        (
          10 +
          audioPower * 34 +
          this.beatFlash * 20
        ) * neonIntensity;

      context.stroke();
      context.restore();
    });
  },

  drawDiscEnergy(
    time,
    music,
    voice,
    voiceActive
  ) {
    const context = this.context;
    const center = this.getCenter();

    const centerY = center.y - 35;

    const level = voiceActive
      ? voice.level
      : music.level;

    const radius =
      112 +
      music.bass * 22 +
      voice.level * 18 +
      this.beatFlash * 18;

    for (let layer = 0; layer < 4; layer += 1) {
      const color = this.getColor(
        layer * 30,
        time,
        voiceActive,
        0.12 + level * 0.34
      );

      context.save();

      context.beginPath();

      context.arc(
        center.x,
        centerY,
        radius + layer * 11,
        0,
        Math.PI * 2
      );

      context.lineWidth =
        1.5 + layer * 0.7;

      context.strokeStyle = color;
      context.shadowColor = color;

      context.shadowBlur =
        12 +
        level * 36 +
        layer * 7;

      context.stroke();
      context.restore();
    }
  },

  drawBassBeams(
    time,
    music,
    voice,
    voiceActive
  ) {
    const context = this.context;
    const center = this.getCenter();

    const power = voiceActive
      ? voice.bass
      : music.bass;

    if (power < 0.07) {
      return;
    }

    const beamCount =
      12 +
      Math.round(power * 20);

    for (
      let index = 0;
      index < beamCount;
      index += 1
    ) {
      const angle =
        -Math.PI * 0.92 +
        (
          index /
          Math.max(1, beamCount - 1)
        ) *
        Math.PI *
        1.84;

      const length =
        130 +
        power * 310 +
        this.beatFlash * 170;

      const startRadius = 175;

      const startX =
        center.x +
        Math.cos(angle) *
        startRadius;

      const startY =
        center.y +
        Math.sin(angle) *
        startRadius *
        0.54;

      const endX =
        startX +
        Math.cos(angle) *
        length;

      const endY =
        startY +
        Math.sin(angle) *
        length *
        0.68;

      const color = this.getColor(
        index * 4,
        time,
        voiceActive,
        0.05 + power * 0.26
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
        power * 2.8;

      context.strokeStyle = color;
      context.shadowColor = color;

      context.shadowBlur =
        10 + power * 22;

      context.stroke();
      context.restore();
    }
  },

  drawParticles(
    time,
    music,
    voice,
    voiceActive
  ) {
    const context = this.context;
    const center = this.getCenter();

    const level = voiceActive
      ? voice.highs
      : music.highs;

    this.particles.forEach(
      (particle, index) => {
        particle.angle +=
          particle.speed *
          (
            1 +
            level * 5
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
          level * 80;

        const x =
          center.x +
          Math.cos(particle.angle) *
          distance;

        const y =
          center.y +
          Math.sin(particle.angle) *
          distance *
          0.58;

        const opacity =
          0.08 +
          level * 0.70 +
          this.beatFlash * 0.22;

        const color = this.getColor(
          index * 3,
          time,
          voiceActive,
          opacity
        );

        context.save();

        context.beginPath();

        context.arc(
          x,
          y,
          particle.size +
          level * 3,
          0,
          Math.PI * 2
        );

        context.fillStyle = color;
        context.shadowColor = color;

        context.shadowBlur =
          8 + level * 22;

        context.fill();
        context.restore();
      }
    );
  },

  animateLogo(
    music,
    voice,
    voiceActive
  ) {
    const logo =
      document.getElementById("soulLogo");

    const halo =
      document.getElementById("logoHalo");

    if (!logo || !halo) {
      return;
    }

    const level = voiceActive
      ? voice.level
      : music.level;

    const scale =
      1 +
      level * 0.035 +
      music.bass * 0.025 +
      this.beatFlash * 0.022;

    logo.style.transform =
      `scale(${scale})`;

    if (voiceActive) {
      logo.style.filter = `
        drop-shadow(
          0 16px 30px
          rgba(0, 0, 0, 0.95)
        )
        drop-shadow(
          0 0 ${18 + voice.level * 42}px
          rgba(255, 25, 65, 0.92)
        )
      `;

      halo.style.background = `
        radial-gradient(
          ellipse at center,
          rgba(
            255,
            30,
            70,
            ${0.14 + voice.level * 0.26}
          ),
          rgba(
            105,
            0,
            26,
            ${0.08 + voice.level * 0.18}
          ) 45%,
          transparent 72%
        )
      `;
    } else {
      const hue =
        (
          performance.now() *
          0.035
        ) % 360;

      logo.style.filter = `
        drop-shadow(
          0 16px 30px
          rgba(0, 0, 0, 0.95)
        )
        drop-shadow(
          0 0 ${14 + music.level * 40}px
          hsla(
            ${hue},
            100%,
            62%,
            ${0.30 + music.level * 0.62}
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
            ${0.08 + music.level * 0.20}
          ),
          rgba(
            255,
            210,
            80,
            ${0.05 + music.bass * 0.12}
          ) 45%,
          transparent 72%
        )
      `;
    }

    halo.style.transform = `
      translate(-50%, -50%)
      scale(${1 + level * 0.12})
    `;
  }
};

window.SoulVisualizer = SoulVisualizer;

window.addEventListener(
  "DOMContentLoaded",
  () => SoulVisualizer.init()
);
