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
require("dotenv").config();
const swaggerUI = require("swagger-ui-express");
const fs = require("fs")
const YAML = require('yaml')
const file  = fs.readFileSync('./swagger.yaml', 'utf8')
const swaggerDocument = YAML.parse(file)



const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Centralized Exchange (CEX)",
      version: "1.0.0",
      description: "Best Centralized Exchange in the Market",
    },
  },
  apis: [path.resolve(__dirname, "./routes/mainRoutes.js")],
};
app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "150mb" }));
app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: "150mb",
  })
);

app.use("/api-docs",swaggerUI.serve,swaggerUI.setup(swaggerDocument));


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

const NODE_ENV = process.env.NODE_ENV;

env = require("./config/env-stagging");

if (NODE_ENV === "production") {
  env = require("./config/env");
}

//****Database connection mongodb using mongoose */
const mongoAtlasUri = env.mongoAtlasUri;
mongoose.connect(mongoAtlasUri, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", function callback() {
  console.log("Db atlas Connected");
});

// all routes
require("./routes/mainRoutes")(app);
