const ne = process.env.NODE_ENV || "development"; //|| global.env.NODE_ENV

const config = {
  env: ne,
  db:
    ne === "development"
      ? "mongodb://localhost:27017/stockpile"
      : "mongodb://mgbrando:aidynmb9@ds141932.mlab.com:41932/stockpile",
  redisDB: {
    host:
      process.env.REDIS_URL ||
      "redis-16405.c44.us-east-1-2.ec2.cloud.redislabs.com",
    redisPort: 16405,
    password: "Lilyanna11"
  },
  jwtSecret: "I'm a giraffe!",
  port: process.env.port || 3001
};

/*process.env.REDIS_URL ||
"//redis-16405.c44.us-east-1-2.ec2.cloud.redislabs.com:16405"*/
export default config;
