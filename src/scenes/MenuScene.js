export default class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    const { width, height } = this.scale;

    this.add.text(width / 2, height / 2 - 60, "PUZZLE GAME", {
      fontSize: "32px",
      color: "#ffffff"
    }).setOrigin(0.5);

    const startText = this.add.text(width / 2, height / 2 + 20, "PRESS SPACE TO START", {
      fontSize: "16px",
      color: "#00ffcc"
    }).setOrigin(0.5);

    this.input.keyboard.once("keydown-SPACE", () => {
      this.scene.start("GameScene");
    });
  }
}
