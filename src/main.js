import BootScene from "./scenes/BootScene.js";
import MenuScene from "./scenes/MenuScene.js";
import GameScene from "./scenes/GameScene.js";

const config = {
  type: Phaser.AUTO,
  width: 480,
  height: 800,
  backgroundColor: "#000000",

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },

  physics: {
    default: "arcade",
    arcade: {
      debug: false
    }
  },

  input: {
    activePointers: 3
  },

  scene: [
    BootScene,
    MenuScene,
    GameScene
  ]
};

new Phaser.Game(config);
