import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationsService } from './notifications.service';
import { NotificationDto } from './dto/notification.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/ws',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedClients: Map<number, Socket[]> = new Map();

  constructor(private notificationsService: NotificationsService) {}

  async handleConnection(client: Socket) {
    try {
      // Get token from handshake
      const token = client.handshake.auth.token;
      if (!token) return;

      // Validate token and get user ID
      const userId = await this.notificationsService.getUserIdFromToken(token);
      if (!userId) return;

      // Add client to connected clients for this user
      if (!this.connectedClients.has(userId)) {
        this.connectedClients.set(userId, []);
      }
      this.connectedClients.get(userId).push(client);

      // Store user ID in socket data
      client.data.userId = userId;
      
      console.log(`Client connected: ${client.id}, User: ${userId}`);
    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (!userId) return;

    // Remove this client from the user's connected clients
    const userClients = this.connectedClients.get(userId) || [];
    const updatedClients = userClients.filter(c => c.id !== client.id);
    
    if (updatedClients.length === 0) {
      this.connectedClients.delete(userId);
    } else {
      this.connectedClients.set(userId, updatedClients);
    }
    
    console.log(`Client disconnected: ${client.id}, User: ${userId}`);
  }

  @SubscribeMessage('sendTestNotification')
  handleTestNotification(client: Socket, payload: { title: string, message: string }) {
    const userId = client.data.userId;
    if (!userId) return { success: false, error: 'Unauthorized' };
    
    this.sendToUser(userId, 'notification', {
      type: 'test',
      title: payload.title,
      message: payload.message,
      timestamp: new Date(),
    });
    
    return { success: true };
  }

  @SubscribeMessage('sendBroadcastNotification')
  async handleBroadcastNotification(client: Socket, payload: { title: string, message: string }) {
    const userId = client.data.userId;
    if (!userId) return { success: false, error: 'Unauthorized' };
    
    // Only admins can broadcast
    const isAdmin = await this.notificationsService.isAdmin(userId);
    if (!isAdmin) {
      return { success: false, error: 'Forbidden' };
    }
    
    this.broadcast('notification', {
      type: 'broadcast',
      title: payload.title,
      message: payload.message,
      timestamp: new Date(),
    });
    
    return { success: true };
  }

  // Send notification to a specific user
  sendToUser(userId: number, event: string, data: NotificationDto) {
    const userClients = this.connectedClients.get(userId) || [];
    userClients.forEach(client => {
      client.emit(event, data);
    });
  }

  // Broadcast to all connected clients
  broadcast(event: string, data: NotificationDto) {
    this.server.emit(event, data);
  }
}