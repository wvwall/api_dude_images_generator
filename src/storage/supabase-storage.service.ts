import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Logger } from 'nestjs-pino';
import { randomUUID } from 'crypto';
import { extname } from 'path';

export interface UploadResult {
  path: string;
  publicUrl: string;
}

export interface FileBuffer {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

@Injectable()
export class SupabaseStorageService {
  private supabase: SupabaseClient<any, any, any>;
  private readonly bucket = 'dude_generator_storage';
  private readonly folder = 'images';

  constructor(
    private readonly config: ConfigService,
    private readonly logger: Logger,
  ) {
    const supabaseUrl = this.config.get<string>('SUPABASE_URL');
    const supabaseKey = this.config.get<string>('SUPABASE_SERVICE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY must be defined');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async upload(file: FileBuffer): Promise<UploadResult> {
    const uuid = randomUUID();
    const ext = extname(file.originalname);
    const filename = `${uuid}${ext}`;
    const path = `${this.folder}/${filename}`;

    this.logger.log(`Uploading file to Supabase: ${path}`);

    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      this.logger.error(`Failed to upload file to Supabase: ${error.message}`);
      throw new InternalServerErrorException(
        `Failed to upload file: ${error.message}`,
      );
    }

    const { data: urlData } = this.supabase.storage
      .from(this.bucket)
      .getPublicUrl(path);

    this.logger.log(`File uploaded successfully: ${urlData.publicUrl}`);

    return {
      path,
      publicUrl: urlData.publicUrl,
    };
  }

  async delete(path: string): Promise<void> {
    this.logger.log(`Deleting file from Supabase: ${path}`);

    const { error } = await this.supabase.storage
      .from(this.bucket)
      .remove([path]);

    if (error) {
      this.logger.error(
        `Failed to delete file from Supabase: ${error.message}`,
      );
    } else {
      this.logger.log(`File deleted successfully: ${path}`);
    }
  }

  extractPathFromUrl(publicUrl: string): string | null {
    try {
      const url = new URL(publicUrl);
      const pathParts = url.pathname.split('/');
      const bucketIndex = pathParts.indexOf(this.bucket);
      if (bucketIndex !== -1) {
        return pathParts.slice(bucketIndex + 1).join('/');
      }
      return null;
    } catch {
      return null;
    }
  }
}
