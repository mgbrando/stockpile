import express from "express";
import path from "path";
import config from "./config";
import bodyParser from "body-parser";
const jsonParser = bodyParser.json();
import mongoose from "mongoose";
import createApolloServer from "./schema";
import redis from "redis";
import bluebird from "bluebird";
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const app = express();
app.set("port", config.port);
app.use(jsonParser);
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(express.static(path.resolve(__dirname, "../../client/build")));

const { host, redisPort, password } = config.redisDB;
const redisClient = redis.createClient(redisPort, host, {
  no_ready_check: true
});
redisClient.on("connect", () => {
  redisClient.auth(password, function(err) {
    console.log("REDIS DATABASE connected...");
    if (err) throw err;
    else console.log("REDIS DATABASE authenticated...");
  });
});
createApolloServer({
  jwtSecret: config.jwtSecret,
  redisClient: redisClient
}).applyMiddleware({
  app: app
});

app.get("*", (req, res) => {
  const index = path.resolve(__dirname, "../../client/build", "index.html");
  res.sendFile(index);
});

let server;

function runServer(databaseUrl = config.db, port = config.port) {
  return new Promise((resolve, reject) => {
    mongoose.connect(
      databaseUrl,
      { useNewUrlParser: true },
      err => {
        if (err) {
          return reject(err);
        }
        console.log("MONGO DATABASE connected...");

        server = app
          .listen(port, () => {
            console.log(`Your app is listening on port: ${port}`);
            resolve();
          })
          .on("error", err => {
            mongoose.disconnect();
            redisClient.quit();
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
      redisClient.quit();
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
