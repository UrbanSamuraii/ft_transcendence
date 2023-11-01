import { User } from "@prisma/client";

export interface IMembersService {
	findMemberInConversation(conversationID: number, userId: number): Promise<User>;
	addConversationInMembership(userId: number, conversationId: number);
	removeConversationFromMembership(userId: number, conversationId: number);
	getMemberWithConversationsHeIsMemberOf(user: User);
}



