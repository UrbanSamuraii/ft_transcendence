import { Injectable, NotFoundException } from "@nestjs/common";
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

	async createConversation(convName: string, userMember: User, invitedMembers: User[] | null) {
		
		const existingConversation = await this.getConversationByName(convName);
		if (existingConversation) { return null; }
		
		const conversationData: Prisma.ConversationCreateInput = { 
			name: convName,
			owner: { connect: { id: userMember.id } },
			admins: { connect: { id: userMember.id } },
			members: { connect: { id: userMember.id } },
		};
		const createdConversation = await this.prismaService.conversation.create({data: conversationData});
		if (invitedMembers) {
			for (const invitedMember of invitedMembers) {
				const isAlreadyMember = await this.isMemberOfTheConversation(invitedMember.id, createdConversation.id);
				if (!isAlreadyMember) {
					await this.addUserToConversation(invitedMember.id, createdConversation.id); }
			}}
		return createdConversation;
	}

	async isOwnerOfTheConversation(userIdTargeted: number, conversationId: number): Promise<boolean> {
		const conversation = await this.prismaService.conversation.findUnique({
			where: { id: conversationId },
			include: { owner: { where: { id: userIdTargeted }} },
		  });
		  return !!conversation?.owner;
	}

	async isMemberOfTheConversation(userIdTargeted: number, conversationId: number): Promise<boolean> {
		const conversation = await this.prismaService.conversation.findUnique({
			where: { id: conversationId },
			include: { members: true },
		  });
		  return !!conversation?.members.find(member => member.id === userIdTargeted);
	}
	
  
	/////////////////// ADD / REMOVE MEMBER - ADMIN ///////////////////
	
	async addUserToConversation(userId: number, conversationId: number): Promise<boolean> {
		const existingConversation = await this.prismaService.conversation.findUnique({
			where: { id: conversationId },
			include: { members: true },
		});
		if (existingConversation) {
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
				const member = await this.userService.getUserById(userId);
				this.eventEmitter.emit('join.room', member, conversationId);
				return true;
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
				const isOwner = await this.isOwnerOfTheConversation(userId, conversationId)
				console.log({"is owner to remove ?": isOwner});
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
				const isOwner = await this.isOwnerOfTheConversation(userId, conversationId)
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
				const isOwner = await this.isOwnerOfTheConversation(userId, conversationId)
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
			const isOwner = await this.isOwnerOfTheConversation(userId, conversationId)
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
	
		const currentConversation = await this.prismaService.conversation.findUnique({
			where: { id: conversationId },
			include: { messages: true },
		});
		if (!currentConversation) {
			throw new Error(`Conversation with id ${conversationId} not found.`);}
	
		const updatedMessages = currentConversation.messages.filter(
			(message) => message.id !== messageToDeleteId
		);	
		const updatedConversation = await this.prismaService.conversation.update({
			where: { id: conversationId },
			data: {
				messages: {
					set: updatedMessages,
				},
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

	async getConversationById(convId: number): Promise<Conversation | null> {
		return await this.prismaService.conversation.findUnique({
			where: { id: convId },
		});
	}
	
	async getConversationWithAllMessagesById(convId: number) {

		const conversationFound = await this.prismaService.conversation.findUnique({
			where: { id: convId },
			include: { messages: true },
		  });
		if (!conversationFound) { return null; }
		else {
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
	}

	async getConversationMembers(conversationId: number): Promise<User[] | null> {
		const conversation = await this.prismaService.conversation.findUnique({
			where: { id: conversationId },
			include: { members: true },
		});
		
		if (conversation) {
			return conversation.members;
		} else { // Not sure it is usefull, we will check this into a conversation directly
			return null;
		}
	}

	// To return the members' list - excluding myself
	async getConversationOtherMembers(conversationId: number, userIdToExclude: number): Promise<User[] | null> {
		const conversation = await this.prismaService.conversation.findUnique({
		  where: { id: conversationId },
		  include: { members: true },
		});
	  
		if (conversation) {
		  const membersWithoutUser = conversation.members.filter((member) => member.id !== userIdToExclude);
		  return membersWithoutUser; 
		} 
		else { return null; }
	}

	async getBannedUsers(conversationId: number): Promise<User[] | null> {
		const conversation = await this.prismaService.conversation.findUnique({
			where: { id: conversationId },
			include: { banned: true },
		});
		
		if (conversation) {
			return conversation.banned;
		} else { // Not sure it is usefull, we will check this into a conversation directly
			return null;
		}
	}

	async getOwner(conversationId: number): Promise<User | null> {
		const conversation = await this.prismaService.conversation.findUnique({
			where: { id: conversationId },
		});
		if (conversation) {
			const owner = await this.userService.getUserById(conversation.ownerId);
			return owner; }
		else { return null; }
	}

	// To get privacy : Public or Private
	async getStatus(conversationId: number): Promise<String | null> {
		const conversation = await this.prismaService.conversation.findUnique({
			where: { id: conversationId },
		});
		if (conversation) { return conversation.privacy; }
		else { return null; }
	}

	// To know if protected or not by a password
	async isProtected(conversationId: number): Promise<boolean | null> {
		const conversation = await this.prismaService.conversation.findUnique({
			where: { id: conversationId },
		});
		if (conversation) { return conversation.protected; }
		else { return null; }
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
