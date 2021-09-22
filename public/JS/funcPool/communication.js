import { dom, removeChildren } from "./dom.js";

export function startCommunication() {
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
}
