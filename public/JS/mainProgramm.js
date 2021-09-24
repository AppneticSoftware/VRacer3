// import * as THREE from "../libThree/three.module.js";
// export * as THREE from "../libThree/three.module.js";

import { Game } from "./funcPool/game.js";
import { StartScreen } from "./funcPool/startScreen.js";
import { startCommunication } from "./funcPool/communication.js";

window.onload = function () {
  const startScreen = new StartScreen();
  startScreen.setupVRButton(function enteredVR() {
    startScreen.setupCameraAndUI();
  });
  startScreen.loadGLTF("Stadium.glb");
  window.app = startScreen;
  // startCommunication();
};
