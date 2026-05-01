import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import * as os from 'os';

@Injectable()
export class SystemService {
  constructor(@InjectConnection() private connection: Connection) {}

  async getDatabaseStats() {
    const db = this.connection.db!;
    const collections = await db.listCollections().toArray();
    const stats: any = {};

    for (const col of collections) {
      const colStats = await db.command({ collStats: col.name });
      stats[col.name] = {
        count: colStats.count,
        size: colStats.size,
        avgObjSize: colStats.avgObjSize
      };
    }

    return stats;
  }

  getHealth() {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: os.loadavg(),
      platform: os.platform(),
      timestamp: new Date()
    };
  }
}
