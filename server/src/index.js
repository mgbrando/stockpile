//const express = require("express");
import express from "express";
//const path = require("path");
import path from "path";
import config from "./config";
//const passport = require("passport");
//const session = require("express-session");
//const LocalStrategy = require("passport-local").Strategy;
//const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const { graphqlExpress, graphiqlExpress } = require("apollo-server-express");
//const { User } = require("./models/user");
//const authorizationRouter = require("./routers/authorizationRouter");
//const registrationRouter = require("./routers/registrationRouter");
//const { DATABASE_URL, PORT } = require("./config");
const mongoose = require("mongoose");
const schema = require("./schema.js");
import redis from "redis";
const redisClient = redis.createClient(config.cache);
redisClient.on("connect", () => {
  console.log("redis database connected");
});

const app = express();
app.set("port", config.port);
app.use(jsonParser);
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(express.static(path.resolve(__dirname, "../../client/build")));
app.use(
  "/graphiql",
  graphiqlExpress({
    endpointURL: "/graphql"
  })
);
app.use(
  "/graphql",
  jsonParser,
  graphqlExpress({
    schema,
    context: ({ req }) => ({
      headers: req.headers,
      jwtSecret: config.jwtSecret,
      redisClient: redisClient
    })
  })
);

app.get("*", (req, res) => {
  const index = path.resolve(__dirname, "../../client/build", "index.html");
  res.sendFile(index);
});

let server;

function runServer(databaseUrl = config.db, port = config.port) {
  return new Promise((resolve, reject) => {
    mongoose.connect(
      databaseUrl,
      { useMongoClient: true },
      err => {
        if (err) {
          return reject(err);
        }
        server = app
          .listen(port, () => {
            console.log(`Your app is listening on port: ${port}`);
            resolve();
          })
          .on("error", err => {
            mongoose.disconnect();
            reject(err);
          });
      }
    );
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log("Closing server");
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}
if (require.main === module) {
  runServer();
}

module.exports = {
  app,
  runServer,
  closeServer
};
