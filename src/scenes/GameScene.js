import { LEVELS } from "../data/levels.js";
import VirtualJoystick from "../ui/VirtualJoystick.js";

const TILE = 32;
const HUD_HEIGHT = 80;
const MOVE_DURATION = 260; <====  speed pacman =====!

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
    this.ghosts = [];

    this.currentDir = { x: 0, y: 0 };
    this.nextDir = { x: 0, y: 0 };

    this.tileX = 0;
    this.tileY = 0;
    this.moving = false;
  }

  /* =====================
     CREATE
  ===================== */
  create() {
    console.log("GameScene start");

    this.level = LEVELS[this.levelIndex];
    if (!this.level) {
      console.error("LEVEL NOT FOUND", this.levelIndex);
      return;
    }

    this.cursors = this.input.keyboard.createCursorKeys();
    this.joystick = new VirtualJoystick(this);

    // unlock audio (mobile safe)
    this.input.once("pointerdown", () => {
      if (this.sound.context.state === "suspended") {
        this.sound.context.resume();
      }
    });

    this.buildMap();
    this.createPlayer();
    this.createGhosts(); // 👻 TAMBAHKAN
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

    this.hudScore = this.add.text(
      12,
      24,
      `SCORE ${this.score}`,
      { fontSize: "18px", color: "#ffff00", fontStyle: "bold" }
    );

    this.hudLevel = this.add.text(
      this.scale.width - 12,
      24,
      `L${this.levelIndex + 1}`,
      { fontSize: "18px", color: "#ffffff", fontStyle: "bold" }
    ).setOrigin(1, 0);
  }

  updateHUD() {
    this.hudScore.setText(`SCORE ${this.score}`);
  }

  /* =====================
     MAP + PELLET
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
        else if (cell === "0") {
          const p = this.add.image(px, py, "pellet");
          p.setDisplaySize(12, 12);
          p.setTint(0xffff00);
          this.pellets[y][x] = p;
          this.totalPellets++;
        } 
        else {
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
     GHOST
  ===================== */
createGhosts() {
  this.ghosts = [];

  this.level.ghosts.forEach(g => {
    const ghost = {
      tileX: g.x,
      tileY: g.y,
      dir: { x: 0, y: 0 },
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
moveGhosts() {
  this.ghosts.forEach(ghost => {
    if (ghost.moving) return;

    // arah menuju pacman
    const dx = this.tileX - ghost.tileX;
    const dy = this.tileY - ghost.tileY;

    let dir;
    if (Math.abs(dx) > Math.abs(dy)) {
      dir = { x: Math.sign(dx), y: 0 };
    } else {
      dir = { x: 0, y: Math.sign(dy) };
    }

    // fallback random kalau buntu
    if (!this.canMoveGhost(ghost, dir)) {
      const dirs = [
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: -1 }
      ];
      Phaser.Utils.Array.Shuffle(dirs);
      dir = dirs.find(d => this.canMoveGhost(ghost, d));
    }

    if (dir) this.startGhostMove(ghost, dir);
  });
}
canMoveGhost(ghost, dir) {
  const nx = ghost.tileX + dir.x;
  const ny = ghost.tileY + dir.y;

  if (
    ny < 0 ||
    ny >= this.mapHeight ||
    nx < 0 ||
    nx >= this.mapWidth
  ) return false;

  return this.level.map[ny][nx] !== "1";
}

startGhostMove(ghost, dir) {
  ghost.moving = true;

  const tx = ghost.tileX + dir.x;
  const ty = ghost.tileY + dir.y;

  this.tweens.add({
    targets: ghost.sprite,
    x: tx * TILE + TILE / 2,
    y: HUD_HEIGHT + ty * TILE + TILE / 2,
    duration: MOVE_DURATION + 40,
    ease: "Linear",
    onComplete: () => {
      ghost.tileX = tx;
      ghost.tileY = ty;
      ghost.moving = false;

      // cek tabrakan pacman
      if (ghost.tileX === this.tileX && ghost.tileY === this.tileY) {
        this.scene.restart({
          level: this.levelIndex,
          score: this.score
        });
      }
    }
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
        this.nextDir = { x: this.joystick.forceX > 0 ? 1 : -1, y: 0 };
      } else {
        this.nextDir = { x: 0, y: this.joystick.forceY > 0 ? 1 : -1 };
      }
    }
  }

  /* =====================
     GRID CHECK + PORTAL
  ===================== */
  canMove(dir) {
    if (!dir || (dir.x === 0 && dir.y === 0)) return false;

    let nx = this.tileX + dir.x;
    let ny = this.tileY + dir.y;

    // PORTAL kiri–kanan
    if (nx < 0) nx = this.mapWidth - 1;
    if (nx >= this.mapWidth) nx = 0;

    if (ny < 0 || ny >= this.mapHeight) return false;

    return this.level.map[ny][nx] !== "1";
  }

  /* =====================
     MOVE 1 TILE
  ===================== */
  startMove(dir) {
    this.currentDir = dir;
    this.moving = true;

    let tx = this.tileX + dir.x;
    let ty = this.tileY + dir.y;

    // PORTAL kiri–kanan
    if (tx < 0) tx = this.mapWidth - 1;
    if (tx >= this.mapWidth) tx = 0;

    this.tweens.add({
      targets: this.player,
      x: tx * TILE + TILE / 2,
      y: HUD_HEIGHT + ty * TILE + TILE / 2,
      duration: MOVE_DURATION,
      ease: "Linear",
      onComplete: () => {
        this.tileX = tx;
        this.tileY = ty;
        this.moving = false;

        // makan pellet
        const pellet = this.pellets[ty]?.[tx];
        if (pellet) {
          pellet.destroy();
          this.pellets[ty][tx] = null;
          this.totalPellets--;
          this.score += 10;
          this.updateHUD();
        }

        // win
        if (this.totalPellets === 0) {
          this.levelClear();
        }
      }
    });

    // rotasi
    if (dir.x < 0) this.player.setAngle(180);
    else if (dir.x > 0) this.player.setAngle(0);
    else if (dir.y < 0) this.player.setAngle(270);
    else if (dir.y > 0) this.player.setAngle(90);
  }

  /* =====================
     LEVEL CLEAR
  ===================== */
  levelClear() {
    const text = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2,
      "LEVEL CLEAR",
      { fontSize: "36px", color: "#ffff00", fontStyle: "bold" }
    ).setOrigin(0.5);

    this.time.delayedCall(1200, () => {
      this.scene.start("GameScene", {
        level: this.levelIndex + 1,
        score: this.score
      });
    });
  }

  /* =====================
     UPDATE
  ===================== */
  update() {
    this.readInput();
    if (this.moving) return;

    if (this.canMove(this.nextDir)) {
      this.moveGhosts();
      this.startMove(this.nextDir);
    } else if (this.canMove(this.currentDir)) {
      this.startMove(this.currentDir);
    }
  }
}
