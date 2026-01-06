import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
// import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // 1. Crea un pool di connessioni con pg
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    // 2. Crea l'adapter per Prisma 7
    const adapter = new PrismaPg(pool);

    // 3. Passa l'adapter al costruttore della classe base
    super({ adapter });
  }
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
