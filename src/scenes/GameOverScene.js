export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super("GameOverScene");
  }

  init(data) {
    this.finalScore = data.score;
  }

  create() {
    const { width, height } = this.scale;

    this.add.text(width / 2, height / 2 - 40, "GAME OVER", {
      fontSize: "32px",
      color: "#ff5555"
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2, `Score: ${this.finalScore}`, {
      fontSize: "18px",
      color: "#ffffff"
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 60, "PRESS SPACE TO RESTART", {
      fontSize: "14px",
      color: "#00ffcc"
    }).setOrigin(0.5);

    this.input.keyboard.once("keydown-SPACE", () => {
      this.scene.start("MenuScene");
    });
  }
}
