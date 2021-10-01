// import * as THREE from "../libThree/three.module.js";
// export * as THREE from "../libThree/three.module.js";

// import { Game } from "./funcPool/gameConstructor.js";
import { StartScreen } from "./funcPool/startScreen.js";
import { App } from "./funcPool/steering.js";

window.onload = function () {
  // const startScreen = new StartScreen();
  const startScreen = new App();

  // startScreen.setupVRButton();
  // startScreen.setupCameraAndUI();
  // startScreen.loadGLTF("Stadium.glb");
  // startScreen.startSocketCommunication();
  window.app = startScreen;
  // startCommunication();
};
