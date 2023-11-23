import { Injectable, Req, Res, Body, ForbiddenException, HttpStatus, HttpCode, BadRequestException } from "@nestjs/common";
import { Prisma, User, Conversation} from '@prisma/client';
import { PrismaService } from "../prisma/prisma.service";
import { UserService } from "src/user/user.service";
import { ConfigService } from "@nestjs/config";
import { MembersService } from "src/members/members.service";
import { GatewaySessionManager } from "src/gateway/gateway.session";
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ConversationsService {

	constructor(private prismaService: PrismaService,
				private userService: UserService,
				private membersService: MembersService,
				private eventEmitter: EventEmitter2,
				) {}

	// To get the Conversation Name at the creation
	async establishConvName(inputDataConvName: string): Promise<string | null> {
		const name = inputDataConvName.split(/[,;'"<>]|\s/);
		const convName = name[0];
		return convName;
	}

	// To get the user - and the fact that we find it or not
	async getMemberByUsernameOrEmail(inputDataMember: string) {
		const usersArray = inputDataMember.split(/[.,;!?'"<>]|\s/);
		const email = usersArray[0];
		let member = null;
		let userFound = true;
		if (usersArray[0] !== "") {userFound = false;}
		const memberByEmail = usersArray[0] !== "" ? await this.userService.getUser({ email }) : null;
		if (memberByEmail) {
			member = memberByEmail;
			userFound = true;
		} else {
			const username = usersArray[0];
			const memberByUsername = usersArray[0] !== "" ? await this.userService.getUser({ username }) : null;
			if (memberByUsername) { 
				member = memberByUsername;
				userFound = true;
			}
		}
		return {member, userFound};
	}

	async createConversation(convName: string, userMember: User, firstInviteMember: User | null) {
		
		const existingConversation = await this.getConversationByName(convName);
		if (existingConversation) { return null; }
		
		const conversationData: Prisma.ConversationCreateInput = { name: convName };
		const createdConversation = await this.prismaService.conversation.create({data: conversationData});
		
		await this.addUserToConversation(userMember.id, createdConversation.id);
		if (firstInviteMember) {await this.addUserToConversation(firstInviteMember.id, createdConversation.id);}
		
		return createdConversation;
	}

	/////////////////// ADD / REMOVE MEMBER - ADMIN ///////////////////
	
	async addUserToConversation(userId: number, conversationId: number): Promise<boolean> {
		const existingConversation = await this.prismaService.conversation.findUnique({
			where: { id: conversationId },
			include: { members: true },
		});
		if (existingConversation) {
			const isMember = existingConversation.members.some((member) => member.id === userId);
			if (!isMember) {
				await this.prismaService.conversation.update({
					where: { id: conversationId },
					data: {
						members: {
							connect: [{ id: userId }],
						},
					},
				});
				await this.membersService.addConversationInMembership(userId, existingConversation.id);
				// const userSocket = this.sessionManager.getUserSocket(userId);
				// if (userSocket) {
					// 	userSocket.join(conversationId.toString());
					//   }
				const member = await this.userService.getUserById(userId);
				this.eventEmitter.emit('join.room', member, conversationId);
				return true;
			} else { return false; // The user was already in
			}
		}
		else {return false;}
	}

	async upgrateUserToAdmin(userId: number, conversationId: number): Promise<boolean> {
		const existingConversation = await this.prismaService.conversation.findUnique({
			where: { id: conversationId },
			include: { members: true, admins: true },
		});
		if (existingConversation) {
			const isMember = existingConversation.members.some((member) => member.id === userId);
			if (isMember) {
				const isAdmin = existingConversation.admins.some((admin) => admin.id === userId);
				if (!isAdmin) {
					await this.prismaService.conversation.update({
						where: { id: conversationId },
						data: {
							admins: {
								connect: [{ id: userId }],
							},
						},
					});
				};
				await this.membersService.addConversationInAdministratedList(userId, existingConversation.id);
				return true; // The user has been added to the admin list
			} else { return false; // The user was already in
			}
		}
		else {return false;}
	}
	
	async removeMemberFromConversation(userId: number, conversationId: number): Promise<boolean> {
		const existingConversation = await this.prismaService.conversation.findUnique({
		  where: { id: conversationId },
		  include: { members: true },
		});
		if (existingConversation) {
			const isMember = existingConversation.members.some((member) => member.id === userId);
			if (isMember) {
				await this.prismaService.conversation.update({
					where: { id: conversationId },
					data: {
						members: {
							disconnect: [{ id: userId }],
						},
					},
				});
				await this.membersService.removeConversationFromMembership(userId, existingConversation.id);
				
				const member = await this.userService.getUserById(userId);
				this.eventEmitter.emit('leave.room', member, conversationId);
				return true; // The user has been removed
			} else { return false; // The user was not a member of this conversation
			}
		} else {
			return false; // We haven t found the conversation
		}
	}

	async downgradeAdminStatus(userId: number, conversationId: number): Promise<boolean> {
		const existingConversation = await this.prismaService.conversation.findUnique({
		  where: { id: conversationId },
		  include: { members: true, admins: true },
		});
		if (existingConversation) {
			const isMember = existingConversation.members.some((member) => member.id === userId);
			if (isMember) {
				const isAdmin = existingConversation.admins.some((admin) => admin.id === userId);
				if (isAdmin) {
					await this.prismaService.conversation.update({
						where: { id: conversationId },
						data: {
							admins: {
								disconnect: [{ id: userId }],
							},
						},
					});
					await this.membersService.removeAdminStatus(userId, existingConversation.id);
					return true; // The user has been removed from the admin List
				}
			} else {
				return false; // The user was not an admin of this conversation
			}
		} else {
			return false; // We haven t found the conversation
		}
	}

	/////////////////// ADD / REMOVE MUTED - BANNED ///////////////////

	async muteMemberFromConversation(userId: number, conversationId: number): Promise<boolean> {
		const existingConversation = await this.prismaService.conversation.findUnique({
			where: { id: conversationId },
			include: { members: true, muted: true },
		});
		if (existingConversation) {
			const isMember = existingConversation.members.some((member) => member.id === userId);
			if (isMember) {
				const isMuted = existingConversation.muted.some((muted) => muted.id === userId);
				if (!isMuted) {	
					await this.prismaService.conversation.update({
						where: { id: conversationId },
						data: {
							muted: {
								connect: [{ id: userId }],
							},
						},
					});
					await this.membersService.addMemberToMutedList(userId, existingConversation.id);
					return true;
				}
			} else { return false; }
		}
		else {return false;}
	}

	async removeMemberFromMutedList(userId: number, conversationId: number): Promise<boolean> {
		const existingConversation = await this.prismaService.conversation.findUnique({
			where: { id: conversationId },
			include: { members: true, muted: true },
		});
		if (existingConversation) {
			const isMember = existingConversation.members.some((member) => member.id === userId);
			if (isMember) {
				const isMuted = existingConversation.muted.some((muted) => muted.id === userId);
				if (isMuted) {
					await this.prismaService.conversation.update({
						where: { id: conversationId },
						data: {
							muted: {
								disconnect: [{ id: userId }],
							},
						},
					});
					await this.membersService.removeMutedStatus(userId, existingConversation.id);
					return true;
				}
			} else {
				return false;
			}
		} else {
			return false;
		}
	}

	async banUserFromConversation(userId: number, conversationId: number): Promise<boolean> {
		const existingConversation = await this.prismaService.conversation.findUnique({
			where: { id: conversationId },
			include: { banned: true },
		});
		const userToBan = await this.userService.getUserById(userId);
		if (userToBan && existingConversation) {
			const isBanned = existingConversation.banned.some((banned) => banned.id === userId);
			if (!isBanned) {	
				await this.prismaService.conversation.update({
					where: { id: conversationId },
					data: {
						banned: {
							connect: [{ id: userId }],
						},
					},
				});
				await this.userService.addMemberToBannedList(userId, existingConversation.id);
			return true; }
		}
		else { return false; }
	}

	async isUserBanned(userToAdd: User, conversationId: number): Promise<boolean> {
		const conversation = await this.prismaService.conversation.findUnique({
		  where: { id: conversationId },
		  include: { banned: { where: { id: userToAdd.id } } },
		});
		return !!conversation?.banned.length;
    }

	/////////////////// MESSAGE SERVICE ///////////////////

	async addMessageToConversation(conversationId: number, newMessageId: number) {
		const conversation = await this.prismaService.conversation.findUnique({
			where: { id: conversationId },
			include: { members: true, messages: true },
		});

		const updatedConversation = await this.prismaService.conversation.update({
			where: { id: conversation.id },
			data: {
			messages: {
				connect: {
				id: newMessageId,
				},
			},
			},
		});
	}

	async updateConversationDate(conversationId: number) {
		await this.prismaService.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
        });
	}

	async deleteMessageFromConversation(conversationId: number, messageToDeleteId: number) {
		await this.prismaService.message.delete({
		  where: {
			id: messageToDeleteId,
		  	},
		});
	}

	/////////////////// GETTERS /////////////////// 

	async getConversationNameById(convId: number) {
		const conversation = await this.prismaService.conversation.findUnique({
			where: { id: convId },
		});
		return conversation?.name;
	}
	
	async getConversationByName(convName: string) {
		return await this.prismaService.conversation.findUnique({
			where: { name: convName },
			include: { members: true },
		});
	}
	
	async getConversationWithAllMessagesById(convId: number) {
		return await this.prismaService.conversation.findUnique({
			where: { id: convId },
			include: { members: { select : {
				id: true,
          		first_name: true,
          		last_name: true,
          		email: true,
          		username: true,
          		img_url: true,
				isRegistered: true,
				status: true,
					}, 
				},
				messages: { orderBy: { updatedAt: 'desc' },
				include: {
					author: {
					  select: {
						id: true
					  }
					}
				  }
				},
			},
		});
	}

	async getConversationMembers(conversationId: number): Promise<User[]> {
		const conversation = await this.prismaService.conversation.findUnique({
			where: { id: conversationId },
			include: { members: true },
		});
		
		if (conversation) {
			return conversation.members;
		} else { // Not sure it is usefull, we will check this into a conversation directly
			return [];
		}
	}

	
}	  
	  
	  
	  
	  
	  
































// async createConversation(name: string, sub: number) {
// 	const existingConversation = this.prismaService.conversation.findFirst({
// 		where: {
// 			name,
// 		}
// 	});
// 	if (existingConversation) {
// 		throw new BadRequestException({name : "Conversation already exist"})
// 	}
// 	return this.prismaService.conversation.create({
// 		data: {
// 			name,
// 			members: {
// 				connect: {
// 					id: sub,   	// For now we just have our user creating the conv who is in it and we are going to add user 
// 								// 1 by 1. If at the end there is only one user -> we are gonna delete the conversation
// 				}
// 			}
// 		}
// 	})
// }

