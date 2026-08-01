"use strict";

const SoulEffects = {
  canvas: null,
  context: null,

  width: 1920,
  height: 1080,

  voiceEnergy: 0,
  musicEnergy: 0,
  rotation: 0,

  elements: {},

  init() {
    this.canvas =
      document.getElementById("effectsCanvas");

    if (!this.canvas) {
      console.error(
        "effectsCanvas nu a fost găsit."
      );

      return;
    }

    this.context =
      this.canvas.getContext("2d");

    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.cacheElements();

    requestAnimationFrame(
      time => this.animate(time)
    );
  },

  cacheElements() {
    this.elements.leftFrame =
      document.getElementById("leftFrame");

    this.elements.leftNeon =
      this.elements.leftFrame
        ?.querySelector(".frame-neon");

    this.elements.cameraFrame =
      document.getElementById("cameraFrame");

    this.elements.cameraNeon =
      this.elements.cameraFrame
        ?.querySelector(".frame-neon");

    this.elements.tiktok =
      document.getElementById("tiktokButton");

    this.elements.tiktokNeon =
      this.elements.tiktok
        ?.querySelector(".button-neon");

    this.elements.live =
      document.getElementById("liveButton");

    this.elements.liveNeon =
      this.elements.live
        ?.querySelector(".button-neon");
  },

  animate(time = 0) {
    requestAnimationFrame(
      nextTime => this.animate(nextTime)
    );

    if (!window.SoulAudio) {
      return;
    }

    const audio =
      SoulAudio.getState();

    const music =
      audio.music;

    const voice =
      audio.voice;

    const musicTarget =
      music.active
        ? Math.min(
            1,
            music.level * 1.15 +
            music.bass * 0.55
          )
        : 0;

    const voiceThreshold = 0.10;

    const voiceTarget =
      voice.active &&
      voice.level > voiceThreshold
        ? Math.min(
            1,
            (
              voice.level -
              voiceThreshold
            ) * 5.5
          )
        : 0;

    this.musicEnergy +=
      (
        musicTarget -
        this.musicEnergy
      ) * 0.18;

    this.voiceEnergy +=
      (
        voiceTarget -
        this.voiceEnergy
      ) *
      (
        voiceTarget >
        this.voiceEnergy
          ? 0.32
          : 0.11
      );

    this.rotation +=
      0.35 +
      music.highs * 2.8 +
      music.bass * 1.2;

    this.context.clearRect(
      0,
      0,
      this.width,
      this.height
    );

    this.drawLeftFrame(
      time,
      music,
      this.musicEnergy,
      this.voiceEnergy,
      audio.neonIntensity
    );

    this.drawCameraFrame(
      time,
      music,
      this.musicEnergy,
      this.voiceEnergy,
      audio.neonIntensity
    );

    this.drawTikTokRing(
      time,
      music,
      this.musicEnergy,
      this.voiceEnergy,
      audio.neonIntensity
    );

    this.drawLiveRing(
      time,
      this.voiceEnergy,
      audio.neonIntensity
    );

    this.drawEnergyConnections(
      time,
      music,
      this.musicEnergy,
      this.voiceEnergy
    );

    this.animateDOMElements(
      time,
      music,
      this.musicEnergy,
      this.voiceEnergy
    );
  },

  getRainbowColor(
    index,
    time,
    opacity = 1
  ) {
    const hue =
      (
        time * 0.045 +
        index * 32
      ) % 360;

    return `hsla(
      ${hue},
      100%,
      64%,
      ${opacity}
    )`;
  },

  getVoiceColor(
    index,
    opacity = 1
  ) {
    const colors = [
      `rgba(255, 28, 67, ${opacity})`,
      `rgba(143, 0, 36, ${opacity})`,
      `rgba(190, 57, 35, ${opacity})`,
      `rgba(96, 8, 25, ${opacity})`
    ];

    return colors[
      index % colors.length
    ];
  },

  roundedRectangle(
    context,
    x,
    y,
    width,
    height,
    radius
  ) {
    context.beginPath();

    context.moveTo(
      x + radius,
      y
    );

    context.arcTo(
      x + width,
      y,
      x + width,
      y + height,
      radius
    );

    context.arcTo(
      x + width,
      y + height,
      x,
      y + height,
      radius
    );

    context.arcTo(
      x,
      y + height,
      x,
      y,
      radius
    );

    context.arcTo(
      x,
      y,
      x + width,
      y,
      radius
    );

    context.closePath();
  },

  drawReactiveFrame({
    time,
    x,
    y,
    width,
    height,
    radius,
    music,
    musicEnergy,
    voiceEnergy,
    gold = false,
    neonIntensity = 1
  }) {
    const context = this.context;

    const activeEnergy =
      Math.max(
        musicEnergy,
        voiceEnergy
      );

    const idleOpacity = 0.24;

    for (
      let layer = 0;
      layer < 4;
      layer += 1
    ) {
      const expansion =
        layer * 3;

      this.roundedRectangle(
        context,
        x - expansion,
        y - expansion,
        width + expansion * 2,
        height + expansion * 2,
        radius + expansion
      );

      let color;

      if (voiceEnergy > 0.02) {
        color =
          this.getVoiceColor(
            layer,
            idleOpacity +
            voiceEnergy * 0.68
          );
      } else if (gold) {
        const goldColors = [
          `rgba(
            255,
            218,
            105,
            ${
              idleOpacity +
              musicEnergy * 0.56
            }
          )`,

          `rgba(
            255,
            173,
            40,
            ${
              idleOpacity +
              musicEnergy * 0.48
            }
          )`,

          `rgba(
            255,
            245,
            190,
            ${
              idleOpacity +
              musicEnergy * 0.42
            }
          )`,

          `rgba(
            210,
            123,
            20,
            ${
              idleOpacity +
              musicEnergy * 0.40
            }
          )`
        ];

        color =
          goldColors[
            layer %
            goldColors.length
          ];
      } else {
        color =
          this.getRainbowColor(
            layer,
            time,
            idleOpacity +
            musicEnergy * 0.60
          );
      }

      context.save();

      context.lineWidth =
        3 +
        layer * 2 +
        activeEnergy * 2;

      context.strokeStyle = color;
      context.shadowColor = color;

      context.shadowBlur =
        (
          14 +
          activeEnergy * 42 +
          layer * 9
        ) *
        neonIntensity;

      context.stroke();

      context.restore();
    }

    this.drawMovingFrameHighlight({
      time,
      x,
      y,
      width,
      height,
      radius,
      music,
      voiceEnergy,
      gold
    });
  },

  drawMovingFrameHighlight({
    time,
    x,
    y,
    width,
    height,
    radius,
    music,
    voiceEnergy,
    gold
  }) {
    const context = this.context;

    const perimeter =
      width * 2 +
      height * 2;

    const speed =
      0.08 +
      music.highs * 0.28 +
      music.bass * 0.12;

    const position =
      (
        time *
        speed
      ) %
      perimeter;

    let startX;
    let startY;
    let endX;
    let endY;

    const highlightLength =
      Math.max(
        90,
        width * 0.18
      );

    if (position < width) {
      startX =
        x + position;

      startY = y;

      endX =
        Math.min(
          x + width,
          startX +
          highlightLength
        );

      endY = y;
    } else if (
      position <
      width + height
    ) {
      startX =
        x + width;

      startY =
        y +
        position -
        width;

      endX =
        x + width;

      endY =
        Math.min(
          y + height,
          startY +
          highlightLength
        );
    } else if (
      position <
      width * 2 +
      height
    ) {
      startX =
        x +
        width -
        (
          position -
          width -
          height
        );

      startY =
        y + height;

      endX =
        Math.max(
          x,
          startX -
          highlightLength
        );

      endY =
        y + height;
    } else {
      startX = x;

      startY =
        y +
        height -
        (
          position -
          width * 2 -
          height
        );

      endX = x;

      endY =
        Math.max(
          y,
          startY -
          highlightLength
        );
    }

    const color =
      voiceEnergy > 0.02
        ? "#ff244d"
        : gold
          ? "#fff2ad"
          : "#ffffff";

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
      7 +
      music.highs * 5;

    context.lineCap =
      "round";

    context.strokeStyle =
      color;

    context.shadowColor =
      color;

    context.shadowBlur =
      24 +
      music.highs * 24;

    context.stroke();

    context.restore();
  },

  drawLeftFrame(
    time,
    music,
    musicEnergy,
    voiceEnergy,
    neonIntensity
  ) {
    this.drawReactiveFrame({
      time,
      x: 24,
      y: 18,
      width: 520,
      height: 1044,
      radius: 30,
      music,
      musicEnergy,
      voiceEnergy,
      gold: false,
      neonIntensity
    });
  },

  drawCameraFrame(
    time,
    music,
    musicEnergy,
    voiceEnergy,
    neonIntensity
  ) {
    this.drawReactiveFrame({
      time,
      x: 1390,
      y: 505,
      width: 490,
      height: 370,
      radius: 30,
      music,
      musicEnergy,
      voiceEnergy,
      gold: true,
      neonIntensity
    });
  },

  drawTikTokRing(
    time,
    music,
    musicEnergy,
    voiceEnergy,
    neonIntensity
  ) {
    const context =
      this.context;

    const centerX = 1665;
    const centerY = 190;
    const baseRadius = 118;

    const rayCount = 82;

    for (
      let index = 0;
      index < rayCount;
      index += 1
    ) {
      const angle =
        (
          index /
          rayCount
        ) *
        Math.PI *
        2 +
        this.rotation *
        0.01;

      const frequency =
        music.frequencyData
          ? music.frequencyData[
              Math.floor(
                index /
                rayCount *
                music.frequencyData.length *
                0.55
              )
            ] / 255
          : 0;

      const pulse =
        musicEnergy * 30 +
        music.bass * 24 +
        frequency * 28 +
        voiceEnergy * 24;

      const startRadius =
        baseRadius + 8;

      const endRadius =
        startRadius +
        10 +
        pulse;

      const startX =
        centerX +
        Math.cos(angle) *
        startRadius;

      const startY =
        centerY +
        Math.sin(angle) *
        startRadius;

      const endX =
        centerX +
        Math.cos(angle) *
        endRadius;

      const endY =
        centerY +
        Math.sin(angle) *
        endRadius;

      const color =
        voiceEnergy > 0.02
          ? this.getVoiceColor(
              index,
              0.30 +
              voiceEnergy * 0.70
            )
          : this.getRainbowColor(
              index,
              time,
              0.25 +
              musicEnergy * 0.70
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
        2 +
        musicEnergy * 3 +
        voiceEnergy * 3;

      context.strokeStyle =
        color;

      context.shadowColor =
        color;

      context.shadowBlur =
        (
          12 +
          musicEnergy * 28 +
          voiceEnergy * 28
        ) *
        neonIntensity;

      context.stroke();

      context.restore();
    }

    this.drawCircularGlow(
      centerX,
      centerY,
      baseRadius,
      time,
      musicEnergy,
      voiceEnergy,
      neonIntensity
    );
  },

  drawLiveRing(
    time,
    voiceEnergy,
    neonIntensity
  ) {
    const context =
      this.context;

    const centerX = 1667.5;
    const centerY = 397.5;

    const radius =
      83 +
      voiceEnergy * 17;

    const layers = 5;

    for (
      let layer = 0;
      layer < layers;
      layer += 1
    ) {
      const color =
        this.getVoiceColor(
          layer,
          0.20 +
          voiceEnergy * 0.75
        );

      context.save();

      context.beginPath();

      context.arc(
        centerX,
        centerY,
        radius +
        layer * 5,
        0,
        Math.PI * 2
      );

      context.lineWidth =
        3 +
        layer * 1.2 +
        voiceEnergy * 3;

      context.strokeStyle =
        color;

      context.shadowColor =
        color;

      context.shadowBlur =
        (
          15 +
          voiceEnergy * 42 +
          layer * 6
        ) *
        neonIntensity;

      context.stroke();

      context.restore();
    }
  },

  drawCircularGlow(
    centerX,
    centerY,
    radius,
    time,
    musicEnergy,
    voiceEnergy,
    neonIntensity
  ) {
    const context =
      this.context;

    for (
      let layer = 0;
      layer < 4;
      layer += 1
    ) {
      const color =
        voiceEnergy > 0.02
          ? this.getVoiceColor(
              layer,
              0.18 +
              voiceEnergy * 0.55
            )
          : this.getRainbowColor(
              layer * 10,
              time,
              0.16 +
              musicEnergy * 0.55
            );

      context.save();

      context.beginPath();

      context.arc(
        centerX,
        centerY,
        radius +
        layer * 5,
        0,
        Math.PI * 2
      );

      context.lineWidth =
        3 +
        layer * 1.5;

      context.strokeStyle =
        color;

      context.shadowColor =
        color;

      context.shadowBlur =
        (
          14 +
          musicEnergy * 32 +
          voiceEnergy * 32
        ) *
        neonIntensity;

      context.stroke();

      context.restore();
    }
  },

  drawEnergyConnections(
    time,
    music,
    musicEnergy,
    voiceEnergy
  ) {
    const context =
      this.context;

    const intensity =
      Math.max(
        musicEnergy,
        voiceEnergy
      );

    if (intensity < 0.10) {
      return;
    }

    const logoCenter = {
      x: 960,
      y: 370
    };

    const targets = [
      {
        x: 544,
        y: 180
      },
      {
        x: 1390,
        y: 600
      },
      {
        x: 1548,
        y: 190
      }
    ];

    targets.forEach(
      (target, index) => {
        const color =
          voiceEnergy > 0.02
            ? this.getVoiceColor(
                index,
                0.05 +
                voiceEnergy * 0.16
              )
            : this.getRainbowColor(
                index * 15,
                time,
                0.04 +
                musicEnergy * 0.13
              );

        context.save();

        context.beginPath();

        context.moveTo(
          logoCenter.x,
          logoCenter.y
        );

        const controlX =
          (
            logoCenter.x +
            target.x
          ) / 2;

        const controlY =
          (
            logoCenter.y +
            target.y
          ) / 2 -
          80;

        context.quadraticCurveTo(
          controlX,
          controlY,
          target.x,
          target.y
        );

        context.lineWidth =
          1 +
          intensity * 2;

        context.strokeStyle =
          color;

        context.shadowColor =
          color;

        context.shadowBlur =
          10 +
          intensity * 20;

        context.stroke();

        context.restore();
      }
    );
  },

  animateDOMElements(
    time,
    music,
    musicEnergy,
    voiceEnergy
  ) {
    const leftFrame =
      this.elements.leftFrame;

    const camera =
      this.elements.cameraFrame;

    const tiktok =
      this.elements.tiktok;

    const live =
      this.elements.live;

    const musicScale =
      1 +
      musicEnergy * 0.008;

    const voiceScale =
      1 +
      voiceEnergy * 0.025;

    if (leftFrame) {
      leftFrame.style.transform =
        `scale(${musicScale})`;
    }

    if (camera) {
      camera.style.transform =
        `scale(${
          1 +
          musicEnergy * 0.008 +
          voiceEnergy * 0.025
        })`;
    }

    if (tiktok) {
      tiktok.style.transform = `
        scale(
          ${
            1 +
            musicEnergy * 0.035 +
            voiceEnergy * 0.025
          }
        )
        rotate(
          ${
            Math.sin(
              time * 0.001
            ) *
            music.highs *
            1.5
          }deg
        )
      `;
    }

    if (live) {
      live.style.transform =
        `scale(${voiceScale})`;

      live.style.filter =
        voiceEnergy > 0.01
          ? `
            drop-shadow(
              0 0 ${
                12 +
                voiceEnergy * 38
              }px
              rgba(
                255,
                25,
                65,
                0.95
              )
            )
          `
          : "none";
    }

    this.updateCSSNeon(
      musicEnergy,
      voiceEnergy,
      time
    );
  },

  updateCSSNeon(
    musicEnergy,
    voiceEnergy,
    time
  ) {
    const hue =
      (
        time * 0.045
      ) % 360;

    if (this.elements.leftNeon) {
      this.elements.leftNeon.style.opacity =
        String(
          0.45 +
          musicEnergy * 0.55 +
          voiceEnergy * 0.35
        );

      this.elements.leftNeon.style.borderColor =
        voiceEnergy > 0.02
          ? `rgba(
              255,
              32,
              70,
              ${
                0.55 +
                voiceEnergy * 0.42
              }
            )`
          : `hsla(
              ${hue},
              100%,
              62%,
              ${
                0.45 +
                musicEnergy * 0.48
              }
            )`;
    }

    if (this.elements.cameraNeon) {
      this.elements.cameraNeon.style.opacity =
        String(
          0.55 +
          musicEnergy * 0.35 +
          voiceEnergy * 0.45
        );

      this.elements.cameraNeon.style.borderColor =
        voiceEnergy > 0.02
          ? `rgba(
              255,
              32,
              70,
              ${
                0.58 +
                voiceEnergy * 0.40
              }
            )`
          : `rgba(
              255,
              217,
              106,
              ${
                0.58 +
                musicEnergy * 0.34
              }
            )`;
    }

    if (this.elements.tiktokNeon) {
      this.elements.tiktokNeon.style.opacity =
        String(
          0.48 +
          musicEnergy * 0.52 +
          voiceEnergy * 0.40
        );

      this.elements.tiktokNeon.style.borderColor =
        voiceEnergy > 0.02
          ? "#ff2048"
          : `hsl(
              ${hue},
              100%,
              62%
            )`;
    }

    if (this.elements.liveNeon) {
      this.elements.liveNeon.style.opacity =
        String(
          0.42 +
          voiceEnergy * 0.58
        );
    }
  }
};

window.SoulEffects =
  SoulEffects;

window.addEventListener(
  "DOMContentLoaded",
  () =>
    SoulEffects.init()
);
