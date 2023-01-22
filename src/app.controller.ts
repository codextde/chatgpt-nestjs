import { Controller, Get, Post, Query } from '@nestjs/common';
import { Body } from '@nestjs/common/decorators';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/sendMessage')
  sendMessage(
    @Query('text') text,
    @Query('conversationId') conversationId,
    @Query('messageId') messageId,
  ) {
    return this.appService.sendMessageQueue(text, conversationId, messageId);
  }

  @Post('/sendMessage')
  sendPostMessage(
    @Body('text') text,
    @Query('conversationId') conversationId,
    @Query('messageId') messageId,
  ) {
    return this.appService.sendMessageQueue(text, conversationId, messageId);
  }
}
