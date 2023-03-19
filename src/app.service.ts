import { Injectable, OnModuleInit } from '@nestjs/common';
import { dynamicImport } from 'tsimportlib';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ChatGPTAPI, ChatGPTUnofficialProxyAPI } from 'chatgpt';

@Injectable()
export class AppService implements OnModuleInit {
  openaiAuthenticator: any;
  chatGpt: any;
  accessToken: string;

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
    this.accessToken = data.accessToken;
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
    chatGpt: boolean = false,
    model: string = 'text-davinci-002-render-sha',
  ): Promise<any> {
    console.log('chatGpt', chatGpt);
    console.log('model', model);
    let response: any | undefined;
    try {
      chatGpt = false;
      if (chatGpt) {
        const bot: ChatGPTUnofficialProxyAPI =
          new this.chatGpt.ChatGPTUnofficialProxyAPI({
            accessToken: this.accessToken,
            model: model,
            apiReverseProxyUrl:
              'https://gpt.pawan.krd/backend-api/conversation',
          });
        if (conversationId && parentMessageId) {
          response = await bot.sendMessage(message, {
            conversationId,
            parentMessageId,
            timeoutMs: 15 * 60 * 1000,
          });
        } else {
          response = await bot.sendMessage(message, {
            timeoutMs: 15 * 60 * 1000,
          });
        }
      } else {
        const openAiBot: ChatGPTAPI = new this.chatGpt.ChatGPTAPI({
          apiKey: process.env.OPENAI_API_KEY,
        });

        if (parentMessageId) {
          response = await openAiBot.sendMessage(message, {
            parentMessageId,
            timeoutMs: 15 * 60 * 1000,
          });
        } else {
          response = await openAiBot.sendMessage(message, {
            timeoutMs: 15 * 60 * 1000,
          });
        }
      }
    } catch (error) {
      console.log('error', error);
    }
    return response;
  }
}
