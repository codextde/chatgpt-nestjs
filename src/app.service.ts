import { Injectable, OnModuleInit } from '@nestjs/common';
import { dynamicImport } from 'tsimportlib';

import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AppService implements OnModuleInit {
  queue = new PromiseQueue();
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

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    if (this.api) {
      await this.api.refreshSession();
    }
  }

  async onModuleInit() {
    await this.initChatGPT();
  }

  async initChatGPT() {
    const chatgpt = (await dynamicImport(
      'chatgpt',
      module,
    )) as typeof import('chatgpt');
    this.api = new chatgpt.ChatGPTAPIBrowser(this.config);
    await this.api.initSession();
  }

  async sendMessageQueue(
    message: string,
    conversationId: string | undefined,
    parentMessageId: string | undefined,
  ) {
    return this.queue.add(
      this.sendMessage(message, conversationId, parentMessageId),
    );
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
}

class PromiseQueue {
  private queue: Array<Promise<any>> = [];

  add(promise: Promise<any>) {
    this.queue.push(promise);
    this.processQueue();
  }

  private async processQueue() {
    if (this.queue.length > 0) {
      const promise = this.queue.shift();
      await promise;
      this.processQueue();
    }
  }
}
