import { Stack, App } from '@aws-cdk/core';
import { SlackSubscription } from './slack-subscription';
import { expect as expectCDK, haveResource } from '@aws-cdk/assert';
import { mkdirSync, rmdirSync } from 'fs';

describe('SlackSubscription', () => {
  let stack: Stack;

  beforeAll(() => {
    mkdirSync('handlers');
  });

  afterAll(() => {
    rmdirSync('handlers');
  });

  beforeEach(() => {
    stack = new Stack();
    new SlackSubscription(stack, 'SlackSubscription', {
      channel: 'notify-me',
    });
  });

  it('should create function to send notification', () => {
    expectCDK(stack).to(
      haveResource('AWS::Lambda::Function', {
        Handler: 'index.handler',
        Runtime: 'nodejs10.x',
      })
    );
  });

  it('should create ssm paramter to store auth token', () => {
    expectCDK(stack).to(
      haveResource('AWS::SSM::Parameter', {
        Type: 'String',
      })
    );
  });
});
