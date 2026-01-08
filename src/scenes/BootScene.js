export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    // 🎵 AUDIO
    this.load.audio("bgm", "assets/audio/bgm.mp3");
    this.load.audio("collect", "assets/audio/collect.wav");
    this.load.audio("click", "assets/audio/click.wav");
  }

  create() {
    this.scene.start("MenuScene");
  }
}
