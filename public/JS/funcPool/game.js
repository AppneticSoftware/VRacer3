import * as THREE from "../../libs/three/three.module.js";
import { GLTFLoader } from "../../libs/three/jsm/GLTFLoader.js";
import { UI } from "./ui.js";

class Game {
  constructor(main) {
    //damit man alle Objekte aus der Scene deaktivieren kann
    this.gameIdentifier = "gameScreen";
    this.main = main;
    this.assetArray = [
      ["blueBike.glb", [-41, 0, -300], [550, 550, 550]],
      ["greenBike.glb", [-19, 0, -300], [550, 550, 550]],
      ["redBike.glb", [5, 0, -300], [550, 550, 550]],
      ["yellowBike.glb", [27, 0, -300], [550, 550, 550]],
      ["Racetrack2.glb", [110, 0, 0], [5, 5, 5]],
    ];

    this.maxSpeed = 10;
    this.maxTurningSpeed = 4;
    this.maxRotation = 1;
    this.maxRotationY = (180 * Math.PI) / 180;

    this.setupRaceTrackAsset();
  }

  //----------------------------------------------------------------
  //Setup Functions

  setupRaceTrackAsset() {
    this.main.loadGLTF(
      this.assetArray[4][0],
      this.assetArray[4][1],
      this.assetArray[4][2],
      this.gameIdentifier
    );
  }

  setupCamera() {
    this.cameraDolly = new THREE.Object3D();
    this.cameraDolly.position.set(0, 13, 0);
    this.cameraDolly.rotation.x = (15 * Math.PI) / 180;
    this.cameraDolly.rotation.y = -(180 * Math.PI) / 180;
    this.cameraDolly.add(this.main.camera);
  }

  setupGameUI() {
    this.uiInstance = new UI(this);
    this.uiInstance.setupGameUI();
    this.gameUIDolly = new THREE.Object3D();
    this.gameUIDolly.add(this.uiInstance.uiGameScreen.mesh);
    this.gameUIDolly.position.set(0, 14.5, 2);
  }

  //----------------------------------------------------------------
  //Generell Functions

  getPosVectorOfArray(array) {
    return new THREE.Vector3().fromArray(array);
  }

  getFreeIndex() {
    for (let index = 0; index < this.roomUserData.length; index++) {
      if (this.roomUserData[index] == "0") {
        return index;
      }
    }
  }
  //REFACTOR MÖGLICH
  loadGLTF_ToOtherObject(nameOfFile, scale = [3], nameOfAsset, otherObject) {
    const loader = new GLTFLoader().setPath("../../Assets/");
    const self = this;
    this.main.loadingBar.visible = true;
    // Load a glTF resource
    return loader.load(
      // resource URL
      nameOfFile,
      // called when the resource is loaded
      function (gltf) {
        const model = gltf.scene;
        // model.position.set(pos[0], pos[1], pos[2]);
        model.scale.set(scale[0], scale[1], scale[2]);
        model.name = nameOfAsset;
        otherObject.add(model);
        self.main.loadingBar.visible = false;
        self.main.exportRenderFunc();
      },
      // called while loading is progressing
      function (xhr) {
        self.main.loadingBar.progress = xhr.loaded / xhr.total;
      },
      // called when loading has errors
      function (error) {
        console.log("LoadGLTF Function: " + error);
      }
    );
  }

  updateControllerValues() {
    this.controllerValues = this.main.controller.buttonStatesRight;
    this.aButton = this.controllerValues.a_button;
    this.bButton = this.controllerValues.b_button;
    this.thumbRest = this.controllerValues.thumbrest;
    this.squeeze = this.controllerValues.xr_standard_squeeze;
    this.trigger = this.controllerValues.xr_standard_trigger;
    this.stickButton = this.controllerValues.xr_standard_thumbstick.button;
    this.xStick = this.controllerValues.xr_standard_thumbstick.xAxis;
    this.yStick = this.controllerValues.xr_standard_thumbstick.yAxis;
  }

  detectButtonPress() {
    const numb = this.raceDolly.rotation.y;
    this.printOnUI(numb.toString());
    if (this.raceDolly) {
      if (this.aButton != 0) {
        //Exit game
        this.printOnUI("A Button pressed");
      }
      if (this.squeeze != 0) {
        //Bremse
        this.printOnUI("squeeze pressed");
      }
      if (this.trigger != 0) {
        //Gas + vorwärts oder rückwärts
        this.changeRacerPosZ();
      }
      if (this.stickButton != 0) {
        //Show UI;
        this.changeVisibilityOfUI();
      }
      if (this.xStick != 0) {
        //Link bzw. Rechts
        // this.changeRacerRotationZ();
        this.changeRacerRotationY();
        // this.changeRacerPosX();
      } else {
        // this.raceDolly.rotation.z = 0;
        this.raceDolly.rotation.y = 0;
      }
    }
  }

  getDrivingDirection() {
    //this.ystick == minus 1 => vorwärts

    if (this.yStick > 0) {
      return -1;
    } else {
      return 1;
    }
  }

