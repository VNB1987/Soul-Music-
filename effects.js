"use strict";

const SoulEffects = {
  canvas: null,
  context: null,

  width: 1920,
  height: 1080,

  musicEnergy: 0,
  voiceEnergy: 0,

  previousBass: 0,
  bassImpact: 0,

  borderPosition: 0,
  tiktokRotation: 0,

  sparks: [],
  bursts: [],
  trails: [],

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
    this.createAmbientSparks();

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

    this.elements.logo =
      document.getElementById("soulLogo");
  },

  createAmbientSparks() {
    this.sparks = [];

    for (
      let index = 0;
      index < 90;
      index += 1
    ) {
      this.sparks.push(
        this.createSpark(true)
      );
    }
  },

  createSpark(initial = false) {
    return {
      x:
        550 +
        Math.random() * 900,

      y:
        90 +
        Math.random() * 720,

      velocityX:
        -0.25 +
        Math.random() * 0.5,

      velocityY:
        -0.55 -
        Math.random() * 0.85,

      size:
        0.7 +
        Math.random() * 2.7,

      opacity:
        initial
          ? Math.random() * 0.45
          : 0,

      life:
        Math.random(),

      hue:
        Math.random() * 360,

      flicker:
        Math.random() *
        Math.PI *
        2
    };
  },

  animate(time = 0) {
    requestAnimationFrame(
      nextTime =>
        this.animate(nextTime)
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

    const performance =
      window.EngineV8
        ?.getPerformanceState?.() || {
          mode: "live",
          preset: {
            effectMultiplier: 1,
            particleMultiplier: 1,
            speedMultiplier: 1
          }
        };

    const qualityMultiplier =
      window.EngineV8
        ?.getQualityMultiplier?.() || 1;

    const preset =
      performance.preset;

    const musicTarget =
      music.active
        ? Math.min(
            1,
            music.level * 0.9 +
            music.bass * 0.65 +
            music.highs * 0.15
          )
        : 0;

    const voiceThreshold =
      0.105;

    const voiceDetected =
      voice.active &&
      voice.level >
        voiceThreshold;

    const voiceTarget =
      voiceDetected
        ? Math.min(
            1,
            (
              voice.level -
              voiceThreshold
            ) * 5.8
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
          ? 0.34
          : 0.10
      );

    this.detectBassImpact(
      music,
      preset
    );

    this.context.clearRect(
      0,
      0,
      this.width,
      this.height
    );

    this.borderPosition +=
      (
        0.9 +
        music.highs * 4 +
        music.bass * 1.5
      ) *
      preset.speedMultiplier;

    this.tiktokRotation +=
      (
        0.25 +
        music.highs * 2.8 +
        music.bass * 1.1
      ) *
      preset.speedMultiplier;

    this.drawLeftFrame(
      time,
      music,
      preset,
      audio.neonIntensity
    );

    this.drawCameraFrame(
      time,
      music,
      preset,
      audio.neonIntensity
    );

    this.drawTikTokEnergy(
      time,
      music,
      preset,
      audio.neonIntensity
    );

    this.drawLiveEnergy(
      time,
      preset,
      audio.neonIntensity
    );

    this.drawAmbientSparks(
      time,
      music,
      preset,
      qualityMultiplier
    );

    this.drawBassBursts(
      time,
      music,
      preset
    );

    this.drawEnergyTrails(
      time,
      music,
      preset
    );

    this.drawVoiceWave(
      time,
      preset
    );

    this.animateElements(
      time,
      music,
      preset
    );

    this.bassImpact *= 0.86;
  },

  detectBassImpact(
    music,
    preset
  ) {
    const bass =
      Number(music.bass || 0);

    const difference =
      bass -
      this.previousBass;

    const threshold =
      window.EngineV8?.mode ===
      "legendary"
        ? 0.022
        : 0.035;

    if (
      music.active &&
      bass > 0.16 &&
      difference > threshold
    ) {
      this.bassImpact = 1;

      this.createBassBurst(
        bass,
        preset
      );
    }

    this.previousBass =
      bass;
  },

  getRainbowColor(
    index,
    time,
    opacity = 1
  ) {
    const hue =
      (
        time * 0.05 +
        index * 28
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
      `rgba(
        255,
        28,
        67,
        ${opacity}
      )`,

      `rgba(
        145,
        0,
        38,
        ${opacity}
      )`,

      `rgba(
        204,
        72,
        35,
        ${opacity}
      )`,

      `rgba(
        84,
        7,
        22,
        ${opacity}
      )`
    ];

    return colors[
      index %
      colors.length
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
    preset,
    gold,
    neonIntensity
  }) {
    const context =
      this.context;

    const musicEnergy =
      this.musicEnergy;

    const voiceEnergy =
      this.voiceEnergy;

    const activeEnergy =
      Math.max(
        musicEnergy,
        voiceEnergy
      );

    const intensity =
      neonIntensity *
      preset.effectMultiplier;

    for (
      let layer = 0;
      layer < 5;
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

      if (voiceEnergy > 0.015) {
        color =
          this.getVoiceColor(
            layer,
            0.28 +
            voiceEnergy * 0.66
          );
      } else if (gold) {
        const goldColors = [
          `rgba(
            255,
            220,
            110,
            ${0.22 + musicEnergy * 0.60}
          )`,

          `rgba(
            255,
            168,
            32,
            ${0.18 + musicEnergy * 0.52}
          )`,

          `rgba(
            255,
            248,
            200,
            ${0.16 + musicEnergy * 0.46}
          )`,

          `rgba(
            194,
            106,
            15,
            ${0.15 + musicEnergy * 0.42}
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
            0.20 +
            musicEnergy * 0.64
          );
      }

      context.save();

      context.lineWidth =
        3 +
        layer * 1.7 +
        activeEnergy * 3;

      context.strokeStyle =
        color;

      context.shadowColor =
        color;

      context.shadowBlur =
        (
          12 +
          activeEnergy * 44 +
          layer * 9 +
          this.bassImpact * 16
        ) *
        intensity;

      context.stroke();

      context.restore();
    }

    this.drawFrameRunner({
      time,
      x,
      y,
      width,
      height,
      music,
      preset,
      gold
    });

    this.drawFramePulses({
      time,
      x,
      y,
      width,
      height,
      radius,
      gold
    });
  },

  drawFrameRunner({
    x,
    y,
    width,
    height,
    music,
    preset,
    gold
  }) {
    const context =
      this.context;

    const perimeter =
      width * 2 +
      height * 2;

    const position =
      this.borderPosition %
      perimeter;

    const runnerLength =
      Math.max(
        110,
        width * 0.21
      ) *
      (
        1 +
        music.highs * 0.7
      );

    const point =
      this.getPerimeterSegment(
        x,
        y,
        width,
        height,
        position,
        runnerLength
      );

    const color =
      this.voiceEnergy > 0.015
        ? "#ff294f"
        : gold
          ? "#fff2b0"
          : "#ffffff";

    context.save();

    context.beginPath();

    context.moveTo(
      point.startX,
      point.startY
    );

    context.lineTo(
      point.endX,
      point.endY
    );

    context.lineWidth =
      7 +
      music.highs * 6;

    context.lineCap =
      "round";

    context.strokeStyle =
      color;

    context.shadowColor =
      color;

    context.shadowBlur =
      22 +
      music.highs * 30 +
      this.bassImpact * 20;

    context.stroke();

    context.restore();
  },

  getPerimeterSegment(
    x,
    y,
    width,
    height,
    position,
    length
  ) {
    if (position < width) {
      return {
        startX:
          x + position,

        startY: y,

        endX:
          Math.min(
            x + width,
            x +
            position +
            length
          ),

        endY: y
      };
    }

    if (
      position <
      width + height
    ) {
      const local =
        position -
        width;

      return {
        startX:
          x + width,

        startY:
          y + local,

        endX:
          x + width,

        endY:
          Math.min(
            y + height,
            y +
            local +
            length
          )
      };
    }

    if (
      position <
      width * 2 +
      height
    ) {
      const local =
        position -
        width -
        height;

      return {
        startX:
          x +
          width -
          local,

        startY:
          y + height,

        endX:
          Math.max(
            x,
            x +
            width -
            local -
            length
          ),

        endY:
          y + height
      };
    }

    const local =
      position -
      width * 2 -
      height;

    return {
      startX: x,

      startY:
        y +
        height -
        local,

      endX: x,

      endY:
        Math.max(
          y,
          y +
          height -
          local -
          length
        )
    };
  },

  drawFramePulses({
    time,
    x,
    y,
    width,
    height,
    radius,
    gold
  }) {
    if (
      this.bassImpact < 0.05 &&
      this.voiceEnergy < 0.03
    ) {
      return;
    }

    const context =
      this.context;

    const energy =
      Math.max(
        this.bassImpact,
        this.voiceEnergy
      );

    for (
      let layer = 0;
      layer < 3;
      layer += 1
    ) {
      const expansion =
        energy *
        (
          12 +
          layer * 10
        );

      this.roundedRectangle(
        context,
        x - expansion,
        y - expansion,
        width + expansion * 2,
        height + expansion * 2,
        radius + expansion
      );

      const color =
        this.voiceEnergy > 0.03
          ? this.getVoiceColor(
              layer,
              energy * 0.34
            )
          : gold
            ? `rgba(
                255,
                220,
                110,
                ${energy * 0.25}
              )`
            : this.getRainbowColor(
                layer * 10,
                time,
                energy * 0.28
              );

      context.save();

      context.lineWidth =
        1.5 + energy * 2;

      context.strokeStyle =
        color;

      context.shadowColor =
        color;

      context.shadowBlur =
        18 + energy * 30;

      context.stroke();

      context.restore();
    }
  },

  drawLeftFrame(
    time,
    music,
    preset,
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
      preset,
      gold: false,
      neonIntensity
    });
  },

  drawCameraFrame(
    time,
    music,
    preset,
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
      preset,
      gold: true,
      neonIntensity
    });
  },

  drawTikTokEnergy(
    time,
    music,
    preset,
    neonIntensity
  ) {
    const context =
      this.context;

    const centerX =
      1665;

    const centerY =
      190;

    const baseRadius =
      118;

    const mode =
      window.EngineV8?.mode ||
      "live";

    const rayCount =
      mode === "legendary"
        ? 120
        : mode === "party"
          ? 96
          : 76;

    const data =
      music.frequencyData;

    for (
      let index = 0;
      index < rayCount;
      index += 1
    ) {
      const angle =
        index /
        rayCount *
        Math.PI *
        2 +
        this.tiktokRotation *
        0.012;

      const frequencyIndex =
        data
          ? Math.floor(
              index /
              rayCount *
              data.length *
              0.58
            )
          : 0;

      const frequency =
        data
          ? data[frequencyIndex] /
            255
          : 0;

      const pulse =
        10 +
        frequency * 42 +
        this.musicEnergy * 30 +
        music.bass * 22 +
        this.voiceEnergy * 26 +
        this.bassImpact * 24;

      const startRadius =
        baseRadius + 7;

      const endRadius =
        startRadius + pulse;

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
        this.voiceEnergy > 0.015
          ? this.getVoiceColor(
              index,
              0.28 +
              this.voiceEnergy *
              0.70
            )
          : this.getRainbowColor(
              index,
              time,
              0.22 +
              this.musicEnergy *
              0.72
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
        frequency * 4 +
        this.musicEnergy * 2.5;

      context.strokeStyle =
        color;

      context.shadowColor =
        color;

      context.shadowBlur =
        (
          12 +
          this.musicEnergy * 32 +
          this.voiceEnergy * 32
        ) *
        neonIntensity *
        preset.effectMultiplier;

      context.stroke();

      context.restore();
    }

    this.drawCircularHalo(
      centerX,
      centerY,
      baseRadius,
      time,
      preset,
      neonIntensity
    );
  },

  drawCircularHalo(
    centerX,
    centerY,
    radius,
    time,
    preset,
    neonIntensity
  ) {
    const context =
      this.context;

    const energy =
      Math.max(
        this.musicEnergy,
        this.voiceEnergy
      );

    for (
      let layer = 0;
      layer < 4;
      layer += 1
    ) {
      const color =
        this.voiceEnergy > 0.015
          ? this.getVoiceColor(
              layer,
              0.18 +
              this.voiceEnergy *
              0.55
            )
          : this.getRainbowColor(
              layer * 12,
              time,
              0.16 +
              this.musicEnergy *
              0.54
            );

      context.save();

      context.beginPath();

      context.arc(
        centerX,
        centerY,
        radius +
        layer * 6 +
        this.bassImpact * 10,
        0,
        Math.PI * 2
      );

      context.lineWidth =
        3 + layer * 1.3;

      context.strokeStyle =
        color;

      context.shadowColor =
        color;

      context.shadowBlur =
        (
          14 +
          energy * 32 +
          this.bassImpact * 20
        ) *
        neonIntensity *
        preset.effectMultiplier;

      context.stroke();

      context.restore();
    }
  },

  drawLiveEnergy(
    time,
    preset,
    neonIntensity
  ) {
    const context =
      this.context;

    const centerX =
      1667.5;

    const centerY =
      397.5;

    const idlePulse =
      0.5 +
      0.5 *
      Math.sin(
        time * 0.0035
      );

    const radius =
      83 +
      idlePulse * 3 +
      this.voiceEnergy * 22;

    for (
      let layer = 0;
      layer < 5;
      layer += 1
    ) {
      const opacity =
        0.16 +
        idlePulse * 0.08 +
        this.voiceEnergy *
        0.72;

      const color =
        this.getVoiceColor(
          layer,
          opacity
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
        layer * 1.1 +
        this.voiceEnergy * 3;

      context.strokeStyle =
        color;

      context.shadowColor =
        color;

      context.shadowBlur =
        (
          15 +
          this.voiceEnergy * 46 +
          idlePulse * 8
        ) *
        neonIntensity *
        preset.effectMultiplier;

      context.stroke();

      context.restore();
    }
  },

  createBassBurst(
    bass,
    preset
  ) {
    const centerX =
      960;

    const centerY =
      370;

    const count =
      Math.round(
        (
          12 +
          bass * 30
        ) *
        preset.particleMultiplier
      );

    for (
      let index = 0;
      index < count;
      index += 1
    ) {
      const angle =
        Math.random() *
        Math.PI *
        2;

      const speed =
        2 +
        Math.random() *
        (
          5 +
          bass * 8
        );

      this.bursts.push({
        x: centerX,
        y: centerY,

        velocityX:
          Math.cos(angle) *
          speed,

        velocityY:
          Math.sin(angle) *
          speed *
          0.65,

        size:
          1 +
          Math.random() * 4,

        life: 1,

        decay:
          0.014 +
          Math.random() *
          0.018,

        hue:
          Math.random() * 360
      });
    }

    if (this.bursts.length > 380) {
      this.bursts.splice(
        0,
        this.bursts.length -
        380
      );
    }
  },

  drawBassBursts(
    time,
    music,
    preset
  ) {
    const context =
      this.context;

    for (
      let index =
        this.bursts.length - 1;
      index >= 0;
      index -= 1
    ) {
      const particle =
        this.bursts[index];

      particle.x +=
        particle.velocityX;

      particle.y +=
        particle.velocityY;

      particle.velocityX *=
        0.985;

      particle.velocityY *=
        0.985;

      particle.life -=
        particle.decay;

      if (particle.life <= 0) {
        this.bursts.splice(
          index,
          1
        );

        continue;
      }

      const color =
        this.voiceEnergy > 0.02
          ? `rgba(
              255,
              35,
              70,
              ${particle.life}
            )`
          : `hsla(
              ${
                (
                  particle.hue +
                  time * 0.04
                ) %
                360
              },
              100%,
              65%,
              ${particle.life}
            )`;

      context.save();

      context.beginPath();

      context.arc(
        particle.x,
        particle.y,
        particle.size *
        (
          0.7 +
          particle.life
        ),
        0,
        Math.PI * 2
      );

      context.fillStyle =
        color;

      context.shadowColor =
        color;

      context.shadowBlur =
        10 +
        particle.life * 22;

      context.fill();

      context.restore();
    }
  },

  drawAmbientSparks(
    time,
    music,
    preset,
    qualityMultiplier
  ) {
    const context =
      this.context;

    const desiredCount =
      Math.round(
        this.sparks.length *
        preset.particleMultiplier *
        qualityMultiplier
      );

    for (
      let index = 0;
      index < desiredCount;
      index += 1
    ) {
      const spark =
        this.sparks[
          index %
          this.sparks.length
        ];

      spark.x +=
        spark.velocityX *
        preset.speedMultiplier;

      spark.y +=
        spark.velocityY *
        (
          0.5 +
          music.highs * 3
        ) *
        preset.speedMultiplier;

      spark.life +=
        0.0025 *
        preset.speedMultiplier;

      spark.opacity =
        0.07 +
        music.highs * 0.55 +
        this.bassImpact * 0.18;

      if (
        spark.y < 30 ||
        spark.x < 500 ||
        spark.x > 1450 ||
        spark.life > 1
      ) {
        Object.assign(
          spark,
          this.createSpark()
        );

        spark.y =
          620 +
          Math.random() * 250;

        spark.opacity = 0;
        spark.life = 0;
      }

      const flicker =
        0.55 +
        0.45 *
        Math.sin(
          time * 0.004 +
          spark.flicker
        );

      const opacity =
        spark.opacity *
        flicker;

      const color =
        this.voiceEnergy > 0.02
          ? `rgba(
              255,
              35,
              70,
              ${opacity}
            )`
          : `hsla(
              ${
                (
                  spark.hue +
                  time * 0.02
                ) %
                360
              },
              100%,
              70%,
              ${opacity}
            )`;

      context.save();

      context.beginPath();

      context.arc(
        spark.x,
        spark.y,
        spark.size +
        music.highs * 2,
        0,
        Math.PI * 2
      );

      context.fillStyle =
        color;

      context.shadowColor =
        color;

      context.shadowBlur =
        8 +
        music.highs * 18;

      context.fill();

      context.restore();
    }
  },

  drawEnergyTrails(
    time,
    music,
    preset
  ) {
    const mode =
      window.EngineV8?.mode ||
      "live";

    if (
      mode === "calm" ||
      this.musicEnergy < 0.08
    ) {
      return;
    }

    const context =
      this.context;

    const centerX =
      960;

    const centerY =
      370;

    const trailCount =
      mode === "legendary"
        ? 10
        : mode === "party"
          ? 7
          : 4;

    for (
      let index = 0;
      index < trailCount;
      index += 1
    ) {
      const phase =
        time * 0.0015 *
        preset.speedMultiplier +
        index *
        (
          Math.PI *
          2 /
          trailCount
        );

      const radiusX =
        310 +
        index * 18 +
        music.bass * 50;

      const radiusY =
        155 +
        index * 10 +
        music.mids * 30;

      const startAngle =
        phase;

      const endAngle =
        phase +
        0.65 +
        music.highs * 0.6;

      const color =
        this.getRainbowColor(
          index * 12,
          time,
          0.08 +
          this.musicEnergy *
          0.22
        );

      context.save();

      context.beginPath();

      context.ellipse(
        centerX,
        centerY,
        radiusX,
        radiusY,
        0,
        startAngle,
        endAngle
      );

      context.lineWidth =
        1.3 +
        music.highs * 2;

      context.strokeStyle =
        color;

      context.shadowColor =
        color;

      context.shadowBlur =
        12 +
        this.musicEnergy * 20;

      context.stroke();

      context.restore();
    }
  },

  drawVoiceWave(
    time,
    preset
  ) {
    if (
      this.voiceEnergy < 0.015
    ) {
      return;
    }

    const context =
      this.context;

    const centerX =
      960;

    const centerY =
      370;

    const pulse =
      0.5 +
      0.5 *
      Math.sin(
        time * 0.011
      );

    for (
      let layer = 0;
      layer < 4;
      layer += 1
    ) {
      const radiusX =
        320 +
        layer * 24 +
        this.voiceEnergy *
        70 +
        pulse * 12;

      const radiusY =
        175 +
        layer * 14 +
        this.voiceEnergy *
        42 +
        pulse * 8;

      const color =
        this.getVoiceColor(
          layer,
          0.12 +
          this.voiceEnergy *
          0.34
        );

      context.save();

      context.beginPath();

      context.ellipse(
        centerX,
        centerY,
        radiusX,
        radiusY,
        0,
        0,
        Math.PI * 2
      );

      context.lineWidth =
        1.5 +
        this.voiceEnergy * 2.5;

      context.strokeStyle =
        color;

      context.shadowColor =
        color;

      context.shadowBlur =
        (
          16 +
          this.voiceEnergy * 36
        ) *
        preset.effectMultiplier;

      context.stroke();

      context.restore();
    }
  },

  animateElements(
    time,
    music,
    preset
  ) {
    const musicPulse =
      this.musicEnergy;

    const voicePulse =
      this.voiceEnergy;

    if (this.elements.leftFrame) {
      const scale =
        1 +
        musicPulse * 0.005 +
        this.bassImpact * 0.004;

      this.elements.leftFrame
        .style.transform =
        `scale(${scale})`;
    }

    if (this.elements.cameraFrame) {
      const scale =
        1 +
        musicPulse * 0.007 +
        voicePulse * 0.024 +
        this.bassImpact * 0.005;

      this.elements.cameraFrame
        .style.transform =
        `scale(${scale})`;
    }

    if (this.elements.tiktok) {
      const scale =
        1 +
        musicPulse * 0.035 +
        voicePulse * 0.025 +
        this.bassImpact * 0.02;

      const rotation =
        Math.sin(
          time * 0.0012
        ) *
        music.highs *
        1.8;

      this.elements.tiktok
        .style.transform = `
          scale(${scale})
          rotate(${rotation}deg)
        `;
    }

    if (this.elements.live) {
      const breathing =
        0.006 *
        (
          0.5 +
          0.5 *
          Math.sin(
            time * 0.004
          )
        );

      const scale =
        1 +
        breathing +
        voicePulse * 0.07;

      this.elements.live
        .style.transform =
        `scale(${scale})`;

      this.elements.live
        .style.filter =
        voicePulse > 0.01
          ? `
            drop-shadow(
              0 0 ${
                12 +
                voicePulse * 42
              }px
              rgba(
                255,
                25,
                65,
                0.96
              )
            )
          `
          : `
            drop-shadow(
              0 0 10px
              rgba(
                117,
                0,
                30,
                0.40
              )
            )
          `;
    }

    this.updateCSSNeon(
      time,
      preset
    );
  },

  updateCSSNeon(
    time,
    preset
  ) {
    const hue =
      (
        time * 0.045
      ) % 360;

    if (this.elements.leftNeon) {
      this.elements.leftNeon
        .style.opacity =
        String(
          Math.min(
            1,
            0.45 +
            this.musicEnergy * 0.45 +
            this.voiceEnergy * 0.40
          )
        );

      this.elements.leftNeon
        .style.borderColor =
        this.voiceEnergy > 0.015
          ? "#ff294f"
          : `hsl(
              ${hue},
              100%,
              62%
            )`;
    }

    if (this.elements.cameraNeon) {
      this.elements.cameraNeon
        .style.opacity =
        String(
          Math.min(
            1,
            0.55 +
            this.musicEnergy * 0.30 +
            this.voiceEnergy * 0.45
          )
        );

      this.elements.cameraNeon
        .style.borderColor =
        this.voiceEnergy > 0.015
          ? "#ff294f"
          : "#ffd96a";
    }

    if (this.elements.tiktokNeon) {
      this.elements.tiktokNeon
        .style.opacity =
        String(
          Math.min(
            1,
            0.46 +
            this.musicEnergy * 0.44 +
            this.voiceEnergy * 0.38
          )
        );

      this.elements.tiktokNeon
        .style.borderColor =
        this.voiceEnergy > 0.015
          ? "#ff294f"
          : `hsl(
              ${hue},
              100%,
              62%
            )`;
    }

    if (this.elements.liveNeon) {
      this.elements.liveNeon
        .style.opacity =
        String(
          Math.min(
            1,
            0.48 +
            this.voiceEnergy * 0.52
          )
        );
    }
  }
};

window.SoulEffects =
  SoulEffects;

window.addEventListener(
  "DOMContentLoaded",
  () => SoulEffects.init()
);
