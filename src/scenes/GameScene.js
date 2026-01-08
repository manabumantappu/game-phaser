export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  init(data) {
    this.level = data.level ?? 1;
    this.score = data.score ?? 0;
  }

  create() {
    /* ======================
       LEVEL STATE
    ====================== */
    this.levelCleared = false;

    /* ======================
       DIFFICULTY CURVE
    ====================== */
    this.tileSize = 48;
    this.cols = Math.min(9 + this.level * 2, 21);
    this.rows = Math.min(9 + this.level * 2, 21);

    this.targetCount = Math.min(2 + this.level, 12);
    this.timeLeft = Math.max(15, 70 - this.level * 3);

    /* ======================
       MAZE
    ====================== */
    this.generateMaze();
    this.createUI();
    this.createControls();
    this.createTimer();
    this.createJoystick();
  }

  /* ======================
     MAZE GENERATOR (DFS)
  ====================== */
  generateMaze() {
    const cols = this.cols;
    const rows = this.rows;

    this.grid = Array.from({ length: rows }, () =>
      Array(cols).fill(0)
    );

    const carve = (x, y) => {
      this.grid[y][x] = 1;
      const dirs = Phaser.Utils.Array.Shuffle([
        [1, 0], [-1, 0], [0, 1], [0, -1]
      ]);

      for (const [dx, dy] of dirs) {
        const nx = x + dx * 2;
        const ny = y + dy * 2;
        if (
          nx > 0 && ny > 0 &&
          nx < cols - 1 && ny < rows - 1 &&
          this.grid[ny][nx] === 0
        ) {
          this.grid[y + dy][x + dx] = 1;
          carve(nx, ny);
        }
      }
    };

    carve(1, 1);
    this.drawMaze();
  }

  drawMaze() {
    const t = this.tileSize;

    this.walls = this.physics.add.staticGroup();
    this.targets = this.physics.add.group();

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.grid[y][x] === 0) {
          const wall = this.add.rectangle(
            x * t + t / 2,
            y * t + t / 2,
            t,
            t,
            0x992222
          );
          this.walls.add(wall);
        }
      }
    }

    /* PLAYER */
    this.player = this.add.rectangle(
      t * 1.5,
      t * 1.5,
      t * 0.6,
      t * 0.6,
      0x00aaff
    );
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);

    /* TARGETS */
    this.targetsLeft = this.targetCount;
    for (let i = 0; i < this.targetCount; i++) {
      this.spawnTarget();
    }

    this.physics.add.collider(this.player, this.walls);
    this.physics.add.overlap(
      this.player,
      this.targets,
      this.collectTarget,
      null,
      this
    );
  }

  spawnTarget() {
    let x, y;
    do {
      x = Phaser.Math.Between(1, this.cols - 2);
      y = Phaser.Math.Between(1, this.rows - 2);
    } while (this.grid[y][x] === 0);

    const t = this.tileSize;
    const target = this.add.rectangle(
      x * t + t / 2,
      y * t + t / 2,
      t * 0.5,
      t * 0.5,
      0xffcc00
    );
    this.physics.add.existing(target);
    this.targets.add(target);
  }

  /* ======================
     UI & TIMER
  ====================== */
  createUI() {
    this.uiText = this.add.text(10, 10, "", {
      color: "#ffffff",
      fontSize: "14px"
    });
    this.updateUI();
  }

  updateUI() {
    this.uiText.setText(
      `Level: ${this.level}\nScore: ${this.score}\nTargets: ${this.targetsLeft}\nTime: ${this.timeLeft}`
    );
  }

  createTimer() {
    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (this.levelCleared) return;
        this.timeLeft--;
        this.updateUI();
        if (this.timeLeft <= 0) {
          this.scene.start("GameOverScene", { score: this.score });
        }
      }
    });
  }

  /* ======================
     GAME LOGIC (FIXED)
  ====================== */
  collectTarget(player, target) {
    if (this.levelCleared) return;

    target.destroy();
    this.targetsLeft--;
    this.score += 10;

    this.updateUI();

    if (this.targetsLeft <= 0) {
      this.levelCleared = true;

      const unlocked = Math.max(
        this.level + 1,
        parseInt(localStorage.getItem("unlockedLevel") || "1")
      );
      localStorage.setItem("unlockedLevel", unlocked);

      this.time.delayedCall(400, () => {
        this.scene.restart({
          level: this.level + 1,
          score: this.score
        });
      });
    }
  }

  /* ======================
     CONTROLS
  ====================== */
  createControls() {
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    const speed = 150;
    const b = this.player.body;
    b.setVelocity(0);

    if (this.cursors.left.isDown) b.setVelocityX(-speed);
    if (this.cursors.right.isDown) b.setVelocityX(speed);
    if (this.cursors.up.isDown) b.setVelocityY(-speed);
    if (this.cursors.down.isDown) b.setVelocityY(speed);

    if (this.joyActive) {
      b.setVelocity(
        this.joyVector.x * speed,
        this.joyVector.y * speed
      );
    }
  }

  /* ======================
     MOBILE JOYSTICK
  ====================== */
  createJoystick() {
    this.joyActive = false;
    this.joyVector = new Phaser.Math.Vector2();

    const h = this.scale.height;
    this.joyBase = this.add.circle(90, h - 110, 40, 0xffffff, 0.25);
    this.joyThumb = this.add.circle(90, h - 110, 20, 0xffffff, 0.6);

    this.input.on("pointerdown", p => {
      this.joyActive = true;
      this.start = new Phaser.Math.Vector2(p.x, p.y);
      this.joyBase.setPosition(p.x, p.y);
      this.joyThumb.setPosition(p.x, p.y);
    });

    this.input.on("pointermove", p => {
      if (!this.joyActive) return;
      const dx = p.x - this.start.x;
      const dy = p.y - this.start.y;
      const len = Math.min(40, Math.hypot(dx, dy));
      const a = Math.atan2(dy, dx);
      this.joyVector.set(Math.cos(a), Math.sin(a));
      this.joyThumb.setPosition(
        this.start.x + Math.cos(a) * len,
        this.start.y + Math.sin(a) * len
      );
    });

    this.input.on("pointerup", () => {
      this.joyActive = false;
      this.joyVector.set(0, 0);
    });
  }
}
