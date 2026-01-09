import { LEVELS } from "../data/levels.js";
import VirtualJoystick from "../ui/VirtualJoystick.js";

const TILE = 32;
const HUD_HEIGHT = 80;
const MOVE_TIME = 240;
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
    this.ghosts = [];
  }

  /* =====================
     CREATE
  ===================== */
  create() {
    this.level = LEVELS[this.levelIndex];
    if (!this.level) {
      this.scene.start("MenuScene");
      return;
    }

    // INPUT
    this.cursors = this.input.keyboard.createCursorKeys();
    this.joystick = new VirtualJoystick(this); // ✅ BENAR

    // AUDIO SAFE
    this.sfxCollect = this.sound.add("collect", { volume: 0.7 });
    this.sfxPower = this.sound.add("click", { volume: 0.6 });
    this.sfxFrightened = this.sound.add("frightened", { loop: true, volume: 0.5 });
    this.sfxLevelClear = this.sound.add("levelclear", { volume: 0.8 });

    if (!this.sound.get("bgm")) {
      this.bgm = this.sound.add("bgm", { loop: true, volume: 0.4 });
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

    this.txtScore = this.add.text(12, 24, `SCORE ${this.score}`, {
      fontSize: "18px",
      color: "#ffff00",
      fontStyle: "bold"
    });

    this.txtLives = this.add.text(
      this.scale.width / 2,
      24,
      `❤️ ${this.lives}`,
      { fontSize: "18px", color: "#ff4444" }
    ).setOrigin(0.5, 0);

    this.txtLevel = this.add.text(
      this.scale.width - 12,
      24,
      `L${this.levelIndex + 1}`,
      { fontSize: "18px", color: "#ffffff" }
    ).setOrigin(1, 0);
  }

  updateHUD() {
    this.txtScore.setText(`SCORE ${this.score}`);
    this.txtLives.setText(`❤️ ${this.lives}`);
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

        if (cell === "0" || cell === "2") {
          const p = this.add.image(px, py, "pellet").setDepth(2);
          p.isPower = cell === "2";
          p.setDisplaySize(p.isPower ? 18 : 10, p.isPower ? 18 : 10);
          if (p.isPower) p.setTint(0x00ff00);
          this.pellets[y][x] = p;
          this.totalPellets++;
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
     GHOSTS
  ===================== */
  createGhosts() {
    this.level.ghosts.forEach(g => {
      const ghost = {
        tileX: g.x,
        tileY: g.y,
        moving: false,
        sprite: this.add.sprite(
          g.x * TILE + TILE / 2,
          HUD_HEIGHT + g.y * TILE + TILE / 2,
          "ghost"
        ).setDisplaySize(28, 28)
      };
      this.ghosts.push(ghost);
    });
  }

  /* =====================
     INPUT
  ===================== */
  readInput() {
    if (this.cursors.left.isDown) this.nextDir = { x: -1, y: 0 };
    else if (this.cursors.right.isDown) this.nextDir = { x: 1, y: 0 };
    else if (this.cursors.up.isDown) this.nextDir = { x: 0, y: -1 };
    else if (this.cursors.down.isDown) this.nextDir = { x: 0, y: 1 };

    if (this.joystick.forceX || this.joystick.forceY) {
      if (Math.abs(this.joystick.forceX) > Math.abs(this.joystick.forceY)) {
        this.nextDir = { x: Math.sign(this.joystick.forceX), y: 0 };
      } else {
        this.nextDir = { x: 0, y: Math.sign(this.joystick.forceY) };
      }
    }
  }

  canMove(x, y) {
    if (x < 0 || x >= this.mapWidth) return false;
    if (y < 0 || y >= this.mapHeight) return false;
    return this.level.map[y][x] !== "1";
  }

  /* =====================
     UPDATE
  ===================== */
  update() {
    this.readInput();

    if (!this.moving && (this.nextDir.x !== 0 || this.nextDir.y !== 0)) {
      if (this.canMove(this.tileX + this.nextDir.x, this.tileY + this.nextDir.y)) {
        this.startMove(this.nextDir);
      }
    }

    this.moveGhosts();
  }

  /* =====================
     MOVE PLAYER
  ===================== */
  startMove(dir) {
    this.moving = true;
    this.currentDir = dir;

    const tx = this.tileX + dir.x;
    const ty = this.tileY + dir.y;

    this.tweens.add({
      targets: this.player,
      x: tx * TILE + TILE / 2,
      y: HUD_HEIGHT + ty * TILE + TILE / 2,
      duration: MOVE_TIME,
      onComplete: () => {
        this.tileX = tx;
        this.tileY = ty;
        this.moving = false;

        const pellet = this.pellets[ty]?.[tx];
        if (pellet) {
          pellet.destroy();
          this.pellets[ty][tx] = null;
          this.totalPellets--;
          this.score += pellet.isPower ? 50 : 10;
          this.sfxCollect.play();
          if (pellet.isPower) this.startFrightened();
          this.updateHUD();
        }

        if (this.totalPellets === 0) this.levelClear();
      }
    });
  }

  /* =====================
     GHOST MOVE
  ===================== */
  moveGhosts() {
    this.ghosts.forEach(g => {
      if (g.moving) return;

      const dx = this.tileX - g.tileX;
      const dy = this.tileY - g.tileY;

      const dir =
        Math.abs(dx) > Math.abs(dy)
          ? { x: Math.sign(dx), y: 0 }
          : { x: 0, y: Math.sign(dy) };

      const nx = g.tileX + dir.x;
      const ny = g.tileY + dir.y;

      if (!this.canMove(nx, ny)) return;

      g.moving = true;
      this.tweens.add({
        targets: g.sprite,
        x: nx * TILE + TILE / 2,
        y: HUD_HEIGHT + ny * TILE + TILE / 2,
        duration: MOVE_TIME + 60,
        onComplete: () => {
          g.tileX = nx;
          g.tileY = ny;
          g.moving = false;
        }
      });
    });
  }

  /* =====================
     FRIGHTENED
  ===================== */
  startFrightened() {
    this.frightened = true;
    this.bgm.pause();
    this.sfxFrightened.play();
    this.ghosts.forEach(g => g.sprite.setTint(0x0000ff));

    this.time.delayedCall(POWER_TIME, () => {
      this.frightened = false;
      this.sfxFrightened.stop();
      this.bgm.resume();
      this.ghosts.forEach(g => g.sprite.clearTint());
    });
  }

  /* =====================
     LEVEL CLEAR
  ===================== */
  levelClear() {
    this.sfxLevelClear.play();
    this.add.text(
      this.scale.width / 2,
      this.scale.height / 2,
      "LEVEL CLEAR",
      { fontSize: "36px", color: "#ffff00", fontStyle: "bold" }
    ).setOrigin(0.5);

    this.time.delayedCall(1200, () => {
      this.scene.start("GameScene", {
        level: this.levelIndex + 1,
        score: this.score,
        lives: this.lives
      });
    });
  }
}
