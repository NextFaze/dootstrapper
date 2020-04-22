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
          artifactsSourceKey: 'path/to/resource.zip',
          environments: [
            {
              buildSpec: {},
              name: 'test',
            },
          ],
        },
        notificationsConfig: {
          notificationsType: NOTIFICATIONS_TYPE.PIPELINE_EXECUTION,
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

    it('should create sns topic to send notifications to', () => {
      expectCDK(stack).to(haveResource('AWS::SNS::Topic'));
    });

    it('should create sns subscription to email', () => {
      expectCDK(stack).to(
        haveResource('AWS::SNS::Subscription', {
          Protocol: 'email',
          TopicArn: {
            Ref: 'PipelineNotificationsTopic827A419F',
          },
          Endpoint: 'example@example.com',
        })
      );
    });

    it('should create single artifacts bucket with versioning enabled to store all the artifacts', () => {
      expectCDK(stack).to(
        haveResource('AWS::S3::Bucket', {
          VersioningConfiguration: {
            Status: 'Enabled',
          },
        })
      );
    });

    it('should create cloudwatch trail to detect uploads to s3 bucket', () => {
      expectCDK(stack).to(
        haveResource('AWS::CloudTrail::Trail', {
          IsLogging: true,
          S3BucketName: {
            Ref: 'S3SourceTrailS37D21E604',
          },
          CloudWatchLogsLogGroupArn: {
            'Fn::GetAtt': ['S3SourceTrailLogGroupB099508C', 'Arn'],
          },
          CloudWatchLogsRoleArn: {
            'Fn::GetAtt': ['S3SourceTrailLogsRoleDDC8A909', 'Arn'],
          },
          EnableLogFileValidation: true,
          EventSelectors: [
            {
              DataResources: [
                {
                  Type: 'AWS::S3::Object',
                  Values: [
                    {
                      'Fn::Join': [
                        '',
                        [
                          {
                            'Fn::GetAtt': ['ArtifactsBucket2AAC5544', 'Arn'],
                          },
                          '/path/to/resource.zip',
                        ],
                      ],
                    },
                  ],
                },
              ],
              ReadWriteType: 'WriteOnly',
            },
          ],
          IncludeGlobalServiceEvents: true,
          IsMultiRegionTrail: true,
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
                Ref: 'PipelineNotificationsTopic827A419F',
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
          artifactsSourceKey: 'path/to/resource.zip',
          environments: [
            {
              buildSpec: {},
              name: 'test',
            },
          ],
        },
        notificationsConfig: {
          notificationsType: NOTIFICATIONS_TYPE.STAGE_EXECUTION,
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
                Ref: 'PipelineNotificationsTopic827A419F',
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
          artifactsSourceKey: 'path/to/resource.zip',
          environments: [
            {
              buildSpec: {},
              name: 'test',
            },
          ],
        },
        notificationsConfig: {
          notificationsType: NOTIFICATIONS_TYPE.ACTION_EXECUTION,
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
                Ref: 'PipelineNotificationsTopic827A419F',
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
        notificationsConfig: {
          topicName: 'account-unique-topic-name',
          notificationsType: NOTIFICATIONS_TYPE.PIPELINE_EXECUTION,
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
