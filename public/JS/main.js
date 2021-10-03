import * as THREE from "../../libs/three/three.module.js";
import { LoadingBar } from "../../libs/LoadingBar.js";
import { Communication } from "./funcPool/communication.js";
import { VRButton } from "../../libs/three/jsm/VRButton.js";
import { GLTFLoader } from "../../libs/three/jsm/GLTFLoader.js";
import { Lobby } from "../JS/funcPool/lobby.js";
import { Controller } from "./funcPool/controller.js";
import { Game } from "./funcPool/game.js";

class Main {
  constructor() {
    this.mainIdenfifier = "mainScreen";
    this.initThreeJsBasicSetup();
    this.initAdvancedSetup();
    this.setupVRButton();
    this.controller = new Controller(this);
    this.lobby = new Lobby(this);
  }

  //----------------------------------------------------------------
  //Init Functions

  initThreeJsBasicSetup() {
    const container = document.createElement("div");
    document.body.appendChild(container);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );

    this.camera.position.set(0, 0, 0);
    this.camera.name = "NeueCam";

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xc9e9f6);

    const ambient = new THREE.HemisphereLight(0xc9e9f6, 0xbbbbff, 0.5);
    this.addObjectToScene(ambient, this.mainIdenfifier);

    const light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.set(0, 100, 50);
    this.addObjectToScene(light, this.mainIdenfifier);

    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(this.renderer.domElement);

    window.addEventListener("resize", this.resize.bind(this));
  }

  initAdvancedSetup() {
    this.loadingBar = new LoadingBar();
  }

  //----------------------------------------------------------------
  //Generell Functions

  addObjectToScene(newObject, name = "") {
    newObject.name = name;
    this.scene.add(newObject);
  }

  setObjectWithName_Invisible(name) {
    for (var i = this.scene.children.length - 1; i >= 0; i--) {
      if (this.scene.children[i].name == name) {
        this.scene.children[i].visible = false;
      }
    }
  }

  setObjectWithName_Visible(name) {
    for (var i = this.scene.children.length - 1; i >= 0; i--) {
      if (this.scene.children[i].name == name) {
        this.scene.children[i].visible = true;
      }
    }
  }

  setupVRButton() {
    this.renderer.xr.enabled = true;
    document.body.appendChild(VRButton.createButton(this.renderer));
    this.renderer.setAnimationLoop(this.render.bind(this));
  }

  joinGame(callback) {
    this.lobby.setLobbyInactive();
    this.game = new Game(this);
    if (typeof callback == "function") callback();
  }

  //----------------------------------------------------------------
  //Managing Functions

  manageLobbyUI() {
    if (this.lobby.uiInstance != null) {
      if (this.communication == null) {
        this.communication = new Communication(this);
      }
      this.lobby.uiInstance.set_UI_Visible(true);
      this.lobby.uiInstance.uiLobbyScreen.update();
    }
  }

  manageControllers() {
    if (this.controller.controllers[0]) {
      const self = this;
      this.controller.controllers.forEach((controller) => {
        self.controller.handleController(controller);
      });
    }
  }

  manageGameUI() {
    if (this.game) {
      this.game.getControllerValuesPrinted();
    }
  }

  manageGame() {
    if (this.game) {
      this.game.updateGamePos();
    }
  }

  //----------------------------------------------------------------
  //Asset Loading Functions

  //TODO: REFACTOR (Var Input) - own class for Objects
  loadGLTF(nameOfFile, pos = [3], scale = [3], scriptID) {
    const loader = new GLTFLoader().setPath("../Assets/");
    const self = this;
    this.loadingBar.visible = true;

    loader.load(
      nameOfFile,
      // called when the resource is loaded
      function (gltf) {
        self.model = gltf.scene;
        self.model.position.set(pos[0], pos[1], pos[2]);
        self.model.scale.set(scale[0], scale[1], scale[2]);
        self.addObjectToScene(self.model, scriptID);

        self.loadingBar.visible = false;

        self.renderer.setAnimationLoop(self.render.bind(self));
      },
      // called while loading is progressing
      function (xhr) {
        self.loadingBar.progress = xhr.loaded / xhr.total;
      },
      // called when loading has errors
      function (error) {
        console.log("LoadGLTF Function: " + error);
      }
    );
  }

  //----------------------------------------------------------------
  //Resize & Render Functions
  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  exportRenderFunc() {
    this.renderer.setAnimationLoop(this.render.bind(this));
  }

  render() {
    if (this.renderer.xr.isPresenting) {
      this.manageLobbyUI();
      this.manageControllers();
      // this.manageGameUI();
      this.manageGame();
    }
    this.renderer.render(this.scene, this.camera);
  }
}

export { Main };
