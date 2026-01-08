export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  init(data) {
    this.level = data.level || 0;
    this.score = data.score || 0;
  }

  create() {
    /* ======================
       MAZE LEVELS (SOLVABLE)
       P = Player
       T = Target
       # = Wall
       . = Path
    ====================== */
    this.mazes = [
      // LEVEL 1 (Tutorial)
      [
        "##########",
        "#P.......#",
        "#.######.#",
        "#....T...#",
        "#.######.#",
        "#........#",
        "#.######.#",
        "#....T...#",
        "#........#",
        "##########"
      ],

      // LEVEL 2
      [
        "##########",
        "#P.#....T#",
        "#.#.####.#",
        "#.#....#.#",
        "#.##.##.#.#",
        "#....#...#",
        "####.#.#.#",
        "#T...#...#",
        "#.#####..#",
        "##########"
      ],

      // LEVEL 3
      [
        "##########",
        "#P.......#",
        "#.######.#",
        "#.#....#.#",
        "#.#.##.#.#",
        "#.#.T..#.#",
        "#.#.##.#.#",
        "#.#....#T#",
        "#........#",
        "##########"
      ],

      // LEVEL 4
      [
        "##########",
        "#P.#....T#",
        "#.#.##.#.#",
        "#.#....#.#",
        "#.####.#.#",
        "#......#.#",
        "#.######.#",
        "#T.......#",
        "#........#",
        "##########"
      ],

      // LEVEL 5
      [
        "##########",
        "#P.......#",
        "#.######.#",
        "#....#...#",
        "####.#.#.#",
        "#T...#.#.#",
        "#.###.#.#.#",
        "#.....#..#",
        "#..T......#",
        "##########"
      ],

      // LEVEL 6
      [
        "##########",
        "#P....T..#",
        "#.######.#",
        "#.#....#.#",
        "#.#.##.#.#",
        "#...##....#",
        "####.######",
        "#T........#",
        "#........#",
        "##########"
      ],

      // LEVEL 7
      [
        "##########",
        "#P.......#",
        "#.######.#",
        "#.#....#.#",
        "#.#.##.#.#",
        "#.#.##.#.#",
        "#.#....#T#",
        "#.######.#",
        "#....T...#",
        "##########"
      ],

      // LEVEL 8
      [
        "##########",
        "#P.#....T#",
        "#.#.####.#",
        "#.#......#",
        "#.######.#",
        "#....#...#",
        "#.##.#.##.#",
        "#T...#....#",
        "#......T.#",
        "##########"
      ],

      // LEVEL 9
      [
        "##########",
        "#P.......#",
        "#.######.#",
        "#....#...#",
        "#.##.#.#.#",
        "#T..#.#.#.#",
        "####.#.#.#",
        "#.....#..#",
        "#..T......#",
        "##########"
      ],

      // LEVEL 10 (Hard)
      [
        "##########",
        "#P.#....T#",
        "#.#.####.#",
        "#.#....#.#",
        "#.##.##.#.#",
        "#....#...#",
        "#.#######.#",
        "#T........#",
        "#......T.#",
        "##########"
      ]
    ];

    this.tileSize = 48;
    this.map = this.mazes[this.level % this.mazes.length];

    this.createMaze();
    this.createUI();
    this.createControls();
    this.createTimer();
    this.createJoystick();

    // Tutorial hanya level 1 & mobile
    if (this.level === 0 && this.sys.game.device.input.touch) {
      this.showTutorial();
    }
  }

  /* ======================
     MAZE
  ====================== */
  createMaze() {
    const tile = this.tileSize;

    this.walls = this.physics.add.staticGroup();
    this.targets = this.physics.add.group();

    this.map.forEach((row, y) => {
      [...row].forEach((cell, x) => {
        const px = x * tile + tile / 2;
        const py = y * tile + tile / 2;

        if (cell === "#") {
          const wall = this.add.rectangle(px, py, tile, tile, 0x992222);
          this.walls.add(wall);
        }

        if (cell === "P") {
          this.player = this.add.rectangle(
            px, py,
            tile * 0.6, tile * 0.6,
            0x00aaff
          );
          this.physics.add.existing(this.player);
          this.player.body.setCollideWorldBounds(true);
        }

        if (cell === "T") {
          const target = this.add.rectangle(
            px, py,
            tile * 0.5, tile * 0.5,
            0xffcc00
          );
          this.physics.add.existing(target);
          this.targets.add(target);
        }
      });
    });

    this.targetsLeft = this.targets.getChildren().length;
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.overlap(
      this.player,
      this.targets,
      this.collectTarget,
      null,
      this
    );
  }

  /* ======================
     UI
  ====================== */
  createUI() {
    this.timeLeft = Math.max(20, 50 - this.level * 2);

    this.uiText = this.add.text(10, 10, "", {
      color: "#ffffff",
      fontSize: "14px"
    }).setDepth(1000);

    this.updateUI();
  }

  updateUI() {
    this.uiText.setText(
      `Level: ${this.level + 1}\nScore: ${this.score}\nTargets: ${this.targetsLeft}\nTime: ${this.timeLeft}`
    );
  }

  /* ======================
     CONTROLS
  ====================== */
  createControls() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys("W,A,S,D");
  }

  /* ======================
     TIMER
  ====================== */
  createTimer() {
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.timeLeft--;
        this.updateUI();
        if (this.timeLeft <= 0) this.endGame();
      },
      loop: true
    });
  }

  /* ======================
     GAME LOGIC
  ====================== */
  collectTarget(player, target) {
    target.destroy();
    this.targetsLeft--;
    this.score += 10;

    if (navigator.vibrate) navigator.vibrate(30);

    this.updateUI();

    if (this.targetsLeft <= 0) {
      this.scene.restart({
        level: this.level + 1,
        score: this.score
      });
    }
  }

  endGame() {
    navigator.vibrate?.([100, 50, 100]);
    this.scene.start("GameOverScene", { score: this.score });
  }

  update() {
    const speed = 150;
    const body = this.player.body;
    body.setVelocity(0);

    // Keyboard
    if (this.cursors.left.isDown || this.keys.A.isDown)
      body.setVelocityX(-speed);
    if (this.cursors.right.isDown || this.keys.D.isDown)
      body.setVelocityX(speed);
    if (this.cursors.up.isDown || this.keys.W.isDown)
      body.setVelocityY(-speed);
    if (this.cursors.down.isDown || this.keys.S.isDown)
      body.setVelocityY(speed);

    // Joystick
    if (this.joyActive) {
      body.setVelocity(
        this.joyVector.x * speed,
        this.joyVector.y * speed
      );
    }
  }

  /* ======================
     ANALOG JOYSTICK
  ====================== */
  createJoystick() {
    this.joyActive = false;
    this.joyVector = new Phaser.Math.Vector2(0, 0);

    const { height } = this.scale;

    this.joyBase = this.add.circle(90, height - 110, 40, 0xffffff, 0.25)
      .setScrollFactor(0)
      .setDepth(2000);

    this.joyThumb = this.add.circle(90, height - 110, 20, 0xffffff, 0.6)
      .setScrollFactor(0)
      .setDepth(2001);

    this.input.on("pointerdown", p => {
      this.joyActive = true;
      this.joyBase.setPosition(p.x, p.y);
      this.joyThumb.setPosition(p.x, p.y);
      this.joyStart = new Phaser.Math.Vector2(p.x, p.y);
    });

    this.input.on("pointermove", p => {
      if (!this.joyActive) return;

      const dx = p.x - this.joyStart.x;
      const dy = p.y - this.joyStart.y;
      const dist = Math.min(40, Math.hypot(dx, dy));
      const angle = Math.atan2(dy, dx);

      this.joyVector.set(Math.cos(angle), Math.sin(angle));

      this.joyThumb.setPosition(
        this.joyStart.x + Math.cos(angle) * dist,
        this.joyStart.y + Math.sin(angle) * dist
      );
    });

    this.input.on("pointerup", () => {
      this.joyActive = false;
      this.joyVector.set(0, 0);
      this.joyThumb.setPosition(this.joyBase.x, this.joyBase.y);
    });
  }

  /* ======================
     TUTORIAL
  ====================== */
  showTutorial() {
    const { width, height } = this.scale;

    const bg = this.add.rectangle(
      width / 2,
      height / 2,
      width - 40,
      180,
      0x000000,
      0.75
    ).setDepth(3000);

    const text = this.add.text(
      width / 2,
      height / 2,
      "Use joystick to move\nCollect all yellow squares\nFinish before time runs out",
      {
        color: "#ffffff",
        align: "center",
        fontSize: "16px"
      }
    ).setOrigin(0.5).setDepth(3001);

    this.input.once("pointerdown", () => {
      bg.destroy();
      text.destroy();
    });
  }
}
