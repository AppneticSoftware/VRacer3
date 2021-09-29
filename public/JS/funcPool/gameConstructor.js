import * as THREE from "../../libs/three/three.module.js";

class GameConstructor {
  constructor(startScreen) {
    //damit man alle Objekte aus der Scene deaktivieren kann
    this.gameConstructorIdentifier = "gameConstructor";

    this.startScreen = startScreen;

    this.loadAndSetupAllAssets(this.configureAssetsArray());

    // startScreen.addObjectToScene(this.camera, this.gameConstructorIdentifier);
    const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 0.5);
    startScreen.addObjectToScene(ambient, this.gameConstructorIdentifier);

    const light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.set(0.2, 1, 1);
    startScreen.addObjectToScene(light, this.gameConstructorIdentifier);
    this.setupCameraAndUI();
  }

  loadAndSetupAllAssets(assetNameArray) {
    for (let index = 0; index < assetNameArray.length; index++) {
      this.startScreen.loadGLTF(
        assetNameArray[index][0],
        assetNameArray[index][1],
        assetNameArray[index][2],
        this.gameConstructorIdentifier
      );
    }
  }

  //TODO: Skalierungen der .glb Exporte verbessern
  configureAssetsArray() {
    return [
      ["Racetrack2.glb", [110, 0, 0], [5, 5, 5]],
      ["blueBike.glb", [-41, 0, -300], [550, 550, 550]],
      ["greenBike.glb", [-19, 0, -300], [550, 550, 550]],
      ["redBike.glb", [27, 0, -300], [550, 550, 550]],
      ["yellowBike.glb", [5, 0, -300], [550, 550, 550]],
    ];
  }

  setupCameraAndUI() {
    this.newDolly = new THREE.Object3D();
    this.newDolly.position.set(-41, 13, -300);
    this.newDolly.rotation.x = (15 * Math.PI) / 180;
    this.newDolly.rotation.y = -(180 * Math.PI) / 180;
    this.newDolly.add(this.startScreen.camera);
    this.startScreen.addObjectToScene(
      this.newDolly,
      this.gameConstructorIdentifier
    );

    this.startScreen.renderFunc();
    this.startScreen.renderer.setAnimationLoop(
      this.startScreen.render.bind(this.startScreen)
    );
  }
}

export { GameConstructor };
