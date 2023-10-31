export type User = {
	username: string;
}

export type ConversationType = {
	id: number;
	name: string;
	messages: string[];
	members: User[];
}

