import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from '@prisma/client';

export type UserWithoutPassword = Omit<User, 'password'>;

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(registerDto: RegisterUserDto): Promise<UserWithoutPassword> {
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

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    void password;
    return userWithoutPassword;
  }

  async login(loginDto: LoginUserDto): Promise<UserWithoutPassword> {
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

    // Return user without password
    const { password: pw, ...userWithoutPassword } = user;
    void pw;
    return userWithoutPassword;
  }
}
