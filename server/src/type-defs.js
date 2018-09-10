import { gql } from "apollo-server-express";

export default gql`
  type User {
    email: String
    password: String
    permissions: String
    stocks: [String]
    cryptocurrencies: [String]
    jwt: String
  }

  type Update {
    ok: Int
    message: String
  }

  type Query {
    signinUser(email: String!, password: String!): User
  }

  type Mutation {
    signoutUser: Boolean
    registerUser(email: String!, password: String!): User
    watchStock(symbol: String!): Update
    watchCryptocurrency(symbol: String!): Update
    unwatchStock(symbol: String!): Update
    unwatchCryptocurrency(symbol: String!): Update
  }
`;
