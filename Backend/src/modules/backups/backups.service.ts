import { Injectable } from '@nestjs/common';

@Injectable()
export class BackupsService {
  async createBackup() {
    return { success: true, message: 'Backup initiated' };
  }

  async listBackups() {
    return [];
  }
}
