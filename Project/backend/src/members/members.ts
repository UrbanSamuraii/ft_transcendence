import { User, Conversation } from "@prisma/client";

export interface IMembersService {
	findMemberInConversation(conversationID: number, userId: number): Promise<User>;
	addConversationInMembership(userId: number, conversationId: number);
}



