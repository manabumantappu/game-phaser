import { LEVELS } from "../data/levels.js";
import VirtualJoystick from "../ui/VirtualJoystick.js";

/* =====================
   CONSTANTS
===================== */
const TILE = 32;
const HUD_HEIGHT = 80;
const MOVE_DURATION = 260;
const POWER_TIME = 6000;

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  /* =====================
     INIT
  ===================== */
  init(data) {
    this.levelIndex = data.level ?? 0;
    this.score = data.score ?? 0;
    this.lives = data.lives ?? 3;

    this.tileX = 0;
    this.tileY = 0;
    this.moving = false;

    this.currentDir = { x: 0, y: 0 };
    this.nextDir = { x: 0, y: 0 };

    this.frightened = false;
    this.frightenedTimer = null;

    this.ghostSpeedBonus = Math.min(this.levelIndex * 20, 160);
    this.ghosts = [];
  }

  /* =====================
     CREATE
  ===================== */
  create() {
    this.level = LEVELS[this.levelIndex];
    if (!this.level) return;

    this.cursors = this.input.keyboard.createCursorKeys();
    this.joystick = new VirtualJoystick(this);

    // 🔓 unlock audio mobile
    this.input.once("pointerdown", () => {
      if (this.sound.context.state === "suspended") {
        this.sound.context.resume();
      }
    });

    // 🔊 SFX
    this.sfxCollect = this.sound.add("collect", { volume: 0.8 });
    this.sfxPower = this.sound.add("click", { volume: 0.7 });
    this.sfxFrightened = this.sound.add("frightened", {
      loop: true,
      volume: 0.5
    });

    /* =====================
       ✅ BGM FIX (INI INTINYA)
    ===================== */
    this.bgm = this.sound.get("bgm");
    if (!this.bgm) {
      this.bgm = this.sound.add("bgm", {
        loop: true,
        volume: 0.4
      });
      this.bgm.play();
    }

    this.buildMap();
    this.createPlayer();
    this.createGhosts();
    this.createHUD();
  }

  /* =====================
     HUD
  ===================== */
  createHUD() {
    this.add.rectangle(
      this.scale.width / 2,
      HUD_HEIGHT / 2,
      this.scale.width,
      HUD_HEIGHT,
      0x000000,
      0.6
    );

    this.hudScore = this.add.text(12, 22, `SCORE ${this.score}`, {
      fontSize: "18px",
      color: "#ffff00",
      fontStyle: "bold"
    });

    this.hudLives = this.add.text(
      this.scale.width / 2,
      22,
      `❤️ ${this.lives}`,
      { fontSize: "18px", color: "#ff4444" }
    ).setOrigin(0.5, 0);

    this.hudLevel = this.add.text(
      this.scale.width - 12,
      22,
      `L${this.levelIndex + 1}`,
      { fontSize: "18px", color: "#ffffff" }
    ).setOrigin(1, 0);
  }

  updateHUD() {
    this.hudScore.setText(`SCORE ${this.score}`);
    this.hudLives.setText(`❤️ ${this.lives}`);
  }

  /* =====================
     MAP
  ===================== */
  buildMap() {
    this.pellets = [];
    this.totalPellets = 0;

    this.mapWidth = this.level.map[0].length;
    this.mapHeight = this.level.map.length;

    this.level.map.forEach((row, y) => {
      this.pellets[y] = [];
      [...row].forEach((cell, x) => {
        const px = x * TILE + TILE / 2;
        const py = HUD_HEIGHT + y * TILE + TILE / 2;

        if (cell === "1") {
          this.add.image(px, py, "wall").setDisplaySize(TILE, TILE);
          this.pellets[y][x] = null;
        }
        else if (cell === "0" || cell === "2") {
          const p = this.add.image(px, py, "pellet");
          p.setDisplaySize(cell === "2" ? 18 : 12, cell === "2" ? 18 : 12);
          p.isPower = cell === "2";
          if (p.isPower) p.setTint(0x00ff00);
          this.pellets[y][x] = p;
          this.totalPellets++;
        } else {
          this.pellets[y][x] = null;
        }
      });
    });
  }

  /* =====================
     PLAYER
  ===================== */
  createPlayer() {
    this.tileX = this.level.player.x;
    this.tileY = this.level.player.y;

    this.player = this.add.sprite(
      this.tileX * TILE + TILE / 2,
      HUD_HEIGHT + this.tileY * TILE + TILE / 2,
      "pacman"
    ).setDisplaySize(28, 28);
  }

  /* =====================
     FRIGHTENED MODE
  ===================== */
  startFrightenedMode() {
    this.frightened = true;
    this.sfxPower.play();

    if (this.bgm && this.bgm.isPlaying) {
      this.bgm.pause();
    }
    if (!this.sfxFrightened.isPlaying) {
      this.sfxFrightened.play();
    }

    this.ghosts.forEach(g => g.sprite.setTint(0x0000ff));

    if (this.frightenedTimer) this.frightenedTimer.remove(false);
    this.frightenedTimer = this.time.delayedCall(POWER_TIME, () => {
      this.endFrightenedMode();
    });
  }

  endFrightenedMode() {
    this.frightened = false;

    if (this.sfxFrightened.isPlaying) {
      this.sfxFrightened.stop();
    }
    if (this.bgm && !this.bgm.isPlaying) {
      this.bgm.resume();
    }

    this.ghosts.forEach(g => {
      g.sprite.clearTint();
    });
  }

  /* =====================
     (SISA KODE TIDAK DIUBAH)
  ===================== */
}
