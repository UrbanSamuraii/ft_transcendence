export type ConversationType = {
	id: number;
	name: string;
	lastMessage: string;
}

export type User = {
	id: number;
	username: string;
	first_name: string;
	last_name: string;
}

export type Conversation = {
	id: number;
	members: User[];
}
