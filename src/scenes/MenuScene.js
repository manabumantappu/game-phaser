export default class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    const { width, height } = this.scale;

    /* =====================
       BACKGROUND
    ===================== */
    this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x000000
    ).setDepth(0);

    /* =====================
       TITLE
    ===================== */
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
    .setOrigin(0.5)
    .setDepth(5);

    title.setScale(0.2);
    this.tweens.add({
      targets: title,
      scale: 1,
      duration: 600,
      ease: "Back.Out"
    });

    /* =====================
       SUBTITLE
    ===================== */
    this.add.text(
      width / 2,
      height * 0.42,
      "PAC-MAN STYLE GAME",
      {
        fontSize: "14px",
        color: "#ffffff"
      }
    ).setOrigin(0.5).setDepth(5);

    /* =====================
       START BUTTON
    ===================== */
    const btn = this.add.rectangle(
      width / 2,
      height * 0.6,
      220,
      54,
      0xffff00
    )
    .setInteractive({ useHandCursor: true })
    .setDepth(10);

    const btnText = this.add.text(
      width / 2,
      height * 0.6,
      "START",
      {
        fontSize: "20px",
        fontStyle: "bold",
        color: "#000000"
      }
    ).setOrigin(0.5).setDepth(11);

    // efek tekan (UX bagus)
    btn.on("pointerdown", () => {
      btn.setScale(0.95);
      btnText.setScale(0.95);
    });

    btn.on("pointerup", () => {
      btn.setScale(1);
      btnText.setScale(1);

      this.scene.start("GameScene", {
        level: 0,
        score: 0,
        lives: 3
      });
    });

    btn.on("pointerout", () => {
      btn.setScale(1);
      btnText.setScale(1);
    });

    /* =====================
       FOOTER
    ===================== */
    this.add.text(
      width / 2,
      height - 30,
      "Tap to Start",
      {
        fontSize: "12px",
        color: "#aaaaaa"
      }
    ).setOrigin(0.5).setDepth(5);
  }
}
