const ne = process.env.NODE_ENV || global.env.NODE_ENV || "development";

const config = {
  env: ne,
  db:
    ne === "development"
      ? "mongodb://localhost/stockpile"
      : "mongodb://mgbrando:aidynmb9@ds141932.mlab.com:41932/stockpile",
  cache:
    process.env.REDIS_URL ||
    "redis-16405.c44.us-east-1-2.ec2.cloud.redislabs.com:16405",
  jwtSecret: "I'm a giraffe!",
  port: process.env.port || 3001
};

export default config;
