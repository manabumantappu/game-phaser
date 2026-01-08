export default class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    const { width, height } = this.scale;

    /* ======================
       BACKGROUND
    ====================== */
    this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x111111
    );

    /* ======================
       TITLE
    ====================== */
    this.add.text(
      width / 2,
      height * 0.28,
      "MAZE\nPUZZLE",
      {
        fontSize: "42px",
        color: "#ffffff",
        fontStyle: "bold",
        align: "center"
      }
    ).setOrigin(0.5);

    this.add.text(
      width / 2,
      height * 0.4,
      "Mobile Puzzle Game",
      {
        fontSize: "14px",
        color: "#aaaaaa"
      }
    ).setOrigin(0.5);

    /* ======================
       BUTTONS
    ====================== */
    this.createButton(
      width / 2,
      height * 0.55,
      "START",
      () => {
        this.sound.play("click", { volume: 0.6 });
        this.scene.start("GameScene", {
          level: 1,
          score: 0
        });
      }
    );

    this.createButton(
      width / 2,
      height * 0.65,
      "LEVEL SELECT",
      () => {
        this.sound.play("click", { volume: 0.6 });
        this.scene.start("LevelSelectScene");
      }
    );

    /* ======================
       FOOTER
    ====================== */
    this.add.text(
      width / 2,
      height - 30,
      "Tap buttons to play",
      {
        fontSize: "12px",
        color: "#777777"
      }
    ).setOrigin(0.5);
  }

  /* ======================
     BUTTON COMPONENT
  ====================== */
  createButton(x, y, label, onClick) {
    const btnWidth = 220;
    const btnHeight = 54;

    const button = this.add.rectangle(
      x,
      y,
      btnWidth,
      btnHeight,
      0x00bfa5
    ).setInteractive({ useHandCursor: true });

    const text = this.add.text(
      x,
      y,
      label,
      {
        fontSize: "18px",
        color: "#000000",
        fontStyle: "bold"
      }
    ).setOrigin(0.5);

    // Visual feedback
    button.on("pointerdown", () => {
      button.setScale(0.95);
      if (navigator.vibrate) navigator.vibrate(20);
    });

    button.on("pointerup", () => {
      button.setScale(1);
      onClick();
    });

    button.on("pointerout", () => {
      button.setScale(1);
    });
  }
}
