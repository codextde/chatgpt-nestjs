import { Controller, Get, Post, Query } from '@nestjs/common';
import { Body } from '@nestjs/common/decorators';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService
  ) {}

  @Get('/message')
  sendMessage(@Query('text') text, @Query('conversationId') conversationId) {
    return this.appService.sendMessage(text, conversationId);
  }

  @Post('/message')
  sendPostMessage(@Body('text') text, @Query('conversationId') conversationId) {
    return this.appService.sendMessage(text, conversationId);
  }

}
