export default class VirtualJoystick {
  constructor(scene) {
    this.forceX = 0;
    this.forceY = 0;

    // === POSISI: TENGAH & NAIK KE ATAS ===
    const cx = scene.scale.width / 2;
    const cy = scene.scale.height - 140;

    this.base = scene.add.circle(cx, cy, 36, 0x444444, 0.4);
    this.stick = scene.add.circle(cx, cy, 18, 0xffffff, 0.8);

    this.base.setScrollFactor(0);
    this.stick.setScrollFactor(0);

    // === AUTO HIDE ===
    this.base.setVisible(false);
    this.stick.setVisible(false);

    scene.input.on("pointerdown", p => {
      // Muncul saat disentuh
      this.base.setPosition(p.x, p.y);
      this.stick.setPosition(p.x, p.y);

      this.base.setVisible(true);
      this.stick.setVisible(true);
    });

    scene.input.on("pointermove", p => {
      if (!p.isDown) return;

      const dx = p.x - this.base.x;
      const dy = p.y - this.base.y;
      const dist = Math.min(36, Math.hypot(dx, dy));
      const angle = Math.atan2(dy, dx);

      this.stick.x = this.base.x + Math.cos(angle) * dist;
      this.stick.y = this.base.y + Math.sin(angle) * dist;

      this.forceX = Math.cos(angle);
      this.forceY = Math.sin(angle);
    });

    scene.input.on("pointerup", () => {
      // Reset & hide
      this.stick.x = this.base.x;
      this.stick.y = this.base.y;

      this.forceX = 0;
      this.forceY = 0;

      this.base.setVisible(false);
      this.stick.setVisible(false);
    });
  }
}
