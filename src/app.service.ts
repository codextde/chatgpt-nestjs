import { Injectable, OnModuleInit } from '@nestjs/common';
import { dynamicImport } from 'tsimportlib';

import { Cron, CronExpression } from '@nestjs/schedule';
import ChatGPT from 'chatgpt-io';
import { ChatGPTAPIBrowser, ChatResponse } from 'chatgpt';

@Injectable()
export class AppService implements OnModuleInit {
  // ChatGPT User
  config = {
    email: process.env.EMAIL,
    password: process.env.PASSWORD,
    debug: false,
    minimize: true,
    markdown: true,
    nopechaKey: process.env.NOPECHA_KEY,
  };

  api: ChatGPTAPIBrowser;
  botNew: ChatGPT;

  newBot: boolean = true;

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    if (this.api && !this.newBot) {
      await this.api.refreshSession();
    }
  }

  async onModuleInit() {
    if (this.newBot) {
      const chatGPT = (await dynamicImport(
        'chatgpt-io',
        module,
      )) as typeof import('chatgpt-io');
      this.botNew = new chatGPT.default(process.env.SESSION_TOKEN);
      await this.botNew.waitForReady();
    } else {
      this.initChatGPT();
    }
  }

  async initChatGPT() {
    const chatgpt = (await dynamicImport(
      'chatgpt',
      module,
    )) as typeof import('chatgpt');
    this.api = new chatgpt.ChatGPTAPIBrowser(this.config);
    await this.api.initSession();
  }

  async sendMessage(
    message: string,
    conversationId: string | undefined,
  ): Promise<ChatResponse> {
    let response: ChatResponse | undefined;
    if (!conversationId) {
      if (this.newBot) {
        const answer = await this.botNew.ask(message);
        response = {
          response: answer,
          conversationId: 'string',
          messageId: 'string',
        };
      } else {
        response = await this.api.sendMessage(message, {
          timeoutMs: 15 * 60 * 1000,
        });
      }
    } else {
      if (this.newBot) {
        const answer = await this.botNew.ask(message, conversationId);
        response = {
          response: answer,
          conversationId: 'string',
          messageId: 'string',
        };
      } else {
        response = await this.api.sendMessage(message, {
          conversationId,
          timeoutMs: 15 * 60 * 1000,
        });
      }
    }
    return response;
  }
}
