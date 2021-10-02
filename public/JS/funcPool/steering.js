import * as THREE from "../../libs/three/three.module.js";
import { XRControllerModelFactory } from "../../libs/three/jsm/XRControllerModelFactory.js";
import {
  Constants as MotionControllerConstants,
  fetchProfile,
  MotionController,
} from "../../libs/three/jsm/motion-controllers.module.js";
import { CanvasUI } from "../../libs/CanvasUI.js";

//TESTFILES FROM NIK LEVER

const DEFAULT_PROFILES_PATH =
  "https://cdn.jsdelivr.net/npm/@webxr-input-profiles/assets@1.0/dist/profiles";
const DEFAULT_PROFILE = "generic-trigger";

class GameController {
  constructor(startScreen) {
    this.gameControllerIdentifier = "gameController";
    this.startScreen = startScreen;
    // this.raycaster = new THREE.Raycaster();
    // this.workingMatrix = new THREE.Matrix4();
    // this.workingVector = new THREE.Vector3();

    this.setupXR();
    this.createUI();
  }

  createUI() {
    console.log("UI CREATE");
    const config = {
      //   panelSize: { height: 0.5 },
      height: 512,
      body: { type: "text", textAlign: "center" },
    };
    const ui = new CanvasUI({ body: "HELLO EXAMPLE" }, config);
    ui.mesh.position.set(-40.8, 14.5, -297);
    ui.mesh.rotation.y = -(180 * Math.PI) / 180;
    // ui.mesh.position.set(0, 0, 0);
    this.startScreen.addObjectToScene(ui.mesh, this.gameControllerIdentifier);
    this.ui = ui;
  }

  updateControllerOutputValues() {
    console.log("Init Update UI ");

    const str = JSON.stringify(this.buttonStates);
    console.log(str);
    console.log(this.buttonStates);
    if (this.strStates === undefined || str != this.strStates) {
      console.log(" Update UI ");

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
    console.log("Update Gamepad State");
    const session = this.startScreen.renderer.xr.getSession();

    const inputSource = session.inputSources[0];
    // console.log("InputSoruce: " + inputSource);
    // console.log("InputSoruce.Gamepad: " + inputSource.gamepad);
    // console.log("gamePadIndices: " + this.gamepadIndices);
    // console.log("ButtonState: " + this.buttonStates);
    // console.log("UI: " + this.ui);

    if (
      inputSource &&
      inputSource.gamepad &&
      this.gamepadIndices && //UNDEF
      this.ui &&
      this.buttonStates //UNDEF
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

          this.updateControllerOutputValues();
        });
      } catch (e) {
        console.warn("An error occurred setting the ui");
      }
    }
  }

  setupXR() {
    const self = this;

    function onConnected(event) {
      console.log("CONNECTED FIRED");
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

          //   console.log(JSON.stringify(info));

          self.updateControllers(info);
        }
      );
    }

    const controller = this.startScreen.renderer.xr.getController(0);
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
    const controller = this.startScreen.renderer.xr.getController(index);

    controller.userData.selectPressed = false;
    controller.userData.index = index;

    if (line) controller.add(line.clone());

    this.startScreen.addObjectToScene(
      controller,
      this.gameControllerIdentifier
    );

    let grip;

    if (modelFactory) {
      grip = this.startScreen.renderer.xr.getControllerGrip(index);
      grip.add(modelFactory.createControllerModel(grip));
      this.startScreen.addObjectToScene(grip, this.gameControllerIdentifier);
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
            self.startScreen.scene.remove(controller);
          }
          if (obj.grip) self.startScreen.scene.remove(obj.grip);
        }
      }
    }

    if (info.right !== undefined) {
      const right = this.startScreen.renderer.xr.getController(0);

      //   let trigger = false,
      //     squeeze = false;

      //   Object.keys(info.right).forEach((key) => {
      //     if (key.indexOf("trigger") != -1) trigger = true;
      //     if (key.indexOf("squeeze") != -1) squeeze = true;
      //   });

      right.addEventListener("disconnected", onDisconnected);
    }

    if (info.left !== undefined) {
      const left = this.startScreen.renderer.xr.getController(1);

      //   let trigger = false,
      //     squeeze = false;

      //   Object.keys(info.left).forEach((key) => {
      //     if (key.indexOf("trigger") != -1) trigger = true;
      //     if (key.indexOf("squeeze") != -1) squeeze = true;
      //   });

      left.addEventListener("disconnected", onDisconnected);
    }
  }
}

export { GameController };
