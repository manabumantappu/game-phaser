export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    console.log("BootScene preload start");

    // LOAD AUDIO (SUDAH TERBUKTI ADA)
    this.load.audio("bgm", "assets/audio/bgm.mp3");
    this.load.audio("click", "assets/audio/click.wav");
    this.load.audio("collect", "assets/audio/collect.wav");
  }

  create() {
    console.log("BootScene complete → go MenuScene");
    this.scene.start("MenuScene");
  }
}
