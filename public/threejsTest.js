// import * as THREE from "three";
// import * as THREE from "https://unpkg.com/three/build/three.module.js";
import * as THREE from "./libThree/three.module.js";
// // central export for all other modules
// export * as THREE from "./libThree/three.module.js";

import { dom, removeChildren } from "./dom.js";

window.onload = function () {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  console.log("Three");

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
  document.body.appendChild(renderer.domElement);

  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  camera.position.z = 5;

  const animate = function () {
    requestAnimationFrame(animate);

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    renderer.render(scene, camera);
  };

  animate();

  let socket = io();
  let myID = -1;

  let partners = {};

  let contentElement = document.getElementById("content");

  socket.on("connect", function () {
    console.log("App connect");
  });

  socket.on("init", function (id) {
    myID = id;
    contentElement.appendChild(dom("h1", {}, `I am client ${myID}`));
    let counter = 0;
    window.setInterval(() => {
      ++counter;
      socket.emit("heartbeat", { myID, counter });
    }, 1000);
  });

  socket.on("heartbeat", function (data) {
    if (data && data.myID && data.myID !== myID) {
      if (data.myID in partners) {
        contentElement.removeChild(partners[data.myID]);
      }
      partners[data.myID] = dom(
        "div",
        {},
        `Client ${data.myID} has counter ${data.counter}`
      );
      contentElement.appendChild(partners[data.myID]);

      contentElement.removeChild(serverElement);
      serverElement = dom(
        "div",
        {},
        `Server up for ${data.serverRuntime} sec.`
      );

      contentElement.appendChild(partners[data.myID]);
    }
  });
};
