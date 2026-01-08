export default class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    const { width, height } = this.scale;

    // Background
    this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x000000
    );

    // =====================
    // JUDUL GAME
    // =====================
    const title = this.add.text(
      width / 2,
      height * 0.3,
      "MANABU\nMANTAPPU",
      {
        fontSize: "42px",
        fontStyle: "bold",
        color: "#ffff00",
        align: "center"
      }
    )
    .setOrigin(0.5);

    // Animasi masuk (halus)
    title.setScale(0.2);
    this.tweens.add({
      targets: title,
      scale: 1,
      duration: 600,
      ease: "Back.Out"
    });

    // Subtitle
    this.add.text(
      width / 2,
      height * 0.42,
      "PAC-MAN STYLE GAME",
      {
        fontSize: "14px",
        color: "#ffffff"
      }
    ).setOrigin(0.5);

    // =====================
    // BUTTON START
    // =====================
    const btn = this.add.rectangle(
      width / 2,
      height * 0.6,
      220,
      54,
      0xffff00
    ).setInteractive({ useHandCursor: true });

    const btnText = this.add.text(
      width / 2,
      height * 0.6,
      "START",
      {
        fontSize: "20px",
        fontStyle: "bold",
        color: "#000000"
      }
    ).setOrigin(0.5);

    btn.on("pointerdown", () => {
      this.scene.start("GameScene", {
        level: 0,
        score: 0
      });
    });

    // Footer
    this.add.text(
      width / 2,
      height - 30,
      "Tap to Start",
      {
        fontSize: "12px",
        color: "#aaaaaa"
      }
    ).setOrigin(0.5);
  }
}
