import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyToken } from './token';
import Message from '../models/Message';
import Conversation from '../models/Conversation';

let io: Server;

export const initSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));
      const decoded = verifyToken(token);
      (socket as any).userId = decoded.userId;
      next();
    } catch {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;
    socket.join(`user:${userId}`);
    console.log(`User ${userId} connected`);

    socket.on('sendMessage', async (data: { conversationId: string; content: string }) => {
      try {
        const message = await Message.create({
          sender: userId,
          conversation: data.conversationId,
          content: data.content,
        });

        await Conversation.findByIdAndUpdate(data.conversationId, {
          lastMessage: data.content,
          updatedAt: new Date(),
        });

        const populated = await message.populate('sender', 'name avatar');

        const conversation = await Conversation.findById(data.conversationId);
        conversation?.participants.forEach((participantId) => {
          io.to(`user:${participantId}`).emit('newMessage', populated);
        });
      } catch (error) {
        socket.emit('error', { message: 'Erreur envoi message' });
      }
    });

    socket.on('typing', (data: { conversationId: string }) => {
      socket.to(`user:${data.conversationId}`).emit('typing', { userId, conversationId: data.conversationId });
    });

    socket.on('stopTyping', (data: { conversationId: string }) => {
      socket.to(`user:${data.conversationId}`).emit('stopTyping', { userId, conversationId: data.conversationId });
    });

    socket.on('markRead', async (data: { conversationId: string }) => {
      await Message.updateMany(
        { conversation: data.conversationId, sender: { $ne: userId }, read: false },
        { read: true }
      );
      const conversation = await Conversation.findById(data.conversationId);
      conversation?.participants.forEach((participantId) => {
        if (participantId.toString() !== userId) {
          io.to(`user:${participantId}`).emit('messagesRead', { conversationId: data.conversationId, readBy: userId });
        }
      });
    });

    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected`);
    });
  });

  return io;
};

export const getIO = (): Server => io;
