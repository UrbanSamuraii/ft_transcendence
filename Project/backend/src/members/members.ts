import { User } from "@prisma/client";

export interface IMembersService {
	findMemberInConversation(conversationID: number, userId: string): Promise<User>;
	addMember(conversationID: number, userId: string): Promise<User>;
}



