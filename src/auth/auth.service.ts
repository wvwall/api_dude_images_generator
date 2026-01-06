import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterUserDto): Promise<AuthResponse> {
    // Check if username already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { username: registerDto.username },
    });

    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(registerDto.password, SALT_ROUNDS);

    // Create the user
    const user = await this.prisma.user.create({
      data: {
        username: registerDto.username,
        password: hashedPassword,
      },
    });

    // Return user without password + access token
    const { password, ...userWithoutPassword } = user;
    void password;

    const accessToken = this.generateToken(user.id, user.username);

    return {
      user: userWithoutPassword,
      accessToken,
    };
  }

  async login(loginDto: LoginUserDto): Promise<AuthResponse> {
    // Find user by username
    const user = await this.prisma.user.findUnique({
      where: { username: loginDto.username },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Return user without password + access token
    const { password: pw, ...userWithoutPassword } = user;
    void pw;

    const accessToken = this.generateToken(user.id, user.username);

    return {
      user: userWithoutPassword,
      accessToken,
    };
  }

  private generateToken(userId: string, username: string): string {
    const payload = { sub: userId, username };
    return this.jwtService.sign(payload);
  }
}
