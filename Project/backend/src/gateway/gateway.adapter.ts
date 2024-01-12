import { IoAdapter } from "@nestjs/platform-socket.io";
import { AuthenticatedSocket } from "src/utils/interfaces";

export class WebsocketAdapter extends IoAdapter {

    createIOServer(port: number, options?: any) {

        const server = super.createIOServer(port, options);

        server.use(async (socket: AuthenticatedSocket, next) => {
            const cookie = socket.handshake.headers.cookie;
            next();
        });

        server.on('pong', (client: AuthenticatedSocket) => {
            console.log(`Received pong from user ${client.user?.id}`);
        })

        return server;
    }
}