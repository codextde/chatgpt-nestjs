import { Injectable, OnModuleInit } from '@nestjs/common';
import { dynamicImport } from 'tsimportlib';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ChatGPTAPI, ChatGPTUnofficialProxyAPI } from 'chatgpt';

@Injectable()
export class AppService implements OnModuleInit {
  bot: ChatGPTUnofficialProxyAPI;
  openAiBot: ChatGPTAPI
  openaiAuthenticator: any;
  chatGpt: any;

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    this.refreshToken();
  }

  async onModuleInit() {
    this.openaiAuthenticator = (await dynamicImport(
      'openai-authenticator',
      module,
    )) as typeof import('openai-authenticator');
    this.chatGpt = (await dynamicImport(
      'chatgpt',
      module,
    )) as typeof import('chatgpt');


    this.refreshToken();
  }

  async refreshToken(): Promise<void> {
    const data = await this.getAccessToken();
    this.bot = new this.chatGpt.ChatGPTUnofficialProxyAPI({
      accessToken: data.accessToken,
      model: 'gpt-4',
      apiReverseProxyUrl: 'https://gpt.pawan.krd/backend-api/conversation'
    });
    this.openAiBot = new this.chatGpt.ChatGPTAPI({
      apiKey: process.env.OPENAI_API_KEY
    })
    console.log('Authenticated with OpenAI');
  }

  async getAccessToken(): Promise<{ accessToken: string }> {
    const authenticator = new this.openaiAuthenticator.default();
    return authenticator.login(process.env.EMAIL, process.env.PASSWORD);
  }

  async sendMessage(
    message: string,
    conversationId?: string | undefined,
    parentMessageId?: string | undefined,
  ): Promise<any> {
    let response: any | undefined;
    try {
      if (parentMessageId) {
        response = await this.bot.sendMessage(message, {
          parentMessageId,
          timeoutMs: 15 * 60 * 1000,
        });
      } else {
        response = await this.bot.sendMessage(message, {
          timeoutMs: 15 * 60 * 1000,
        });
      }
      /*if (conversationId && parentMessageId) {
        response = await this.bot.sendMessage(message, {
          conversationId,
          parentMessageId,
          timeoutMs: 15 * 60 * 1000,
        });
      } else {
        response = await this.bot.sendMessage(message, {
          timeoutMs: 15 * 60 * 1000,
        });
      }*/
    } catch (error) {
    }

   
    return response;
  }
}
