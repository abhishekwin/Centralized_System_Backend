//required module
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const sticky = require("sticky-session");
const cluster = require("cluster");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const ObjectId = require("objectid");
require("dotenv").config();
const swaggerUI = require("swagger-ui-express");
const fs = require("fs");
const YAML = require("yaml");
const userTable = require("./module/user/model/userTable");
const file = fs.readFileSync("./swagger.yaml", "utf8");
const swaggerDocument = YAML.parse(file);

app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "150mb" }));
app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: "150mb",
  })
);

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/public", express.static(__dirname + "/public"));

app.set("port", process.env.PORT || 5004);
const http = require("http").createServer(app);

const io = require("socket.io")(http);
io.on("connection", (socket) => {
  console.log("Connected");
  require("./utility/socket")(socket, io);
  socket.on("userconnect", async (userid) => {
    console.log("🚀 ~ file: app.js:49 ~ socket.on ~ userid:", userid);
    if (userid) {
      await userTable.findOneAndUpdate(
        { _id: ObjectId(userid) },
        { $set: { socketId: socket.id, online: "OnLine" } }
      );
    }
  });
  socket.on("disconnect", async () => {
    if (socket.id) {
      await userTable.findOneAndUpdate(
        { socketId: socket.id },
        { $set: { online: "OffLine" } }
      );
    }
    console.log("Disconnected");
  });
});

if (!sticky.listen(http, app.get("port"))) {
  http.once("listening", function() {
    console.log("Server started on port " + app.get("port"));
  });

  if (cluster.isMaster) {
    var numWorkers = require("os").cpus().length;

    //console.log('Master cluster setting up ' + numWorkers + ' workers...');

    for (var i = 0; i < numWorkers; i++) {
      cluster.fork();
    }
    //console.log('Main server started on port ' + app.get('port'));

    cluster.on("online", function(worker) {
      console.log("Worker " + worker.process.pid + " is online");
    });
  }
} else {
  console.log(
    "- Child server started on port " +
      app.get("port") +
      " case worker id=" +
      cluster.worker.id
  );
}

// const NODE_ENV = process.env.NODE_ENV;

// env = require("./config/env-stagging");

// if (NODE_ENV === "production") {
//   env = require("./config/env");
// }

//****Database connection mongodb using mongoose */
const mongoAtlasUri = process.env.mongoAtlasUri;
mongoose.connect(mongoAtlasUri, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", function callback() {
  console.log("Db atlas Connected");
});

// all routes
require("./routes/mainRoutes")(app);
