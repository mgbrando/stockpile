export default `
    type User {
        id: Int
        email: String
        password: String
        permissions: String
        stocks: [String]
        cryptocurrencies: [String]
    }

    type Query {
        signinUser(email: String!, password: String!): User
        signoutUser(): Boolean
    }

    type Mutation {
        registerUser(email: String!, password: String!): User
        watchStock(symbol: String!): String
        watchCryptocurrency(symbol: String!): String
        unwatchStock(symbol: String!): String
        unwatchCryptocurrency(symbol: String!): String
    }
`;
