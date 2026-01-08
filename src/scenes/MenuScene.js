export default class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    const { width, height } = this.scale;

    this.add.text(
      width / 2,
      height / 2 - 60,
      "PUZZLE GAME",
      {
        fontSize: "32px",
        color: "#ffffff"
      }
    ).setOrigin(0.5);

    this.add.text(
      width / 2,
      height / 2,
      "PRESS SPACE OR TAP TO START",
      {
        fontSize: "16px",
        color: "#00ffcc"
      }
    ).setOrigin(0.5);

    // ✅ KEYBOARD (PC)
    this.input.keyboard.once("keydown-SPACE", () => {
      this.startGame();
    });

    // ✅ TOUCH / TAP (HP)
    this.input.once("pointerdown", () => {
      this.startGame();
    });
  }

  startGame() {
    this.scene.start("GameScene", {
      level: 0,
      score: 0
    });
  }
}
