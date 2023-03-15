import {
  Controller, Get,
  HttpException,
  HttpStatus,
  Post,
  Query
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
    @Query('parentMessageId') parentMessageId,
    @Query('authKey') authKey,
    @Query('chatGpt') chatGpt,
    @Query('model') model,

  ) {
    if (authKey !== process.env.AUTH_KEY) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    chatGpt == 'true' ? chatGpt = true : chatGpt = false;
    return this.appService.sendMessage(text, conversationId, parentMessageId, chatGpt, model);
  }

  @Post('/message')
  sendPostMessage(
    @Body('text') text,
    @Body('conversationId') conversationId,
    @Body('parentMessageId') parentMessageId,
    @Query('authKey') authKey,
    @Query('chatGpt') chatGpt,
    @Query('model') model,
  ) {
    if (authKey !== process.env.AUTH_KEY) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    chatGpt == 'true' ? chatGpt = true : chatGpt = false;
    return this.appService.sendMessage(text, conversationId, parentMessageId, chatGpt, model);
  }
}
