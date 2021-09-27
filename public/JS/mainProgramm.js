// import * as THREE from "../libThree/three.module.js";
// export * as THREE from "../libThree/three.module.js";

// import { Game } from "./funcPool/gameConstructor.js";
import { StartScreen } from "./funcPool/startScreen.js";

window.onload = function () {
  const startScreen = new StartScreen();
  startScreen.setupVRButton();
  startScreen.setupCameraAndUI();
  // startScreen.loadGLTF("Stadium.glb");
  window.app = startScreen;
  // startCommunication();
};
