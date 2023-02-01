import { Injectable, OnModuleInit } from '@nestjs/common';
import ChatGPT from 'chatgpt-official';

import { dynamicImport } from 'tsimportlib';

@Injectable()
export class ChatGPTService implements OnModuleInit {
  bot: ChatGPT;

  async onModuleInit() {
    const chatGPT = (await dynamicImport(
      'chatgpt-official',
      module,
    )) as typeof import('chatgpt-official');

    const options = {
      temperature: 0.7,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      historySize: 50,
      instructions: `You are ChatGPT, a large language model trained by OpenAI.`,
      model: 'text-chat-davinci-002-20230126',
    };

    this.bot = new chatGPT.default(
      process.env.OPENAI_KEY,
      options,
    );
  }

  async sendMessage(message: string) {
    console.log('Test', message);
    let response = await this.bot.ask(message);
    console.log('response', response);
    return response;
  }
}
