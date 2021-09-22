var express = require("express");
var path = require("path");
var app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static("public"));

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/index.html");
});

module.exports = app;
