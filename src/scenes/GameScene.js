export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.level = 1;
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
        this.player = this.add.rectangle(50, 50, 28, 28, 0x3498db);
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);

        if (level === 1) {
            this.createCollects([
                { x: 150, y: 100 },
                { x: 300, y: 200 }
            ]);
            this.createGoal(450, 300);
        }

        if (level === 2) {
            this.createCollects([
                { x: 100, y: 100 },
                { x: 250, y: 150 },
                { x: 400, y: 200 }
            ]);

            this.createRedWalls([
                { x: 250, y: 180, w: 300, h: 20 }
            ]);

            this.createGoal(450, 50);
        }

        if (level === 3) {
            this.createCollects([
                { x: 60, y: 350 },
                { x: 450, y: 80 }
            ]);

            this.createRedWalls([
                { x: 200, y: 50, w: 350, h: 20 },
                { x: 200, y: 350, w: 350, h: 20 },
                { x: 100, y: 200, w: 20, h: 300 },
                { x: 300, y: 200, w: 20, h: 300 }
            ]);

            this.createGoal(470, 370);
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
            alert('🎉 GAME SELESAI');
            this.level = 1;
        }
        this.loadLevel(this.level);
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
