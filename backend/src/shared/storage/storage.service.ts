import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

export interface StorageResult {
  path: string;
  url: string;
  size: number;
  mimeType: string;
}

export interface FileMetadata {
  size: number;
  mimeType: string;
  originalName: string;
}

export abstract class StorageService {
  abstract upload(buffer: Buffer, folder: string, metadata: FileMetadata): Promise<StorageResult>;
  abstract getSignedUrl(filePath: string, expiresInSeconds: number): Promise<string>;
  abstract delete(filePath: string): Promise<void>;
}

@Injectable()
export class LocalStorageService extends StorageService {
  private readonly basePath: string;

  constructor(private readonly config: ConfigService) {
    super();
    this.basePath = path.resolve(this.config.get<string>('storage.localPath') ?? './uploads');
    fs.mkdirSync(this.basePath, { recursive: true });
  }

  async upload(buffer: Buffer, filePath: string, metadata: FileMetadata): Promise<StorageResult> {
    const fullPath = path.join(this.basePath, filePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, buffer);
    return {
      path: filePath,
      url: `/uploads/${filePath}`,
      size: metadata.size,
      mimeType: metadata.mimeType,
    };
  }

  async getSignedUrl(filePath: string, _expiresInSeconds: number): Promise<string> {
    return `/uploads/${filePath}`;
  }

  async delete(filePath: string): Promise<void> {
    const fullPath = path.join(this.basePath, filePath);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  }
}
