export type User = {
	username: string;
}


export type ConversationType = {
	id: number;
	name: string;
	messages: { message: string }[];
	members: User[];
}

