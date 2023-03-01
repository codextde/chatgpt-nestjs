import { Injectable, OnModuleInit } from '@nestjs/common';
import { dynamicImport } from 'tsimportlib';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ChatGPTUnofficialProxyAPI } from 'chatgpt';

@Injectable()
export class AppService implements OnModuleInit {
  bot: ChatGPTUnofficialProxyAPI;
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
      model: 'text-davinci-002-render-sha',
    });
    console.log('Authenticated with OpenAI');
  }

  async getAccessToken(): Promise<{ accessToken: string }> {
    const authenticator = new this.openaiAuthenticator.default();
    return authenticator.login(process.env.EMAIL, process.env.PASSWORD);
  }

  async sendMessage(
    message: string,
    conversationId?: string | undefined,
  ): Promise<any> {
    let response: any | undefined;
    if (conversationId) {
      response = await this.bot.sendMessage(message, {
        conversationId,
        timeoutMs: 15 * 60 * 1000,
      });
    } else {
      response = await this.bot.sendMessage(message, {
        timeoutMs: 15 * 60 * 1000,
      });
    }
    return response;
  }
}
