export default class VirtualJoystick {
  constructor(scene) {
    this.scene = scene;
    this.forceX = 0;
    this.forceY = 0;

    const base = scene.add.circle(80, 560, 40, 0x444444, 0.5);
    const stick = scene.add.circle(80, 560, 20, 0xffffff, 0.8);

    base.setScrollFactor(0);
    stick.setScrollFactor(0);

    base.setInteractive();
    scene.input.on("pointermove", p => {
      if (!p.isDown) return;

      const dx = p.x - base.x;
      const dy = p.y - base.y;
      const dist = Math.min(40, Math.hypot(dx, dy));

      const angle = Math.atan2(dy, dx);
      stick.x = base.x + Math.cos(angle) * dist;
      stick.y = base.y + Math.sin(angle) * dist;

      this.forceX = Math.cos(angle);
      this.forceY = Math.sin(angle);
    });

    scene.input.on("pointerup", () => {
      stick.x = base.x;
      stick.y = base.y;
      this.forceX = 0;
      this.forceY = 0;
    });
  }
}
