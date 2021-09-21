var express = require("express");
var path = require("path");
var app = express();

app.use(express.static(path.join(__dirname, "public")));

app.use(express.static("public"));

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------

app.get("/helloworld", function (req, res) {
  res.send("<H1>Hello World<H1>");
});

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/testindex.html");
});

module.exports = app;
