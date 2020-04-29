import { SNSEvent } from 'aws-lambda';

export abstract class BaseHandler {
  protected abstract runExec(event: SNSEvent): Promise<any>;

  async run(event: SNSEvent, ctx?: any) {
    try {
      await this.runExec(event);
    } catch (err) {
      // when unable to send notification via slack
      console.error(err);
      throw err;
    }
  }

  protected bail(error?: any) {
    if (error) {
      console.error(error);
    }
    return { success: false, error };
  }
}
