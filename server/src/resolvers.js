import User from "./models";
import {
  resolveAndPassCredentials,
  checkPermissionsAndResolve,
  blacklistToken
} from "./authorization";

const controllers = {
  createUser: async ({ email, password }) => {
    if (email && password) {
      const foundUser = await User.findOne({ email: email });
      if (foundUser) {
        const foundUserError = new Error(
          "The credentials you attempted to register with are that of an already registered user."
        );
        foundUserError.name = "Registered User";
        throw foundUserError;
      } else {
        password = await User.hashPassword(password);
        const newUser = await User.create({
          email,
          password
        });
        return newUser;
      }
    }
  },
  loginUser: async ({ email, password }) => {
    const foundUser = await User.findOne({ email });
    const passwordValidated = await foundUser.validatePassword(password);
    if (foundUser && passwordValidated) return foundUser;
    else {
      const invalidError = new Error(
        "The email and password combination supplied does not match any registered users."
      );
      invalidError.name = "Invalid Credentials";
      throw invalidError;
    }
  },
  logoutUser: () => null,
  //getStocksAndCryptocurrencies: async () => {}
  //getStocks: async() => ,
  //getCryptocurrencies: async() =>,
  addStock: async ({ email, symbol }) => {
    const { ok } = await User.update(
      { email },
      { $addToSet: { stocks: symbol } }
    );
    return {
      ok,
      message: `Successfully added the stock: ${symbol} to ${email}'s cryptocurrencies to watch.`
    };
  },
  addCryptocurrency: async ({ email, symbol }) => {
    const { ok } = await User.update(
      { email },
      { $addToSet: { cryptocurrencies: symbol } }
    );
    return {
      ok,
      message: `Successfully added the cryptocurrency: ${symbol} to ${email}'s cryptocurrencies to watch.`
    };
  },
  removeStock: async ({ email, symbol }) => {
    const { ok } = await User.update(
      { email },
      { $pullAll: { stocks: [symbol] } }
    );
    return {
      ok,
      message: `Successfully removed the stock: ${symbol} from ${email}'s stocks to watch.`
    };
  },
  removeCryptocurrency: async ({ email, symbol }) => {
    const { ok } = await User.update(
      { email },
      { $pullAll: { cryptocurrencies: [symbol] } }
    );
    return {
      ok,
      message: `Successfully removed the cryptocurrency: ${symbol} from ${email}'s cryptocurrencies to watch.`
    };
  }
};

//So far register, logout, add and remove endpoints are good.
const resolvers = {
  Query: {
    signinUser: (_, input, context) =>
      resolveAndPassCredentials(context, controllers.loginUser, input)
    //getUser: (_, args, context) =>
    //getStocksAndCryptocurrencies: (_, args, context) => checkPermissionsAndResolve(context, "general", controllers.getStocksAndCryptocurrencies),
    //getStocks: (_, args, context) => checkPermissionsAndResolve(context, "general", controllers.getStocks),
    //getCryptoCurrencies: (_, args, context) => checkPermissionsAndResolve(context, "general", controllers.getCryptoCurrencies),
  },
  Mutation: {
    registerUser: (_, input, context) => {
      return resolveAndPassCredentials(context, controllers.createUser, input);
    },
    signoutUser: (_, args, context) =>
      blacklistToken(context, controllers.logoutUser),
    watchStock: (_, input, context) =>
      checkPermissionsAndResolve(
        context,
        "general",
        controllers.addStock,
        input
      ),
    watchCryptocurrency: (_, input, context) =>
      checkPermissionsAndResolve(
        context,
        "general",
        controllers.addCryptocurrency,
        input
      ),
    unwatchStock: (_, input, context) =>
      checkPermissionsAndResolve(
        context,
        "general",
        controllers.removeStock,
        input
      ),
    unwatchCryptocurrency: (_, input, context) =>
      checkPermissionsAndResolve(
        context,
        "general",
        controllers.removeCryptocurrency,
        input
      )
  }
};

export default resolvers;
