import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Logger } from 'nestjs-pino';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from '@prisma/client';

export type UserWithoutPassword = Omit<User, 'password'>;

export interface AuthResponse {
  user: UserWithoutPassword;
  accessToken: string;
}

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly logger: Logger,
  ) {}

  async register(registerDto: RegisterUserDto): Promise<AuthResponse> {
    try {
      this.logger.log(`Registering user: ${registerDto.username}`);

      const existingUser = await this.prisma.user.findUnique({
        where: { username: registerDto.username },
      });

      if (existingUser) {
        this.logger.warn(`Username already exists: ${registerDto.username}`);
        throw new ConflictException('Username already exists');
      }

      const hashedPassword = await bcrypt.hash(
        registerDto.password,
        SALT_ROUNDS,
      );

      const user = await this.prisma.user.create({
        data: {
          username: registerDto.username,
          password: hashedPassword,
        },
      });

      const { password, ...userWithoutPassword } = user;
      void password;

      const accessToken = this.generateToken(user.id, user.username);

      this.logger.log(`User registered successfully: ${user.id}`);

      return {
        user: userWithoutPassword,
        accessToken,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(
        `Failed to register user: ${registerDto.username}`,
        error,
      );
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  async login(loginDto: LoginUserDto): Promise<AuthResponse> {
    try {
      this.logger.log(`Login attempt for user: ${loginDto.username}`);

      const user = await this.prisma.user.findUnique({
        where: { username: loginDto.username },
      });

      if (!user) {
        this.logger.warn(`Login failed - user not found: ${loginDto.username}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(
        loginDto.password,
        user.password,
      );

      if (!isPasswordValid) {
        this.logger.warn(
          `Login failed - invalid password for user: ${loginDto.username}`,
        );
        throw new UnauthorizedException('Invalid credentials');
      }

      const { password: pw, ...userWithoutPassword } = user;
      void pw;

      const accessToken = this.generateToken(user.id, user.username);

      this.logger.log(`User logged in successfully: ${user.id}`);

      return {
        user: userWithoutPassword,
        accessToken,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(`Failed to login user: ${loginDto.username}`, error);
      throw new InternalServerErrorException('Failed to login');
    }
  }

  private generateToken(userId: string, username: string): string {
    const payload = { sub: userId, username };
    return this.jwtService.sign(payload);
  }
}
