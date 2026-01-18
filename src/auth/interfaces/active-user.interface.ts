import { Request } from 'express';

export interface RequestUser {
  userId: string;
  username: string;
}

export interface RequestWithUser extends Request {
  user: RequestUser;
}
