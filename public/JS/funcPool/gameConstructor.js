import * as THREE from "../../libs/three/three.module.js";
import { GLTFLoader } from "../../libs/three/jsm/GLTFLoader.js";
import { OrbitControls } from "../../libs/three/jsm/OrbitControls.js";
import { LoadingBar } from "../../libs/LoadingBar.js";

class GameConstructor {
  constructor(startScreen) {
    this.gameConstructorIdentifier = "gameConstructor";
    startScreen.loadGLTF(
      "Car.glb",
      [0, 0, -5],
      [5, 5, 5],
      this.gameConstructorIdentifier
    );

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );

    this.camera.position.set(0, 1, 10);
    startScreen.addObjectToScene(this.camera, this.gameConstructorIdentifier);
    const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 0.5);
    startScreen.addObjectToScene(ambient, this.gameConstructorIdentifier);

    const light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.set(0.2, 1, 1);
    startScreen.addObjectToScene(light, this.gameConstructorIdentifier);
    startScreen.testOrbisControlls();
  }
}

export { GameConstructor };
