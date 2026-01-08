export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    // DEBUG
    console.log("BootScene preload");

    // AUDIO (PASTI ADA)
    this.load.audio("bgm", "assets/audio/bgm.mp3");
    this.load.audio("click", "assets/audio/click.wav");
    this.load.audio("collect", "assets/audio/collect.wav");
  }

  create() {
    console.log("BootScene complete");
    this.scene.start("MenuScene");
  }
}
