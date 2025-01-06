import {
  Controller, Delete,
  ForbiddenException, Get,
  NotFoundException, Param,
  Post,
  UnsupportedMediaTypeException,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor, File } from '@nest-lab/fastify-multer';
import { FilesService } from './files.service';
import { UsersService } from '../users/users.service';
import { RequireAuth } from '@auth/auth.decorator';
import { TokenPayload } from '@app/types/auth/Token';
import { TokenData } from '@auth/token.decorator';
import { ErrorCode } from '@app/types/ErrorCode.enum';
import sharp from 'sharp';
import crypto from 'node:crypto';
import { mimeToExtension } from '@app/types/files.interface';
import { UploadedFileResultDTO } from '@dto/UploadedFileResultDTO';
import { FilesQuotaDTO } from '@dto/FilesQuotaDTO';

@Controller('files')
export class FilesController {
  constructor(
    private readonly files: FilesService,
    private readonly users: UsersService,
  ) {}

  @Post()
  @RequireAuth()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: File, @TokenData() token: TokenPayload): Promise<UploadedFileResultDTO> {
    const user = await this.users.getRawUser(token.id);

    if (!user)
      throw new NotFoundException({
        code: ErrorCode.UserNotFound,
      });

    if (user.uploadedFiles +1 > user.filesLimit)
      throw new ForbiddenException({
        code: ErrorCode.UserFilesLimitReached,
      });

    if (!mimeToExtension[file.mimetype])
      throw new UnsupportedMediaTypeException();
    const hash = crypto.randomBytes(16).toString('hex');

    const compressed = await sharp(file.buffer)
      .webp({ quality: 80 })
      .toBuffer();

    await this.files.uploadFile(
      token.id,
      hash + '.webp',
      compressed,
    );

    user.uploadedFiles += 1;
    void this.users.updateRawUser(user);

    return {
      hash: hash + '.webp',
      remainingFiles: user.filesLimit - user.uploadedFiles,
    };
  }

  @Delete('/:hash')
  @RequireAuth()
  async deleteFile(@Param('hash') hash: string, @TokenData() token: TokenPayload) {
    const user = await this.users.getRawUser(token.id);

    if (!user)
      throw new NotFoundException({
        code: ErrorCode.UserNotFound,
      });

    await this.files.deleteFile(token.id, hash);

    user.uploadedFiles -= 1;
    void this.users.updateRawUser(user);

    return {
      ok: true,
    };
  }

  @Get('/quota')
  @RequireAuth()
  async getQuota(@TokenData() token: TokenPayload): Promise<FilesQuotaDTO> {
    const user = await this.users.getRawUser(token.id);

    if (!user)
      throw new NotFoundException({
        code: ErrorCode.UserNotFound,
      });

    return {
      limit: user.filesLimit,
      uploaded: user.uploadedFiles,
      remaining: user.filesLimit - user.uploadedFiles,
    };
  }
}
