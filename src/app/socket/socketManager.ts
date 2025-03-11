/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server as IOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import NormalUser from '../modules/normalUser/normalUser.model';
import handleChat2 from './handleChat2';
let io: IOServer;

const initializeSocket = (server: HTTPServer) => {
  if (!io) {
    io = new IOServer(server, {
      pingTimeout: 60000,
      cors: {
        origin: '*',
      },
    });
    // online user
    const onlineUser = new Set();
    console.log(onlineUser);
    io.on('ping', (data) => {
      io.emit('pong', data);
    });
    io.on('connection', async (socket: Socket) => {
      const userId = socket.handshake.query.id as string;
      if (!userId) {
        return;
      }

      const currentUser = await NormalUser.findById(userId);
      if (!currentUser) {
        return;
      }
      const currentUserId = currentUser?._id.toString();
      // create a room-------------------------
      socket.join(currentUserId as string);
      // set online user
      onlineUser.add(currentUserId);
      // send to the client

      // handle chat -------------------
      await handleChat2(io, socket, onlineUser, currentUserId);
      io.emit('onlineUser', Array.from(onlineUser));
      socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
      });
    });
  }
  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error(
      'Socket.io is not initialized. Call initializeSocket first.',
    );
  }
  return io;
};

export { initializeSocket, getIO };
