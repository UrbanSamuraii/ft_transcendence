import { User } from "@prisma/client";

export interface IMembersService {
	findMember(id: string): Promise<User>;
	addMember(): Promise<User>;
}



