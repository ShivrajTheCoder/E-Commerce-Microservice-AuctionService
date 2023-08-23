import express from 'express';
import http from 'http';
import dotenv from "dotenv";
import { Server, Socket } from 'socket.io';
import { bidHandler } from './Controllers/bidController';
import auctionRoutes from "./Routes/auctionRoutes"
import { connectToDatabase } from './db_connection';
import cors from "cors";
dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

type Env = {
  PORT: string;
}
(async () => {
  await connectToDatabase().then(()=>{
    
    console.log('Connected to the database successfully!');
  })
  .catch(err=>{
    console.log(err);
  })
})();
app.use(cors());
app.use(express.json());
app.use("/auction",auctionRoutes)
const onConnection=(socket:Socket)=>{
  bidHandler(io,socket);
}
io.on("connection", onConnection);
server.listen(process.env["PORT" as keyof Env], () => {
  console.log(`listening on ${process.env["PORT" as keyof Env]}`);
});
