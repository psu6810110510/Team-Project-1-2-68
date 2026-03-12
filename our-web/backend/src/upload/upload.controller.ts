import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  PayloadTooLargeException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('upload')
export class UploadController {
  @Post('video')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/videos',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `video-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = [
          'video/mp4',
          'video/avi',
          'video/quicktime',
          'video/x-msvideo',
          'video/x-ms-wmv',
          'video/x-flv',
          'video/x-matroska',
        ];
        
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return callback(
            new BadRequestException('รองรับเฉพาะไฟล์วีดีโอ: mp4, avi, mov, wmv, flv, mkv'),
            false
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 500 * 1024 * 1024, // 500MB
      },
    }),
  )
  uploadVideo(@UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        throw new BadRequestException('ไม่พบไฟล์ที่อัปโหลด');
      }
      
      const fileUrl = `${process.env.API_URL || 'http://localhost:3000'}/uploads/videos/${file.filename}`;
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      
      console.log(`✅ อัปโหลดวีดีโอสำเร็จ: ${file.filename} (${fileSizeMB} MB)`);
      
      return {
        message: 'อัปโหลดวีดีโอสำเร็จ',
        filename: file.filename,
        url: fileUrl,
        size: fileSizeMB + ' MB',
      };
    } catch (error) {
      console.error('❌ Video upload error:', error);
      throw error;
    }
  }

  @Post('pdf')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/pdfs',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `pdf-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (file.mimetype !== 'application/pdf') {
          return callback(
            new BadRequestException('รองรับเฉพาะไฟล์ PDF เท่านั้น!'),
            false
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
      },
    }),
  )
  uploadPdf(@UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        throw new BadRequestException('ไม่พบไฟล์ PDF ที่อัปโหลด');
      }
      
      const fileUrl = `${process.env.API_URL || 'http://localhost:3000'}/uploads/pdfs/${file.filename}`;
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      
      console.log(`✅ อัปโหลด PDF สำเร็จ: ${file.filename} (${fileSizeMB} MB)`);
      
      return {
        message: 'อัปโหลด PDF สำเร็จ',
        filename: file.filename,
        url: fileUrl,
        size: fileSizeMB + ' MB',
      };
    } catch (error) {
      console.error('❌ PDF upload error:', error);
      throw error;
    }
  }
}
