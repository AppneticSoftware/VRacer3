import * as THREE from "../../libs/three/three.module.js";
import { UI } from "./ui.js";

class Lobby {
  constructor(main) {
    this.lobbyIdentifier = "lobbyScreen";
    this.main = main;
    this.lobbyActive = true;

    this.setupCamera();
    this.setupStadiumAsset();
    this.setupUI();
    this.setupControllers();
  }

  //----------------------------------------------------------------
  //Setup Functions

  setupCamera() {
    this.dolly = new THREE.Object3D();
    this.dolly.position.set(0, 65, 0);
    this.dolly.rotation.x = -(30 * Math.PI) / 180;
    this.addCameraToDolly();
    this.main.addObjectToScene(this.dolly, this.lobbyIdentifier);
    this.main.exportRenderFunc();
  }

  setupStadiumAsset() {
    this.main.loadGLTF(
      "Stadium.glb",
      [-181.5, 0, 130],
      [1, 1, 1],
      this.lobbyIdentifier
    );
  }

  setupUI() {
    this.uiInstance = new UI(this);
    this.uiInstance.setupLobbyUI();
    this.main.addObjectToScene(
      this.uiInstance.uiLobbyScreen.mesh,
      this.lobbyIdentifier
    );
  }

  setupControllers() {
    this.controllers = this.main.controller.controllers;
    this.controllersGrid = this.main.controller.controllersGrid;
    this.addControllerToDolly();
  }
  //----------------------------------------------------------------
  //Generell Functions

  setLobbyInactive() {
    this.main.setObjectWithName_Invisible(this.lobbyIdentifier);
    this.removeCameraFromDolly();
    this.removeControllerFromDolly();
    this.lobbyActive = false;
  }

  addCameraToDolly() {
    this.dolly.add(this.main.camera);
  }

  removeCameraFromDolly() {
    this.dolly.remove(this.main.camera);
  }

  addControllerToDolly() {
    for (let index = 0; index < this.controllers.length; index++) {
      this.dolly.add(this.controllers[index]);
      this.dolly.add(this.controllersGrid[index]);
    }
  }

  removeControllerFromDolly() {
    for (let index = 0; index < this.controllers.length; index++) {
      this.dolly.remove(this.controllers[index]);
      this.dolly.remove(this.controllersGrid[index]);
    }
  }

  //----------------------------------------------------------------
}

export { Lobby };
