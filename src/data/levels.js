export const LEVELS = [
  {
    player: { x: 40, y: 40 },
    pellets: [
      { x: 120, y: 80 },
      { x: 200, y: 200 }
    ],
    walls: [
      { x: 160, y: 120, w: 240, h: 20 }
    ],
    goal: { x: 420, y: 580 }
  },

  // LEVEL 2
  {
    player: { x: 40, y: 600 },
    pellets: [
      { x: 200, y: 300 },
      { x: 350, y: 150 }
    ],
    walls: [
      { x: 240, y: 200, w: 20, h: 300 },
      { x: 120, y: 400, w: 200, h: 20 }
    ],
    goal: { x: 420, y: 40 }
  },

  // copy sampai 10 level (struktur sama)
];
