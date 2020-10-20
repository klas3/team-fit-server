import {
  WebSocketGateway,
  OnGatewayConnection,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import Party from '../entity/Party';
import User from '../entity/User';

@WebSocketGateway()
class AppGateway implements OnGatewayConnection {
  @WebSocketServer()
  private readonly server!: Server;

  private readonly clients: Map<string, Socket> = new Map<string, Socket>();

  handleConnection(client: Socket): void {
    client.emit('connection');
  }

  @SubscribeMessage('sendInvite')
  sendInvite(
    client: Socket,
    invite: { receiverId: string; partyId: string; senderLogin: string },
  ): void {
    const { partyId, receiverId, senderLogin } = invite;
    const receiver = this.clients.get(receiverId);
    if (!receiver) {
      return;
    }
    receiver.emit('newInvite', { partyId, senderLogin });
  }

  @SubscribeMessage('addClient')
  addClient(client: Socket, userId: string) {
    this.clients.set(userId, client);
  }

  joinParty(partyId: string, userId: string): void {
    const client = this.clients.get(userId);
    if (!client) {
      return;
    }
    client.join(partyId);
  }

  leaveParty(partyId: string, userId: string): void {
    const client = this.clients.get(userId);
    if (!client) {
      return;
    }
    client.leave(partyId);
  }

  emitUserJoin(partyId: string, joinedUser: User): void {
    this.server.to(partyId).emit('userJoin', joinedUser);
  }

  emitUserLeave(partyId: string, leavedUserId: string): void {
    this.server.to(partyId).emit('userLeave', leavedUserId);
  }

  emitNewRoute(partyId: string, party: Party): void {
    this.server.to(partyId).emit('routeChanged', party);
  }

  emitNewUserLocation(partyId: string, user: User): void {
    this.server.to(partyId).emit('userPositionChanged', user);
  }
}

export default AppGateway;