  getDrivingRotation() {
    //this.ystick == minus 1 => vorwärts

    if (this.xStick > 0) {
      return -1;
    } else {
      return 1;
    }
  }

  changeRacerPosZ() {
    this.raceDolly.position.z =
      this.raceDolly.position.z +
      this.maxSpeed * this.trigger * this.getDrivingDirection();
  }

  changeRacerRotationZ() {
    if (
      this.raceDolly.rotation.z < this.maxRotation ||
      this.raceDolly.rotation.z > -1 * this.maxRotation
    )
      this.raceDolly.rotation.z =
        this.raceDolly.rotation.z + this.maxRotation * this.xStick * -1;
  }

  changeRacerRotationY() {
    if (
      this.raceDolly.rotation.y < this.maxRotationY ||
      this.raceDolly.rotation.y > -1 * this.maxRotationY
    )
      this.raceDolly.rotation.y =
        this.raceDolly.rotation.y + this.maxRotationY * this.xStick * -1;
  }

  changeRacerPosX() {
    const numb =
      this.raceDolly.position.x + this.maxTurningSpeed * this.xStick * -1;
    this.raceDolly.position.x = numb;
  }

  changeVisibilityOfUI() {
    this.uiInstance.uiGameScreen.visible =
      !this.uiInstance.uiGameScreen.visible;
  }
  updateGamePos() {
    //wird in Main aufgerufen
    //ADD UPDATE FOR OTHER PLAYERS
    this.updateOwnPlayerPos();
  }

  printOnUI(str) {
    this.uiInstance.uiGameScreen.updateElement("body", str);
    this.uiInstance.uiGameScreen.update();
  }

  //----------------------------------------------------------------
  //Player Functions

  updateOwnPlayerPos() {
    this.updateControllerValues();
    this.detectButtonPress();
  }

  initPlayersAndSetupUI(roomUserData, ownSocketId) {
    this.roomUserData = roomUserData;
    this.userID = ownSocketId;
    this.racerGroup = new THREE.Group();

    if (roomUserData == "AnErrorAppeared") {
      //TODO: EXIT FUNCTION
      console.log("An Error Appeared while trying to get Room User Data.");
    } else {
      for (let index = 0; index < roomUserData.length; index++) {
        if (roomUserData[index] == ownSocketId) {
          this.initOwnPlayerWithCamera(index);
        } else if (roomUserData[index] != 0) {
          this.addNewPlayerToRacerGroup(index, roomUserData[index]);
        }
      }
    }

    this.main.addObjectToScene(this.racerGroup, this.gameIdentifier);
  }

  initOwnPlayerWithCamera(index) {
    this.raceDolly = new THREE.Object3D();
    this.setupCamera();
    this.setupGameUI();
    this.loadGLTF_ToOtherObject(
      this.assetArray[index][0],
      this.assetArray[index][2],
      this.assetArray[index][0],
      this.raceDolly
    );
    const posBike = this.getPosVectorOfArray(this.assetArray[index][1]);
    this.raceDolly.position.x = posBike.x;
    this.raceDolly.position.y = posBike.y;
    this.raceDolly.position.z = posBike.z;
    this.raceDolly.add(this.cameraDolly);
    this.raceDolly.add(this.gameUIDolly);
    this.main.addObjectToScene(this.raceDolly, this.gameIdentifier);
    this.main.exportRenderFunc();
  }

  addNewPlayerToRacerGroup(index, id) {
    this.main.loadGLTF(
      this.assetArray[index][0],
      this.assetArray[index][1],
      this.assetArray[index][2],
      id
    );
  }

  removePlayerFromRacer(userID) {
    //REMOVE OF RACER QAD  - better https://newbedev.com/how-do-i-clear-three-js-scene
    const sceneChildren = this.main.scene.children;
    for (let index = 0; index < sceneChildren.length; index++) {
      if (sceneChildren[index].name == userID) {
        this.main.scene.remove(sceneChildren[index]);
        this.deleteUserFromRoomUserData(userID);
      }
    }
  }

  deleteUserFromRoomUserData(userId) {
    for (let index = 0; index < this.roomUserData.length; index++) {
      if (this.roomUserData[index] == userId) {
        this.roomUserData[index] = "0";
        break;
      }
    }
    console.log("RoomUserData after disconnect of user: " + this.roomUserData);
  }

  addNewPlayerToScene(userID) {
    if (this.isPlayerAlreadyInScene(userID) == false) {
      console.log(userID + " is not already in the game.");
      const newPlayerIndex = this.getFreeIndex();

      this.addNewPlayerToRacerGroup(newPlayerIndex, userID);
      this.roomUserData[newPlayerIndex] = userID;
      console.log(this.roomUserData);
    } else {
      console.log(userID + " is already in the game.");
    }
  }

  isPlayerAlreadyInScene(userID) {
    const sceneChildren = this.main.scene.children;
    for (let index = 0; index < sceneChildren.length; index++) {
      if (sceneChildren[index].name == userID) {
        console.log("isPlayerAlreadyInScene : " + true);
        return true;
      }
    }
    return false;
  }
}

export { Game };
