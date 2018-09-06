import User from "./models";
import {
  resolveAndPassCredentials,
  checkPermissionsAndResolve,
  blacklistToken
} from "authorization";

const controllers = {
  createUser: async ({ email, password }) => {
    if (email && password) {
      const newUser = await User.findOne({ email: email });
      if (newUser) throw Error("User already registered.");
      else {
        const newUser = await User.create({
          email,
          password: User.hashPassword(password)
        });
        return newUser;
      }
    }
  },
  loginUser: async ({ email, password }) => {
    const foundUser = await User.findOne({ email });
    if (foundUser && foundUser.validatePassword(password)) return foundUser;
    else throw Error("Invalid Credentials");
  },
  logoutUser: () => null,
  //getStocksAndCryptocurrencies: async () => {}
  //getStocks: async() => ,
  //getCryptocurrencies: async() =>,
  addStock: async ({ email, symbol }) =>
    User.update({ email }, { $addToSet: { stocks: symbol } }),
  addCryptocurrency: async ({ email, symbol }) =>
    User.update({ email }, { $addToSet: { cryptocurrencies: symbol } }),
  removeStock: async ({ email, symbol }) =>
    User.update({ email }, { $pullAll: { stocks: symbol } }),
  removeCryptocurrency: async ({ email, symbol }) =>
    User.update({ email }, { $pullAll: { cryptocurrencies: symbol } })
};

const resolvers = {
  Query: {
    signinUser: (_, { input }, context) =>
      resolveAndPassCredentials(context, controllers.loginUser, input),
    signoutUser: (_, args, context) =>
      blacklistToken(context, controllers.logoutUser)
    //getUser: (_, args, context) =>
    //getStocksAndCryptocurrencies: (_, args, context) => checkPermissionsAndResolve(context, "general", controllers.getStocksAndCryptocurrencies),
    //getStocks: (_, args, context) => checkPermissionsAndResolve(context, "general", controllers.getStocks),
    //getCryptoCurrencies: (_, args, context) => checkPermissionsAndResolve(context, "general", controllers.getCryptoCurrencies),
  },
  Mutation: {
    registerUser: (_, { input }, context) =>
      resolveAndPassCredentials(context, controllers.createUser, input),
    watchStock: (_, { input }, context) =>
      checkPermissionsAndResolve(
        context,
        "general",
        controllers.addStock,
        input
      ),
    watchCryprocurrency: (_, { input }, context) =>
      checkPermissionsAndResolve(
        context,
        "general",
        controllers.addCryptocurrency,
        input
      ),
    unwatchStock: (_, { input }, context) =>
      checkPermissionsAndResolve(
        context,
        "general",
        controllers.removeStock,
        input
      ),
    unwatchCryptocurrency: (_, { input }, context) =>
      checkPermissionsAndResolve(
        context,
        "general",
        controllers.removeCryptocurrency,
        input
      )
  }
};

export default resolvers;
