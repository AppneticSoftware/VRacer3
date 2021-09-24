// import * as THREE from "../libThree/three.module.js";
// export * as THREE from "../libThree/three.module.js";

import { Game } from "./funcPool/game.js";
import { startCommunication } from "./funcPool/communication.js";

window.onload = function () {
  const game = new Game();
  game.setupVRButton();
  window.app = game;
  // startCommunication();
};
