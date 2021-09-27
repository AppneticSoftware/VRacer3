export function startCommunication(startScreen) {
  let socket = io();
  let roomsMemberCounterArray;

  socket.on("connect", function () {
    console.log("App connect");
    console.log(socket.id);
  });

  socket.on("roomAvailability", function (roomUserCounter) {
    startScreen.roomsMemberCounterArray = roomUserCounter;
  });
}
