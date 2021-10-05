import * as THREE from "../../libs/three/three.module.js";

// central export for all other modules

export * as THREE from "../../libs/three/three.module.js";

function keyboard() {
  let keys = {};

  function toggle(event, active) {
    if (keys[event.key]) {
      let ko = keys[event.key];

      if (ko.active != active) {
        ko.active = active;

        ko.callback(active);
      }

      event.preventDefault();

      event.stopPropagation();
    } else {
      console.log("unused key", event.key);
    }
  }

  document.addEventListener("keydown", (ev) => toggle(ev, true));

  document.addEventListener("keyup", (ev) => toggle(ev, false));

  return function (key, callback) {
    keys[key] = {
      active: false,

      callback,
    };
  };
}

function mouse(cursor) {
  const movescale = 0.002;

  let mb = [false, false, false, false];

  function toggle(event, active) {
    mb[event.which] = active;
  }

  function onMouseMove(event) {
    let dx = event.movementX * movescale;

    let dy = event.movementY * movescale;

    let rot = event.ctrlKey;

    if (!rot && mb[1]) {
      cursor.position.x += dx;

      cursor.position.y -= dy;
    }

    if (!rot && mb[3]) {
      cursor.position.x += dx;

      cursor.position.z += dy;
    }

    if (rot && mb[1]) {
      cursor.rotation.y += dx;

      cursor.rotation.x -= dy;
    }

    if (rot && mb[3]) {
      cursor.rotation.y += dx;

      cursor.rotation.z -= dy;
    }
  }

  document.addEventListener("mousedown", (ev) => toggle(ev, true));

  document.addEventListener("mouseup", (ev) => toggle(ev, false));

  document.addEventListener("mousemove", onMouseMove, false);

  document.addEventListener(
    "contextmenu",
    (event) => {
      event.preventDefault();

      event.stopPropagation();

      return false;
    },
    false
  );
}

window.onload = function () {
  console.log("ThreeJs " + THREE.REVISION);

  let forward = 0,
    leftright = 0,
    speed = 0.001;

  let grabbed = false;

  let addKey = keyboard();

  addKey("ArrowUp", (down) => {
    forward += speed;
  });

  addKey("ArrowDown", (down) => {
    forward -= speed;
  });

  addKey("ArrowLeft", (down) => {
    leftright -= 0.01;
  });

  addKey("ArrowRight", (down) => {
    leftright += 0.01;
  });

  let rot_speed = new THREE.Quaternion();

  let trans_speed = new THREE.Vector3();

  let scale = new THREE.Vector3(1, 1, 1);

  let speed_matrix = new THREE.Matrix4();

  // Szene: enthï¿½lt ein Lichter

  let scene = new THREE.Scene();

  //

  scene.add(new THREE.HemisphereLight(0x808080, 0x606060));

  let light = new THREE.DirectionalLight(0xffffff);

  light.position.set(0, 6, 0);

  scene.add(light);

  let world = new THREE.Group();

  world.matrixAutoUpdate = false;

  scene.add(world);

  addKey(" ", (down) => {
    console.log("World is", world.matrix.elements, speed_matrix.elements);

    grabbed = down;

    forward = 0;

    leftright = 0;
  });

  //

  let camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );

  camera.position.set(0, 0, 2);

  scene.add(camera);

  //

  //     wireframe: true

  //OBJECTE ZUR WORLD HINZUGEFÜGT
  for (let i = 0; i < 100; ++i) {
    let box = new THREE.Mesh(
      new THREE.BoxBufferGeometry(0.1, 0.1, 0.1),
      new THREE.MeshStandardMaterial({
        color: 0x1e13f0,

        roughness: 0.7,

        metalness: 0.0,
      })
    );

    box.position.x = Math.random() * 5 - 2.5;

    box.position.y = Math.random() * 0.1;

    box.position.z = Math.random() * 5 - 2.5;

    world.add(box);
  }

  let planegeometry = new THREE.PlaneGeometry(20, 20, 64);

  let planematerial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
  });

  let plane = new THREE.Mesh(planegeometry, planematerial);

  plane.receiveShadow = true;

  plane.position.set(0, -0.5, 0);

  plane.rotation.x = Math.PI / 2;

  world.add(plane);

  //RACER WIRD NICHT ZUR WORLD HINZUGEFÜGT
  let cursor = new THREE.Mesh(
    new THREE.ConeBufferGeometry(0.2, 0.6, 64),
    new THREE.MeshStandardMaterial({
      color: 0xff13f0,

      roughness: 0.7,

      metalness: 0.0,
    })
  );

  scene.add(cursor);

  mouse(cursor);

  //

  let renderer = new THREE.WebGLRenderer({
    antialias: true,
  });

  renderer.setPixelRatio(window.devicePixelRatio);

  renderer.setSize(window.innerWidth, window.innerHeight);

  //

  document.body.appendChild(renderer.domElement);

  function render() {
    trans_speed.z = forward;

    rot_speed.setFromAxisAngle(new THREE.Vector3(0, 1, 0), leftright);

    speed_matrix.compose(trans_speed, rot_speed, scale);

    console.log(cursor.position);

    cursor.matrix = world.matrix;
    // world.matrix.premultiply(speed_matrix);
    world.matrix = speed_matrix.invert();

    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(render);
};
