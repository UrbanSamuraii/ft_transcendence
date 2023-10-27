import { Injectable, Req, Res, Body, ForbiddenException, HttpStatus, HttpCode } from "@nestjs/common";
import { Prisma, User } from '@prisma/client';
import { PrismaService } from "../prisma/prisma.service";
import { HttpException } from '@nestjs/common';

@Injectable()
export class ConversationsService {}

