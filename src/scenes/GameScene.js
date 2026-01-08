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
       STATE
    ====================== */
    this.levelCleared = false;

    /* ======================
       DIFFICULTY CURVE
    ====================== */
    this.tileSize = 48;
    this.cols = Math.min(9 + this.level * 2, 21);
    this.rows = Math.min(9 + this.level * 2, 21);
    this.targetCount = Math.min(2 + this.level, 10);
    this.timeLeft = Math.max(20, 70 - this.level * 3);

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
     PERFECT MAZE (DFS)
     0 = PATH, 1 = WALL
  ====================== */
 generateMaze() {
  this.grid = Array.from({ length: this.rows }, () =>
    Array(this.cols).fill(1)
  );

  /* ======================
     STEP 1: PERFECT MAZE (DFS)
  ====================== */
  const carve = (x, y) => {
    this.grid[y][x] = 0;

    const dirs = Phaser.Utils.Array.Shuffle([
      [2, 0], [-2, 0], [0, 2], [0, -2]
    ]);

    for (const [dx, dy] of dirs) {
      const nx = x + dx;
      const ny = y + dy;

      if (
        nx > 0 && ny > 0 &&
        nx < this.cols - 1 &&
        ny < this.rows - 1 &&
        this.grid[ny][nx] === 1
      ) {
        this.grid[y + dy / 2][x + dx / 2] = 0;
        carve(nx, ny);
      }
    }
  };

  carve(1, 1);

  /* ======================
     STEP 2: REMOVE SOME DEAD ENDS (BRAID)
  ====================== */
  const isDeadEnd = (x, y) => {
    if (this.grid[y][x] !== 0) return false;
    let exits = 0;
    if (this.grid[y - 1]?.[x] === 0) exits++;
    if (this.grid[y + 1]?.[x] === 0) exits++;
    if (this.grid[y]?.[x - 1] === 0) exits++;
    if (this.grid[y]?.[x + 1] === 0) exits++;
    return exits === 1;
  };

  for (let y = 1; y < this.rows - 1; y++) {
    for (let x = 1; x < this.cols - 1; x++) {
      if (isDeadEnd(x, y) && Math.random() < 0.6) {
        const neighbors = Phaser.Utils.Array.Shuffle([
          [0, -1], [0, 1], [-1, 0], [1, 0]
        ]);

        for (const [dx, dy] of neighbors) {
          const nx = x + dx;
          const ny = y + dy;
          if (this.grid[ny][nx] === 1) {
            this.grid[ny][nx] = 0;
            break;
          }
        }
      }
    }
  }

  this.drawMaze();
}


  drawMaze() {
    const t = this.tileSize;

    this.walls = this.physics.add.staticGroup();
    this.targets = this.physics.add.group();

    /* WALLS */
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.grid[y][x] === 1) {
          const wall = this.add.rectangle(
            x * t + t / 2,
            y * t + t / 2,
            t,
            t,
            0x111111
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

    /* GOAL TILE */
    this.goalActive = false;
    this.goal = this.add.rectangle(
      (this.cols - 2) * t + t / 2,
      (this.rows - 2) * t + t / 2,
      t * 0.7,
      t * 0.7,
      0x00ff88
    );
    this.physics.add.existing(this.goal);
    this.goal.body.setImmovable(true);
    this.goal.setAlpha(0.3);

    /* TARGETS */
    this.targetsLeft = this.targetCount;
    for (let i = 0; i < this.targetCount; i++) {
      this.spawnTarget();
    }

    /* COLLISIONS */
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.overlap(this.player, this.targets, this.collectTarget, null, this);
    this.physics.add.overlap(this.player, this.goal, this.reachGoal, null, this);
  }

  spawnTarget() {
    let x, y;
    do {
      x = Phaser.Math.Between(1, this.cols - 2);
      y = Phaser.Math.Between(1, this.rows - 2);
    } while (this.grid[y][x] !== 0);

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
      fontSize: "14px",
      color: "#ffffff"
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
     GAME LOGIC
  ====================== */
  collectTarget(player, target) {
    if (this.levelCleared) return;

    target.destroy();
    this.targetsLeft--;
    this.score += 10;
    this.updateUI();

    if (this.targetsLeft <= 0) {
      this.goalActive = true;
      this.goal.setAlpha(1);

      this.tweens.add({
        targets: this.goal,
        scale: 1.2,
        yoyo: true,
        duration: 300
      });
    }
  }

  reachGoal() {
    if (!this.goalActive || this.levelCleared) return;

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

  /* ======================
     CONTROLS
  ====================== */
  createControls() {
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    const speed = 150;
    const body = this.player.body;
    body.setVelocity(0);

    if (this.cursors.left.isDown) body.setVelocityX(-speed);
    if (this.cursors.right.isDown) body.setVelocityX(speed);
    if (this.cursors.up.isDown) body.setVelocityY(-speed);
    if (this.cursors.down.isDown) body.setVelocityY(speed);

    if (this.joyActive) {
      body.setVelocity(
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
      const dist = Math.min(40, Math.hypot(dx, dy));
      const angle = Math.atan2(dy, dx);

      this.joyVector.set(Math.cos(angle), Math.sin(angle));
      this.joyThumb.setPosition(
        this.start.x + Math.cos(angle) * dist,
        this.start.y + Math.sin(angle) * dist
      );
    });

    this.input.on("pointerup", () => {
      this.joyActive = false;
      this.joyVector.set(0, 0);
    });
  }
}
