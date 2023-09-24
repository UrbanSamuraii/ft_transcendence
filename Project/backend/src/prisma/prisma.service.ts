import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

// Implement the logic to connect to the database

@Injectable()
export class PrismaService extends PrismaClient{
	constructor(config: ConfigService) {
		super( {
			datasources: {
				db:	{
					url: config.get('DATABASE_URL'),
				},
			},
		});
	}
}
