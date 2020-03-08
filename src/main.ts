import { ApolloServer } from "apollo-server";
import typeDefs from './schema';
import resolver from './resolvers';
import Knex = require('knex');
import GoDatabase from './database';

const knexConfig: Knex.Config ={
  client: "pg",
  connection:{
    host: "localhost",
    port: 5432,
    user:"postgres",
    password: "colgate",
    database:"postgres"
  },
  debug: true
}

const goDB = new GoDatabase(knexConfig);

const server = new ApolloServer({ typeDefs, resolvers: resolver, dataSources:()=>({db:goDB})})


server.listen().then(({url})=>{
  console.log(`🚀  Server ready at ${url}`);
})
