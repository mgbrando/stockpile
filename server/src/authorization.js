import GraphqlError from "./resolver-errors";
import jwt from "jsonwebtoken";

//const secretKey = "I am a giraffe!";
const getToken = context => context.headers.authorization.replace("Bearer", "");
const checkBlacklist = (redisClient, token) =>
  redisClient.exists(token, (err, reply) => {
    if (reply === 1) {
      const blacklistError = new Error(
        "This token has been blacklisted. Login to get new credentials."
      );
      blacklistError.name = "BlacklistError";
      throw blacklistError;
    }
  });
const addToBlacklist = (redisClient, token) =>
  redisClient.set(token, "", "EX", 60 * 60 * 24);

const resolveAndPassCredentials = (context, controller, input = null) => {
  try {
    const userInfo = input
      ? controller.apply(this, input)
      : controller.apply(this);
    return userInfo.then(info =>
      jwt.sign(info, context.jwtSecret, { expiresIn: "1d" })
    );
  } catch (err) {
    const LoginError = GraphqlError(err.name, { message: err.message });
    throw new LoginError();
  }
};

const checkPermissionsAndResolve = async (
  context,
  expectedScope,
  controller,
  input = null
) => {
  try {
    const token = getToken(context);
    await checkBlacklist(context.redisClient, token);
    const jwtPayload = jwt.verify(token, context.jwtSecret);
    const hasPermission = jwtPayload.permissions.includes(expectedScope);
    if (!expectedScope.length || hasPermission)
      return input ? controller.apply(this, input) : controller.apply(this);
    else {
      const scopeError = new Error(
        "You do not have the necessary permissions."
      );
      scopeError.name = "ScopeError";
      throw scopeError;
    }
  } catch (err) {
    const AuthorizationError = GraphqlError(err.name, { message: err.message });
    throw new AuthorizationError();
  }
};

const blacklistToken = async (context, controller) => {
  const token = getToken(context);
  const tokenBlacklistedPromise = await addToBlacklist(
    context.redisClient,
    token
  );
  return tokenBlacklistedPromise.then(() => controller.apply(this));
  //return controller.apply(this);
};

export {
  resolveAndPassCredentials,
  checkPermissionsAndResolve,
  blacklistToken
};
