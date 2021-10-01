import * as THREE from "../../libs/three/three.module.js";
import { VRButton } from "../../libs/VRButton.js";
import { CanvasUI } from "../../libs/CanvasUI.js";
import { XRControllerModelFactory } from "../../libs/three/jsm/XRControllerModelFactory.js";
import { BoxLineGeometry } from "../../libs/three/jsm/BoxLineGeometry.js";
import { Stats } from "../../libs/stats.module.js";
import { OrbitControls } from "../../libs/three/jsm/OrbitControls.js";
import {
  Constants as MotionControllerConstants,
  fetchProfile,
  MotionController,
} from "../../libs/three/jsm/motion-controllers.module.js";

//TESTFILES FROM NIK LEVER

const DEFAULT_PROFILES_PATH =
  "https://cdn.jsdelivr.net/npm/@webxr-input-profiles/assets@1.0/dist/profiles";
const DEFAULT_PROFILE = "generic-trigger";

class App {
  constructor() {
    const container = document.createElement("div");
    document.body.appendChild(container);

    this.clock = new THREE.Clock();

    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.position.set(0, 1.6, 3);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x505050);

    this.scene.add(new THREE.HemisphereLight(0x606060, 0x404040));

    const light = new THREE.DirectionalLight(0xffffff);
    light.position.set(1, 1, 1).normalize();
    this.scene.add(light);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 1.6, 0);
    this.controls.update();

    this.stats = new Stats();
    document.body.appendChild(this.stats.dom);

    this.raycaster = new THREE.Raycaster();
    this.workingMatrix = new THREE.Matrix4();
    this.workingVector = new THREE.Vector3();

    this.ui = this.createUI();
    this.setupXR();

    window.addEventListener("resize", this.resize.bind(this));

    this.renderer.setAnimationLoop(this.render.bind(this));
  }

  createUI() {
    const config = {
      panelSize: { height: 0.5 },
      height: 256,
      body: { type: "text" },
    };
    const ui = new CanvasUI({ body: "" }, config);
    ui.mesh.position.set(0, 1.5, -1);
    this.scene.add(ui.mesh);
    return ui;
  }

  updateUI() {
    const str = JSON.stringify(this.buttonStates);
    if (this.strStates === undefined || str != this.strStates) {
      this.ui.updateElement("body", str);
      this.ui.update();
      this.strStates = str;
    }
  }

  createButtonStates(components) {
    const buttonStates = {};
    this.gamepadIndices = components;

    Object.keys(components).forEach((key) => {
      if (key.indexOf("touchpad") != -1 || key.indexOf("thumbstick") != -1) {
        buttonStates[key] = { button: 0, xAxis: 0, yAxis: 0 };
      } else {
        buttonStates[key] = 0;
      }
    });

    // was ich nachher exportieren muss
    this.buttonStates = buttonStates;
  }

  updateGamepadState() {
    const session = this.renderer.xr.getSession();

    const inputSource = session.inputSources[0];

    if (
      inputSource &&
      inputSource.gamepad &&
      this.gamepadIndices &&
      this.ui &&
      this.buttonStates
    ) {
      const gamepad = inputSource.gamepad;
      try {
        Object.entries(this.buttonStates).forEach(([key, value]) => {
          const buttonIndex = this.gamepadIndices[key].button;
          if (
            key.indexOf("touchpad") != -1 ||
            key.indexOf("thumbstick") != -1
          ) {
            const xAxisIndex = this.gamepadIndices[key].xAxis;
            const yAxisIndex = this.gamepadIndices[key].yAxis;
            this.buttonStates[key].button = gamepad.buttons[buttonIndex].value;
            this.buttonStates[key].xAxis = gamepad.axes[xAxisIndex].toFixed(2);
            this.buttonStates[key].yAxis = gamepad.axes[yAxisIndex].toFixed(2);
          } else {
            this.buttonStates[key] = gamepad.buttons[buttonIndex].value;
          }

          this.updateUI();
        });
      } catch (e) {
        console.warn("An error occurred setting the ui");
      }
    }
  }

  setupXR() {
    this.renderer.xr.enabled = true;

    const button = new VRButton(this.renderer);

    const self = this;

    function onConnected(event) {
      const info = {};

      fetchProfile(event.data, DEFAULT_PROFILES_PATH, DEFAULT_PROFILE).then(
        ({ profile, assetPath }) => {
          console.log(JSON.stringify(profile));

          info.name = profile.profileId;
          info.targetRayMode = event.data.targetRayMode;

          Object.entries(profile.layouts).forEach(([key, layout]) => {
            const components = {};
            Object.values(layout.components).forEach((component) => {
              components[component.rootNodeName] = component.gamepadIndices;
            });
            info[key] = components;
          });

          self.createButtonStates(info.right);

          console.log(JSON.stringify(info));

          self.updateControllers(info);
        }
      );
    }

    const controller = this.renderer.xr.getController(0);

    controller.addEventListener("connected", onConnected);

    const modelFactory = new XRControllerModelFactory();

    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -1),
    ]);

    const line = new THREE.Line(geometry);
    line.scale.z = 0;

    this.controllers = {};
    this.controllers.right = this.buildController(0, line, modelFactory);
    this.controllers.left = this.buildController(1, line, modelFactory);
  }

  buildController(index, line, modelFactory) {
    const controller = this.renderer.xr.getController(index);

    controller.userData.selectPressed = false;
    controller.userData.index = index;

    if (line) controller.add(line.clone());

    this.scene.add(controller);

    let grip;

    if (modelFactory) {
      grip = this.renderer.xr.getControllerGrip(index);
      grip.add(modelFactory.createControllerModel(grip));
      this.scene.add(grip);
    }

    return { controller, grip };
  }

  updateControllers(info) {
    const self = this;

    function onDisconnected() {
      const index = this.userData.index;
      console.log(`Disconnected controller ${index}`);

      if (self.controllers) {
        const obj = index == 0 ? self.controllers.right : self.controllers.left;

        if (obj) {
          if (obj.controller) {
            const controller = obj.controller;
            while (controller.children.length > 0)
              controller.remove(controller.children[0]);
            self.scene.remove(controller);
          }
          if (obj.grip) self.scene.remove(obj.grip);
        }
      }
    }

    if (info.right !== undefined) {
      const right = this.renderer.xr.getController(0);

      let trigger = false,
        squeeze = false;

      Object.keys(info.right).forEach((key) => {
        if (key.indexOf("trigger") != -1) trigger = true;
        if (key.indexOf("squeeze") != -1) squeeze = true;
      });

      right.addEventListener("disconnected", onDisconnected);
    }

    if (info.left !== undefined) {
      const left = this.renderer.xr.getController(1);

      let trigger = false,
        squeeze = false;

      Object.keys(info.left).forEach((key) => {
        if (key.indexOf("trigger") != -1) trigger = true;
        if (key.indexOf("squeeze") != -1) squeeze = true;
      });

      left.addEventListener("disconnected", onDisconnected);
    }
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render() {
    const dt = this.clock.getDelta();

    if (this.renderer.xr.isPresenting) {
      if (this.elapsedTime === undefined) this.elapsedTime = 0;
      this.elapsedTime += dt;
      if (this.elapsedTime > 0.3) {
        this.updateGamepadState();
        this.elapsedTime = 0;
      }
    } else {
      this.stats.update();
    }
    this.renderer.render(this.scene, this.camera);
  }
}

export { App };
