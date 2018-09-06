import { makeExecutableSchema } from "graphql-tools";
import typeDefs from "./type-defs";
import resolvers from "./resolvers";
//const { makeExecutableSchema } = require("graphql-tools");
//const resolvers = require("./resolvers");

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

export default schema;
//module.exports = schema;
