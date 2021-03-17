const { ApolloServer } = require("apollo-server");
const typeDefs = require("./db/schema");
const resolvers = require("./db/resolvers");
const connectDb = require("./config/db");
const jwt = require("jsonwebtoken");
const conectarDB = require("./config/db");
require("dotenv").config("variables.env");


//Conectar a la db
connectDb();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.headers["authorization"] || ""
    if(token) {
      try {
        const usuario = jwt.verify(token, process.env.SECRET);
        return usuario
      } catch(error){

      }
    }
  },
});

server.listen().then(({ url }) => {
  console.log(`Servidor listo en la url ${url}`);
});
