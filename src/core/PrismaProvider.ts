import { PrismaClient } from '@prisma/client';

class PrismaProvider {
  private static client: PrismaClient = new PrismaClient();

  public static getClient(): PrismaClient {
    return PrismaProvider.client;
  }
}

export default PrismaProvider;
