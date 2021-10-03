// Setup
const express = require("express");
const path = require("path");
const app = require("./app");
let userIDs = [];
let roomUserCounter = [
  ["0", "0", "0", "0"], //RoomOne
  ["0", "0", "0", "0"], //RoomTwo
  ["0", "0", "0", "0"], //RoomThree
];
let socketIO;

// Server & WebSockets
const server = require("http").createServer(app);
IoConnect(server);

let dataDir = path.resolve(__dirname, "public");
app.use(express.static(dataDir));

let port = process.env.PORT || 3000;
server.listen(port, function () {
  console.log(
    `App prod ${process.env.PROD} listening at ${port} in ${dataDir}`
  );
});

//----------------------------------------------------------------------
// Socket.IO connector
function IoConnect(server) {
  socketIO = require("socket.io")(server);
  socketIO.on("connection", (socket) => {
    console.log(socket.id + " joined the server.");
    sendRoomAvailability(socket);

    //Listener
    listenToDisconnect(socket);
    listenToJoinRoom(socket);
    listenToSuccessfullyJoinedRoom(socket);
    listenToUserExitRoom(socket);
  });
}
//-----------------------------------------------------------------------
//Socket Functions - Sender

function sendRoomAvailability(socket) {
  socket.emit("roomAvailability", getRoomCounters());
}

function sendRoomPermission(socket, isAllowed) {
  socket.emit("roomPermission", isAllowed);
}

function sendRoomsUpdateToAllUsers(socket) {
  socket.broadcast.emit("roomAvailability", getRoomCounters());
}

function sendUserDataFromRoom(socket, roomName) {
  socket.emit("roomUserData", getUserDataFromSpecificRoom(roomName));
}

function sendNewPlayerJoined(socket, roomName) {
  socketIO.to(roomName).emit("newPlayerJoined", socket.id);
}

function sendRoomUserDisconnect(socket, roomName) {
  console.log(socket.id + " disconnected from room " + roomName);
  socket.to(roomName).emit("userDisconnect", socket.id);
}

//-----------------------------------------------------------------------
//Socket Functions - Listener

function listenToDisconnect(socket) {
  socket.on("disconnect", function () {
    console.log(socket.id + " disconnected or exited a game. ");
    const roomName = removeUserFromRoomAndReturnRoomName(socket.id);
    sendRoomUserDisconnect(socket, roomName);
    sendRoomsUpdateToAllUsers(socket);
  });
}

function listenToJoinRoom(socket) {
  socket.on("joinRoom", function (roomName) {
    console.log(socket.id + " is asking to Join Room: " + roomName);
    const isUserAllowedToJoin = isUserAddableToRoom(socket.id, roomName);
    sendRoomPermission(socket, isUserAllowedToJoin, roomName);
  });
}

function listenToUserExitRoom(socket) {
  socket.on("userExit", function (userId, roomName) {
    socket.leave(roomName);
    removeUserFromRoomAndReturnRoomName(socket.id);
    sendRoomUserDisconnect(socket, roomName);
    sendRoomsUpdateToAllUsers(socket);
    socketIO.to(roomName).emit("test", "siehste mich ?");
    console.log(userId + " left the game " + roomName);
  });
}

function listenToSuccessfullyJoinedRoom(socket) {
  socket.on("joinConfirmation", function (isUserSuccessfullyJoined, roomName) {
    if (isUserSuccessfullyJoined) {
      //getRoomname
      console.log(socket.id + " successfully joined Room: " + roomName);
      socket.join(roomName);
      sendRoomsUpdateToAllUsers(socket);
      sendUserDataFromRoom(socket, roomName); //nur an gejointen User
      sendNewPlayerJoined(socket, roomName); //an Alle
    } else console.log(socket.id + " didnt joined the room.");
  });
}

//-----------------------------------------------------------------------
//Generall Functions

function getRoomNameOfRoomsArrayIndex(index) {
  switch (index) {
    case 0:
      return "roomOne";
    case 1:
      return "roomTwo";
    case 2:
      return "roomThree";

    default:
      return "User didnt join a room.";
  }
}

function getRoomCounters() {
  const roomsMemberCounterArray = [];
  for (let index = 0; index < roomUserCounter.length; index++) {
    roomsMemberCounterArray[index] = countMembersInRoom(roomUserCounter[index]);
  }

  return roomsMemberCounterArray;
}

function getUserDataFromSpecificRoom(roomName) {
  switch (roomName) {
    case "roomOne":
      return roomUserCounter[0];
    case "roomTwo":
      return roomUserCounter[1];
    case "roomThree":
      return roomUserCounter[2];
    default:
      return "AnErrorAppeared";
  }
}

function countMembersInRoom(roomArray) {
  let memberAmount = 0;
  for (let index = 0; index < roomArray.length; index++) {
    if (roomArray[index] != "0") {
      memberAmount += 1;
    }
  }
  return memberAmount;
}

function isUserAddableToRoom(userId, roomName) {
  switch (roomName) {
    case "roomOne":
      return isUserAddabletoSpecificRoom(userId, roomUserCounter[0]);
    case "roomTwo":
      return isUserAddabletoSpecificRoom(userId, roomUserCounter[1]);
    case "roomThree":
      return isUserAddabletoSpecificRoom(userId, roomUserCounter[2]);
    default:
      return false;
  }
}

function isUserAddabletoSpecificRoom(userID, roomArray) {
  let userIsAllowed = false;
  for (let index = 0; index < roomArray.length; index++) {
    if (roomArray[index] == "0") {
      roomArray[index] = userID;
      userIsAllowed = true;
      break;
    }
  }
  return userIsAllowed;
}

function removeUserFromRoomAndReturnRoomName(userId) {
  for (let index = 0; index < roomUserCounter.length; index++) {
    for (let index2 = 0; index2 < roomUserCounter[index].length; index2++) {
      if (roomUserCounter[index][index2] == userId) {
        roomUserCounter[index][index2] = "0";
        return getRoomNameOfRoomsArrayIndex(index);
      }
    }
  }
}
