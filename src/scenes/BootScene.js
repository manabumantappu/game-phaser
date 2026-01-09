export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    /* ===== SPRITES ===== */
    this.load.image("pacman", "assets/sprites/pacman.png");
    this.load.image("ghost", "assets/sprites/ghost.png");
    this.load.image("pellet", "assets/sprites/pellet.png");
    this.load.image("wall", "assets/sprites/wall.png");
    this.load.image("goal", "assets/sprites/goal.png");

    /* ===== AUDIO ===== */
    this.load.audio("bgm", "assets/audio/bgm.mp3");
    this.load.audio("click", "assets/audio/click.wav");
    this.load.audio("collect", "assets/audio/collect.wav");
    this.load.audio("frightened", "assets/audio/frightened.wav");
    this.load.audio("levelclear", "assets/audio/levelclear.wav");
  }

  create() {
    this.scene.start("MenuScene");
  }
}
