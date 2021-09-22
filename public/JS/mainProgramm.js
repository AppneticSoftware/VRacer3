import * as THREE from "../libThree/three.module.js";
export * as THREE from "../libThree/three.module.js";

import { startGame } from "./funcPool/game.js";
import { startCommunication } from "./funcPool/communication.js";

window.onload = function () {
  startGame();
  startCommunication();
};
