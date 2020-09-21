import { WebSocketGateway, OnGatewayConnection, WebSocketServer } from '@nestjs/websockets';

@WebSocketGateway()
class AppGateway implements OnGatewayConnection {
  @WebSocketServer()
  private readonly server: any;

  handleConnection(client: any): void {
    client.emit('connection');
  }
}

export default AppGateway;
