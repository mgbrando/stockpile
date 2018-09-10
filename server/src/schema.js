//import { makeExecutableSchema } from "graphql-tools";
import { ApolloServer } from "apollo-server-express";
import typeDefs from "./type-defs";
import resolvers from "./resolvers";
//const { makeExecutableSchema } = require("graphql-tools");
//const resolvers = require("./resolvers");

/*const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});*/
const createApolloServer = options =>
  new ApolloServer({
    typeDefs: typeDefs,
    resolvers: resolvers,
    context: ({ req }) => ({
      headers: req.headers,
      ...options
    }),
    playground: {
      endpoint: `/graphql`,
      settings: {
        "editor.theme": "light"
      }
    }
  });

export default createApolloServer;
//module.exports = schema;
