export function startCommunication() {
  let socket = io();
  let myID = -1;

  socket.on("connect", function () {
    console.log("App connect");
  });

  socket.on("init", function (id) {
    console.log("Recieved Message from Server. userID = " + id);
    myID = id;
    socket.emit("userID", myID);
  });
}
