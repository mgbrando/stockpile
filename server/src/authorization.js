import GraphqlError from "./resolver-errors";
import jwt from "jsonwebtoken";

//const secretKey = "I am a giraffe!";
const getToken = context => context.headers.authorization.replace("Bearer", "");
const checkBlacklist = async (redisClient, token) => {
  console.log("Inside blacklist check");
  const tokenFound = await redisClient.existsAsync(token);
  if (tokenFound === 1) {
    const blacklistError = new Error(
      "This token has been blacklisted. Login to get new credentials."
    );
    blacklistError.name = "BlacklistError";
    throw blacklistError;
  }
  /* return Promise.reject(
      new Error(
        "This token has been blacklisted. Login to get new credentials."
      )
    );*/
  //return false;
};
/*, (err, reply) => {
  console.log("JUST AFTER EXISTS CHECK");
  console.log(reply);
  if (reply) {
    const blacklistError = new Error(
      "This token has been blacklisted. Login to get new credentials."
    );
    blacklistError.name = "BlacklistError";
    return blacklistError;
  }
  return false;
}*/

const addToBlacklist = (redisClient, token) =>
  redisClient.set(token, "", "EX", 60 * 60 * 24);

const resolveAndPassCredentials = async (context, controller, input = null) => {
  try {
    let userInfo;
    if (input) {
      userInfo = await controller(input);
    } else userInfo = await controller();
    //const userInfo = input ? controller(input) : controller();
    console.log(userInfo);
    console.log("MADE IT HERE");
    const userResponse = {
      ...userInfo.apiRepr(),
      jwt: jwt.sign(userInfo.apiRepr(), context.jwtSecret, { expiresIn: "1d" })
    };
    return userResponse;
  } catch (err) {
    const LoginError = GraphqlError(err.name, { message: err.message });
    throw new LoginError();
  }
};
/*const checkPermissions = (userPermissions, neededPermissions) => {
  for (let i = 0; i < neededPermissions.length; i++) {
    if (!userPermissions.includes(neededPermissions[i])) return false;
  }
  return true;
};*/
const checkPermissionsAndResolve = async (
  context,
  expectedScope,
  controller,
  input = null
) => {
  try {
    const token = getToken(context);
    await checkBlacklist(context.redisClient, token);
    console.log("After Blacklist reply");
    /*console.log(reply);
    if (reply) throw reply;*/
    const jwtPayload = jwt.verify(token, context.jwtSecret);
    console.log(jwtPayload);
    const hasPermission = jwtPayload.permissions.includes(expectedScope);
    console.log(hasPermission);
    if (!expectedScope.length || hasPermission) {
      /*const userInfo = input
        ? controller.apply({ ...jwtPayload, ...input })
        : controller.apply({ ...jwtPayload });
      console.log(userInfo);*/
      let userInfo;
      if (input) {
        userInfo = await controller({ ...jwtPayload, ...input });
      } else userInfo = await controller({ ...jwtPayload });
      console.log(userInfo);
      return userInfo;
      /*input
        ? controller.apply({ ...jwtPayload, ...input })
        : controller.apply();*/
    } else {
      const scopeError = new Error(
        "You do not have the necessary permissions."
      );
      scopeError.name = "ScopeError";
      throw scopeError;
    }
  } catch (err) {
    console.log("GRAPHQL Error Block");
    console.log(err);
    const AuthorizationError = GraphqlError(err.name, { message: err.message });
    throw new AuthorizationError();
  }
};

const blacklistToken = async (context, controller) => {
  const token = getToken(context);
  const tokenBlacklisted = await addToBlacklist(context.redisClient, token);
  if (!tokenBlacklisted)
    throw GraphqlError("Blacklisting", {
      message: "Error occured while attempting to blacklist token."
    });
  return controller.apply();
  //return controller.apply(this);
};

export {
  resolveAndPassCredentials,
  checkPermissionsAndResolve,
  blacklistToken
};
