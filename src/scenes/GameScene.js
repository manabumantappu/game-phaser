import { LEVELS } from "../data/levels.js";
import VirtualJoystick from "../ui/VirtualJoystick.js";

/* =====================
   CONSTANTS
===================== */
const TILE = 32;
const HUD_HEIGHT = 80;
const PLAYER_SPEED = 160;
const GHOST_SPEED = 120;
const POWER_TIME = 6000;

// map 13 tile = 416px → center di layar 480px
const MAP_WIDTH = 13 * TILE;
const MAP_OFFSET_X = (480 - MAP_WIDTH) / 2;

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

    this.currentDir = { x: 0, y: 0 };
    this.nextDir = { x: 0, y: 0 };
    this.frightened = false;
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

    this.cursors = this.input.keyboard.createCursorKeys();
    this.joystick = new VirtualJoystick(this);

    this.sfxCollect = this.sound.add("collect", { volume: 0.6 });
    this.sfxFrightened = this.sound.add("frightened", { loop: true, volume: 0.5 });

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
     MAP
  ===================== */
  buildMap() {
    this.walls = this.physics.add.staticGroup();
    this.pellets = this.physics.add.group();

    this.mapWidth = this.level.map[0].length;
    this.mapHeight = this.level.map.length;

    this.level.map.forEach((row, y) => {
      [...row].forEach((cell, x) => {
        const px = MAP_OFFSET_X + x * TILE + TILE / 2;
        const py = HUD_HEIGHT + y * TILE + TILE / 2;

        if (cell === "1") {
          const w = this.walls.create(px, py, "wall");
          w.setDisplaySize(TILE, TILE).refreshBody();
        }

        if (cell === "0" || cell === "2") {
          const p = this.pellets.create(px, py, "pellet");
          p.setDisplaySize(cell === "2" ? 18 : 10, cell === "2" ? 18 : 10);
          p.isPower = cell === "2";
          if (p.isPower) p.setTint(0x00ff00);
        }
      });
    });
  }

  /* =====================
     PLAYER
  ===================== */
  createPlayer() {
    const { x, y } = this.level.player;

    this.player = this.physics.add.sprite(
      MAP_OFFSET_X + x * TILE + TILE / 2,
      HUD_HEIGHT + y * TILE + TILE / 2,
      "pacman"
    );

    this.player.setDisplaySize(28, 28);
    this.player.setCollideWorldBounds(false);

    this.physics.add.collider(this.player, this.walls);
    this.physics.add.overlap(this.player, this.pellets, this.onEatPellet, null, this);
  }

  /* =====================
     GHOSTS
  ===================== */
  createGhosts() {
    this.ghosts = this.physics.add.group();

    this.level.ghosts.forEach(g => {
      const ghost = this.ghosts.create(
        MAP_OFFSET_X + g.x * TILE + TILE / 2,
        HUD_HEIGHT + g.y * TILE + TILE / 2,
        "ghost"
      );

      ghost.setDisplaySize(28, 28);
    });

    this.physics.add.collider(this.ghosts, this.walls);
    this.physics.add.overlap(this.player, this.ghosts, this.onHitGhost, null, this);
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
      color: "#ffff00"
    });

    this.txtLives = this.add.text(
      this.scale.width / 2,
      24,
      `❤️ ${this.lives}`,
      { fontSize: "18px", color: "#ff4444" }
    ).setOrigin(0.5, 0);
  }

  updateHUD() {
    this.txtScore.setText(`SCORE ${this.score}`);
    this.txtLives.setText(`❤️ ${this.lives}`);
  }

  /* =====================
     GRID CHECK
  ===================== */
  isCenteredOnTile() {
    const cx = MAP_OFFSET_X +
      Math.round((this.player.x - MAP_OFFSET_X) / TILE) * TILE;
    const cy = HUD_HEIGHT +
      Math.round((this.player.y - HUD_HEIGHT) / TILE) * TILE;

    return (
      Math.abs(this.player.x - cx) < 2 &&
      Math.abs(this.player.y - cy) < 2
    );
  }

  /* =====================
     UPDATE (PAC-MAN STYLE)
  ===================== */
  update() {
    let inputDir = { x: 0, y: 0 };

    if (this.cursors.left?.isDown) inputDir = { x: -1, y: 0 };
    else if (this.cursors.right?.isDown) inputDir = { x: 1, y: 0 };
    else if (this.cursors.up?.isDown) inputDir = { x: 0, y: -1 };
    else if (this.cursors.down?.isDown) inputDir = { x: 0, y: 1 };

    if (this.joystick && (this.joystick.forceX || this.joystick.forceY)) {
      if (Math.abs(this.joystick.forceX) > Math.abs(this.joystick.forceY)) {
        inputDir = { x: Math.sign(this.joystick.forceX), y: 0 };
      } else {
        inputDir = { x: 0, y: Math.sign(this.joystick.forceY) };
      }
    }

    if (inputDir.x !== 0 || inputDir.y !== 0) {
      this.nextDir = inputDir;
    }

    if (this.isCenteredOnTile()) {
      this.currentDir = this.nextDir;
    }

    this.player.setVelocity(
      this.currentDir.x * PLAYER_SPEED,
      this.currentDir.y * PLAYER_SPEED
    );

    this.ghosts.children.iterate(g => {
      this.physics.moveToObject(g, this.player, GHOST_SPEED);
    });
  }

  /* =====================
     EVENTS
  ===================== */
  onEatPellet(player, pellet) {
    pellet.destroy();
    this.score += pellet.isPower ? 50 : 10;
    this.updateHUD();
    this.sfxCollect.play();
  }

  onHitGhost() {
    this.lives--;
    this.updateHUD();

    if (this.lives <= 0) {
      this.scene.start("MenuScene");
    } else {
      this.scene.restart({
        level: this.levelIndex,
        score: this.score,
        lives: this.lives
      });
    }
  }
}
