export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
  }

  // 🔑 TERIMA DATA DARI MENU
  init(data) {
    this.level = data.level ?? 1;
    this.score = data.score ?? 0;
    this.maxLevel = 3;
  }

  create() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.loadLevel(this.level);
  }

  clearLevel() {
    this.children.removeAll();
    this.physics.world.colliders.destroy();
  }

  loadLevel(level) {
    this.clearLevel();

    this.collects = this.physics.add.group();
    this.walls = this.physics.add.staticGroup();

    // PLAYER
    this.player = this.add.rectangle(40, 40, 28, 28, 0x3498db);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);

    if (level === 1) {
      this.createCollects([
        { x: 120, y: 200 },
        { x: 300, y: 400 }
      ]);
      this.createGoal(420, 580);
    }

    if (level === 2) {
      this.createCollects([
        { x: 80, y: 300 },
        { x: 240, y: 200 },
        { x: 380, y: 450 }
      ]);

      this.createRedWalls([
        { x: 240, y: 320, w: 320, h: 20 }
      ]);

      this.createGoal(420, 60);
    }

    if (level === 3) {
      this.createCollects([
        { x: 60, y: 580 },
        { x: 420, y: 100 }
      ]);

      this.createRedWalls([
        { x: 240, y: 80, w: 400, h: 20 },
        { x: 240, y: 560, w: 400, h: 20 },
        { x: 120, y: 320, w: 20, h: 400 },
        { x: 360, y: 320, w: 20, h: 400 }
      ]);

      this.createGoal(240, 320);
    }

    this.physics.add.collider(this.player, this.walls);

    this.physics.add.overlap(this.player, this.collects, (_, c) => {
      c.destroy();
    });

    this.physics.add.overlap(this.player, this.goal, () => {
      if (this.collects.countActive(true) === 0) {
        this.nextLevel();
      }
    });
  }

  nextLevel() {
    this.level++;

    if (this.level > this.maxLevel) {
      this.scene.start("GameOverScene", {
        score: this.score
      });
    } else {
      this.loadLevel(this.level);
    }
  }

  createCollects(list) {
    list.forEach(p => {
      const c = this.add.rectangle(p.x, p.y, 20, 20, 0xf1c40f);
      this.physics.add.existing(c);
      this.collects.add(c);
    });
  }

  createGoal(x, y) {
    this.goal = this.add.rectangle(x, y, 26, 26, 0x2ecc71);
    this.physics.add.existing(this.goal, true);
  }

  createRedWalls(list) {
    list.forEach(w => {
      const wall = this.add.rectangle(w.x, w.y, w.w, w.h, 0xe74c3c);
      this.physics.add.existing(wall, true);
      this.walls.add(wall);
    });
  }

  update() {
    const speed = 200;
    const body = this.player.body;

    body.setVelocity(0);

    if (this.cursors.left.isDown) body.setVelocityX(-speed);
    if (this.cursors.right.isDown) body.setVelocityX(speed);
    if (this.cursors.up.isDown) body.setVelocityY(-speed);
    if (this.cursors.down.isDown) body.setVelocityY(speed);
  }
}
