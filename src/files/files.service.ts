import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3,
} from '@aws-sdk/client-s3';
import { extensionToMime } from '@app/types/files.interface';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private readonly s3: S3;

  constructor(private readonly config: ConfigService) {
    this.s3 = new S3({
      region: config.getOrThrow('S3_REGION'),
      endpoint: config.getOrThrow('S3_ENDPOINT'),
      credentials: {
        accessKeyId: config.getOrThrow('S3_ACCESS_KEY_ID'),
        secretAccessKey: config.getOrThrow('S3_SECRET_ACCESS_KEY'),
      },
    });
  }

  async uploadFile(user: string, hash: string, file: Buffer) {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.config.getOrThrow('S3_BUCKET'),
        Key: `images/${user}_${hash}`,
        Body: file,
        ContentType: extensionToMime[hash.split('.').at(-1)!],
      }),
    );

    this.logger.log(`Uploaded new file by ${user}`);
  }

  async deleteFile(user: string, hash: string) {
    const filesList = await this.s3.send(
      new ListObjectsV2Command({
        Bucket: this.config.getOrThrow('S3_BUCKET'),
        Prefix: `images/${user}_${hash}`,
      }),
    );

    if (filesList.Contents && filesList.Contents.length > 0)
      for (const file of filesList.Contents)
        if (file.Key) {
          await this.s3.send(
            new DeleteObjectCommand({
              Bucket: this.config.getOrThrow('S3_BUCKET'),
              Key: file.Key,
            }),
          );
          this.logger.log(`Deleted file from user ${user} with hash ${hash}`);
        }
  }
}
