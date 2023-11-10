import { Injectable } from "@nestjs/common";
import { AuthenticatedSocket } from "../utils/interfaces";


export interface IGatewaySession {
	getSocket(id: string);
}

@Injectable()
export class GatewaySessionManager implements IGatewaySession {
	// set to map our user id to the socket and the data associated
	private readonly sessions: Map<string, AuthenticatedSocket> = new Map();
	
	getSocket(id: string) {
		return this.sessions.get(id);
	}

	setUserSocket(userId: string, socket: AuthenticatedSocket) {
		this.sessions.set(userId, socket);
	}

	removeUserSocket(userId: string) {
		this.sessions.delete(userId);
	}

	getSockets(): Map<string, AuthenticatedSocket> {
		return this.sessions;
	}
}