import { User, Conversation } from "@prisma/client";

export interface IMembersService {
	findMemberInConversation(conversationID: number, userId: string): Promise<User>;
	addConversationInMembership(userId: number, conversationId: number);
}



