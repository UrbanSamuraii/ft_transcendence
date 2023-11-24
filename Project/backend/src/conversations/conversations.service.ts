import { Injectable, Req, Res, Body, ForbiddenException, HttpStatus, HttpCode, BadRequestException } from "@nestjs/common";
import { Prisma, User, Conversation, privacy_t} from '@prisma/client';
import { PrismaService } from "../prisma/prisma.service";
import { UserService } from "src/user/user.service";
import { MembersService } from "src/members/members.service";
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
		
		const conversationData: Prisma.ConversationCreateInput = { 
			name: convName,
			owner: { connect: { id: userMember.id } },
			admins: { connect: { id: userMember.id } },
			members: { connect: { id: userMember.id } },
		};
		const createdConversation = await this.prismaService.conversation.create({data: conversationData});
		
		if (firstInviteMember) {await this.addUserToConversation(firstInviteMember.id, createdConversation.id);}
		
		return createdConversation;
	}

	async isOwnerOfTheConversation(userIdTargeted: number, conversationId: number): Promise<boolean> {
		const conversation = await this.prismaService.conversation.findUnique({
			where: { id: conversationId },
			include: { owner: { where: { id: userIdTargeted }} },
		  });
		  return !!conversation?.owner;
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
				const isBanned = await this.isUserIdBannedFromConversation(userId, conversationId);
				if (isBanned) { return false; }
				await this.prismaService.conversation.update({
					where: { id: conversationId },
					data: {
						members: {
							connect: [{ id: userId }],
						},
					},
				});
				// await this.membersService.addConversationInMembership(userId, existingConversation.id);
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
				// await this.membersService.addConversationInAdministratedList(userId, existingConversation.id);
				return true;
			} else { return false;
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
				const isOwner = this.isOwnerOfTheConversation(userId, conversationId)
				if (isOwner) { return false; }
				await this.downgradeAdminStatus(userId, conversationId); // remove the user from the admin list of the conv before
				await this.prismaService.conversation.update({
					where: { id: conversationId },
					data: {
						members: {
							disconnect: [{ id: userId }],
						},
					},
				});
				// await this.membersService.removeConversationFromMembership(userId, existingConversation.id);
				
				const member = await this.userService.getUserById(userId);
				this.eventEmitter.emit('leave.room', member, conversationId);
				return true; 
			} else { return false;
			}
		} else {
			return false;
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
				const isOwner = this.isOwnerOfTheConversation(userId, conversationId)
				if (isOwner) { return false; }
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
					// await this.membersService.removeAdminStatus(userId, existingConversation.id);
					return true;
				}
			} else {
				return false;
			}
		} else {
			return false;
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
				const isOwner = this.isOwnerOfTheConversation(userId, conversationId)
				if (isOwner) { return false; }
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
					// await this.membersService.addMemberToMutedList(userId, existingConversation.id);
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
					// await this.membersService.removeMutedStatus(userId, existingConversation.id);
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
			const isOwner = this.isOwnerOfTheConversation(userId, conversationId)
				if (isOwner) { return false; }
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
				await this.removeMemberFromConversation(userId, conversationId); // If the user was member of the conv, let s remove him from it
			return true; }
		}
		else { return false; }
	}

	async removeUserFromBannedList(userId: number, conversationId: number): Promise<boolean> {
		const existingConversation = await this.prismaService.conversation.findUnique({
			where: { id: conversationId },
			include: { banned: true },
		});
		const userToAllow = await this.userService.getUserById(userId);
		if (existingConversation && userToAllow) {
			const isAllow = existingConversation.banned.some((banned) => banned.id === userId);
			if (isAllow) {
				await this.prismaService.conversation.update({
					where: { id: conversationId },
					data: {
						banned: {
							disconnect: [{ id: userId }],
						},
					},
				});
				return true;
			}
		} else {
			return false;
		}
	}

	async isUserBannedFromConversation(userToAdd: User, conversationId: number): Promise<boolean> {
		const conversation = await this.prismaService.conversation.findUnique({
		  where: { id: conversationId },
		  include: { banned: { where: { id: userToAdd.id } } },
		});
		return !!conversation?.banned.length;
    }

	async isUserIdBannedFromConversation(userIdToAdd: number, conversationId: number): Promise<boolean> {
		const conversation = await this.prismaService.conversation.findUnique({
		  where: { id: conversationId },
		  include: { banned: { where: { id: userIdToAdd }} },
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
	
	async getConversationByName(convName: string): Promise<Conversation | null> {
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

	async getPassword(conversationId: number): Promise<String | null> {
		const conversation = await this.prismaService.conversation.findUnique({
			where: { id: conversationId },
		});
		if (conversation.protected) { return conversation.password; }
		else { return null; }
	}

	/////////////////// SETTERS /////////////////// 

	async setPassword(newPassword: string, conversationId: number): Promise<boolean> {
		if (newPassword != null) { await this.prismaService.conversation.update({
            where: { id: conversationId },
            data: { protected: true, password: newPassword },
        }); return true; }
		else if (newPassword === null) { await this.prismaService.conversation.update({
            where: { id: conversationId },
            data: { protected: false, password: null },
        }); return false; }
	}

	async setConversationPrivate(conversationId: number) {
		await this.prismaService.conversation.update({
            where: { id: conversationId },
            data: { privacy: privacy_t.PRIVATE },
        });
	}

	async setConversationPublic(conversationId: number) {
		await this.prismaService.conversation.update({
            where: { id: conversationId },
            data: { privacy: privacy_t.PUBLIC },
        });
	}
}	  
