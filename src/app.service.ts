import { Injectable, OnModuleInit } from '@nestjs/common';
import { dynamicImport } from 'tsimportlib';

import { Cron, CronExpression } from '@nestjs/schedule';
import ChatGPT from 'chatgpt-io';

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

  api: any;
  bot: any;
  botNew: ChatGPT;

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    if (this.api) {
      // await this.api.refreshSession();
    }
  }

  async onModuleInit() {
    const chatGPT = (await dynamicImport(
      'chatgpt-io',
      module,
    )) as typeof import('chatgpt-io');
    this.botNew = new chatGPT.default(process.env.SESSION_TOKEN);
    await this.botNew.waitForReady();
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
    parentMessageId: string | undefined,
  ): Promise<string> {
    let response: string | undefined;
    if (!conversationId) {
      response = await this.api.sendMessage(message, {
        timeoutMs: 15 * 60 * 1000,
      });
    } else {
      response = await this.api.sendMessage(message, {
        conversationId,
        parentMessageId,
        timeoutMs: 15 * 60 * 1000,
      });
    }
    return response ?? '';
  }

  async sendMessageNew(
    message: string,
    conversationId: string | undefined,
  ): Promise<string> {
    let response: string | undefined;
    if (!conversationId) {
      response = await this.botNew.ask(message);
    } else {
      response = await this.botNew.ask(message, conversationId);
    }
    return response ?? '';
  }
}
