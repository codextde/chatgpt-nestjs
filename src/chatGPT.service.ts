import { Injectable, OnModuleInit } from '@nestjs/common';


import { dynamicImport } from 'tsimportlib';

@Injectable()
export class ChatGPTService implements OnModuleInit {
  bot: any;

  async onModuleInit() {
    const chatGPT = (await dynamicImport(
      'chatgpt-io',
      module,
    )) as typeof import('chatgpt-io');
    this.bot = new chatGPT.default(process.env.SESSION_TOKEN, {
      proAccount: true
    });
    await this.bot.waitForReady();
    /*const chatGPT = (await dynamicImport(
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
      model: 'text-davinci-002-render-sha',
    };

    this.bot = new chatGPT.default(process.env.OPENAI_KEY, options);*/
  }

  async sendMessage(message: string) {
    console.log('Test', message);
    let response = await this.bot.ask(message);
    console.log('response', response);
    return { data: response, code: 200 };
  }
}
