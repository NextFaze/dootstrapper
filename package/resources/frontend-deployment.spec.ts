import { HostedZone } from '@aws-cdk/aws-route53';
import { Stack, App } from '@aws-cdk/core';
import { FrontendDeployment } from './frontend-deployment';
import { NOTIFICATIONS_TARGET, NOTIFICATIONS_TYPE } from './constants/enums';
import { expect as expectCDK, haveResource } from '@aws-cdk/assert';
const frontEndMinConfig = require('./test/frontend-stack.json');

describe('FrontendDeployment', () => {
  let stack: Stack;

  beforeAll(() => {
    const app = new App();
    spyOn(HostedZone, 'fromLookup').and.returnValue(
      new HostedZone(new Stack(app, 'Core'), 'HostedZone', {
        zoneName: 'example.com',
      })
    );

    stack = new FrontendDeployment(app, 'FrontendDeployment', {
      baseDomainName: 'example.com',
      notificationConfig: {
        notificationsTargetConfig: {
          emailAddress: 'support@example.com',
          targetType: NOTIFICATIONS_TARGET.EMAIL,
        },
      },
      pipelineConfig: {
        artifactsSourceKey: 'path/to/artifact.zip',
        notificationsType: NOTIFICATIONS_TYPE.PIPELINE_EXECUTION,
        environments: [
          {
            aliases: ['app.example.com'],
            name: 'prod',
          },
        ],
      },
    });
  });

  it('should create', () => {
    expectCDK(stack).toMatch(frontEndMinConfig);
  });

  it('should create email subscription', () => {
    expectCDK(stack).to(
      haveResource('AWS::SNS::Subscription', {
        Protocol: 'email',
        Endpoint: 'support@example.com',
      })
    );
  });
});
