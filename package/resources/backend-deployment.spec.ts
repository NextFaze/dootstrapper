import { expect as expectCDK, haveResource, MatchStyle } from '@aws-cdk/assert';
import { App, Stack } from '@aws-cdk/core';
import { BackendDeployment } from './backend-deployment';
import { NOTIFICATIONS_TARGET, NOTIFICATIONS_TYPE } from './enums';
const stackWithMinConfig = require('./test/backend-stack.json');

describe('BackendDeployment', () => {
  let stack: Stack;
  beforeAll(() => {
    const app = new App();
    stack = new BackendDeployment(app, 'TestStack', {
      stackName: 'test-stack',
      pipelineConfig: {
        notificationsType: NOTIFICATIONS_TYPE.PIPELINE_EXECUTION,
        artifactsSourceKey: 'path/to/resource.zip',
        environments: [
          {
            buildSpec: {},
            name: 'test',
          },
        ],
      },
      notificationConfig: {
        notificationsTargetConfig: {
          targetType: NOTIFICATIONS_TARGET.EMAIL,
          emailAddress: 'example@example.com',
        },
      },
    });
  });

  it('should create', () => {
    expect(stack).toBeTruthy();
    expectCDK(stack).toMatch(stackWithMinConfig, MatchStyle.EXACT);
  });

  it('should create sns subscription to email', () => {
    expectCDK(stack).to(
      haveResource('AWS::SNS::Subscription', {
        Protocol: 'email',
        TopicArn: {
          Ref: 'MultiEnvPipelineNotificationTopicDF7464D3',
        },
        Endpoint: 'example@example.com',
      })
    );
  });
});
