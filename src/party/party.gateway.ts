import {
  WebSocketGateway,
  OnGatewayConnection,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import UserService from 'src/user/user.service';
import Party from '../entity/Party';
import User from '../entity/User';

@WebSocketGateway()
class PartyGateway implements OnGatewayConnection {
  @WebSocketServer()
  private readonly server!: Server;

  private readonly clients: Map<string, Socket> = new Map<string, Socket>();

  constructor(private readonly userService: UserService) {}

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
  addClient(client: Socket, clientInfo: { userId: string; partyId: string }) {
    const { partyId, userId } = clientInfo;
    client.join(partyId);
    this.clients.set(userId, client);
  }

  @SubscribeMessage('changeCurrentPosition')
  async emitNewUserLocation(
    client: Socket,
    postionInfo: { partyId: string; clientUser: User },
  ): Promise<void> {
    const { partyId, clientUser } = postionInfo;
    if (!partyId || !clientUser) {
      return;
    }
    client.to(partyId).emit('userPositionChanged', clientUser);
    const user = await this.userService.getById(clientUser.id);
    if (!user) {
      return;
    }
    user.currentLatitude = clientUser.currentLatitude;
    user.currentLongitude = clientUser.currentLongitude;
    await this.userService.update(user);
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
}

export default PartyGateway;
