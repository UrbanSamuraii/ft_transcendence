import { IoAdapter } from "@nestjs/platform-socket.io";
import { AuthenticatedSocket } from "src/utils/interfaces";
// import { JwtService } from "@nestjs/jwt";

export class WebsocketAdapter extends IoAdapter {


    // private readonly jwtService: JwtService;

    createIOServer(port: number, options?: any) {

        const server = super.createIOServer(port, options);

        server.use(async (socket: AuthenticatedSocket, next) => {
            // console.log('Inside our WebSocketAdapter Middleware');
            const cookie = socket.handshake.headers.cookie;
            // if (!cookie) {
            // 	console.log('Client has no cookie ...');
            // 	return next(new Error('Not Authenticated'));
            // }
            // const token = cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1];
            // const decoded = this.jwtService.verify(token);
            // if (!decoded) {
            // 	console.log('Client has wrong token ...');
            // 	return next(new Error('Not Authenticated'));
            // }
            next();
        });


        return server;
    }
}