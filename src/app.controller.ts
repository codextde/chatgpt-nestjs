import {
  Controller,
  ForbiddenException,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { Body } from '@nestjs/common/decorators';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/message')
  sendMessage(
    @Query('text') text,
    @Query('conversationId') conversationId,
    @Query('authKey') authKey,
  ) {
    if (authKey !== process.env.AUTH_KEY) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    return this.appService.sendMessage(text, conversationId);
  }

  @Post('/message')
  sendPostMessage(
    @Body('text') text,
    @Body('conversationId') conversationId,
    @Body('parentMessageId') parentMessageId,
    @Query('authKey') authKey,
  ) {
    if (authKey !== process.env.AUTH_KEY) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    return this.appService.sendMessage(text, conversationId, parentMessageId);
  }
}
