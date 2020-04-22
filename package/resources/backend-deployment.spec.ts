import {
  expect as expectCDK,
  haveResource,
  MatchStyle,
  matchTemplate,
} from '@aws-cdk/assert';
import { App, Stack } from '@aws-cdk/core';
import { BackendDeployment } from './backend-deployment';
import { NOTIFICATIONS_TARGET, NOTIFICATIONS_TYPE } from './constants/enums';
const stackWithMinConfig = require('./test/stack-with-min-config.spec.json');
const stackWithCustomConfig = require('./test/stack-with-custom-config.spec.json');

describe('Dootstrapper', () => {
  let stack: Stack;

  describe('Stack with minimum config', () => {
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
            emailSubject: 'Deploy Notifications',
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

    it('should create cloudwatch event rule to listen to pipeline execution status change', () => {
      expectCDK(stack).to(
        haveResource('AWS::Events::Rule', {
          Description: 'Dootstrapper Pipeline notifications Cloudwatch Rule',
          EventPattern: {
            source: ['aws.codepipeline'],
            'detail-type': ['CodePipeline Pipeline Execution State Change'],
            resources: [
              {
                'Fn::Join': [
                  '',
                  [
                    'arn:',
                    {
                      Ref: 'AWS::Partition',
                    },
                    ':codepipeline:',
                    {
                      Ref: 'AWS::Region',
                    },
                    ':',
                    {
                      Ref: 'AWS::AccountId',
                    },
                    ':',
                    {
                      Ref: 'MultiEnvPipeline44057249',
                    },
                  ],
                ],
              },
            ],
          },
          State: 'ENABLED',
          Targets: [
            {
              Arn: {
                Ref: 'MultiEnvPipelineNotificationTopicDF7464D3',
              },
              Id: 'Target0',
            },
          ],
        })
      );
    });
  });

  describe('stack with stage execution status config', () => {
    beforeAll(() => {
      const app = new App();
      stack = new BackendDeployment(app, 'TestStack', {
        stackName: 'test-stack',
        pipelineConfig: {
          notificationsType: NOTIFICATIONS_TYPE.STAGE_EXECUTION,
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
            emailSubject: 'Deploy Notifications',
          },
        },
      });
    });

    it('should create event rule to listen to pipeline stage execution config', () => {
      expectCDK(stack).to(
        haveResource('AWS::Events::Rule', {
          Description: 'Dootstrapper Pipeline notifications Cloudwatch Rule',
          EventPattern: {
            source: ['aws.codepipeline'],
            'detail-type': ['CodePipeline Stage Execution State Change'],
            resources: [
              {
                'Fn::Join': [
                  '',
                  [
                    'arn:',
                    {
                      Ref: 'AWS::Partition',
                    },
                    ':codepipeline:',
                    {
                      Ref: 'AWS::Region',
                    },
                    ':',
                    {
                      Ref: 'AWS::AccountId',
                    },
                    ':',
                    {
                      Ref: 'MultiEnvPipeline44057249',
                    },
                  ],
                ],
              },
            ],
          },
          State: 'ENABLED',
          Targets: [
            {
              Arn: {
                Ref: 'MultiEnvPipelineNotificationTopicDF7464D3',
              },
              Id: 'Target0',
            },
          ],
        })
      );
    });
  });

  describe('stack with actions execution status config', () => {
    beforeAll(() => {
      const app = new App();
      stack = new BackendDeployment(app, 'TestStack', {
        stackName: 'test-stack',
        pipelineConfig: {
          notificationsType: NOTIFICATIONS_TYPE.ACTION_EXECUTION,
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
            emailSubject: 'Deploy Notifications',
          },
        },
      });
    });

    it('should create event rule to listen to pipeline stage execution config', () => {
      expectCDK(stack).to(
        haveResource('AWS::Events::Rule', {
          Description: 'Dootstrapper Pipeline notifications Cloudwatch Rule',
          EventPattern: {
            source: ['aws.codepipeline'],
            'detail-type': ['CodePipeline Action Execution State Change'],
            resources: [
              {
                'Fn::Join': [
                  '',
                  [
                    'arn:',
                    {
                      Ref: 'AWS::Partition',
                    },
                    ':codepipeline:',
                    {
                      Ref: 'AWS::Region',
                    },
                    ':',
                    {
                      Ref: 'AWS::AccountId',
                    },
                    ':',
                    {
                      Ref: 'MultiEnvPipeline44057249',
                    },
                  ],
                ],
              },
            ],
          },
          State: 'ENABLED',
          Targets: [
            {
              Arn: {
                Ref: 'MultiEnvPipelineNotificationTopicDF7464D3',
              },
              Id: 'Target0',
            },
          ],
        })
      );
    });
  });

  describe('stack with all custom config', () => {
    beforeAll(() => {
      const app = new App();
      stack = new BackendDeployment(app, 'TestStack', {
        stackName: 'test-stack',
        artifactsBucketConfig: {
          bucketName: 'unique-artifacts-bucket-name',
        },
        pipelineConfig: {
          notificationsType: NOTIFICATIONS_TYPE.PIPELINE_EXECUTION,
          artifactsSourceKey: 'path/to/resource.zip',
          environments: [
            {
              name: 'test',
              buildSpec: {
                env: {
                  variables: {
                    AWS_DEFAULT_REGION: 'ap-southeast-2',
                  },
                },
              },
              adminPermissions: true,
              approvalRequired: false,
              runtimeVariables: {
                SOME_OTHER_VARIABLE: 'variable',
              },
            },
          ],
        },
        notificationConfig: {
          topicName: 'account-unique-topic-name',
          notificationsTargetConfig: {
            targetType: NOTIFICATIONS_TARGET.EMAIL,
            emailAddress: 'example@example.com',
            emailSubject: 'Deploy Notifications',
          },
          cloudwatchRuleName: 'unique-cloudwatch-name',
        },
      });
    });

    it('should create', () => {
      expectCDK(stack).to(matchTemplate(stackWithCustomConfig));
    });
  });
});
