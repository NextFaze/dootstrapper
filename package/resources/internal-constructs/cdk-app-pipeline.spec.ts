import {
  countResources,
  expect as expectCDK,
  haveResource,
  haveResourceLike,
} from '@aws-cdk/assert';
import { Stack } from '@aws-cdk/core';
import { CdkAppPipeline } from './cdk-app-pipeline';
import { NOTIFICATIONS_TYPE } from '../enums';
const singleEnvPipeline = require('./test/single-env-pipeline.spec.json');
const multiEnvNoApproval = require('./test/multi-env-pipeline-no-approval.spec.json');
const multiEnvApproval = require('./test/multi-env-approval-pipeline.spec.json');
describe('CdkAppPipeline', () => {
  let stack: Stack;

  describe('with minimum environment config', () => {
    beforeAll(() => {
      stack = new Stack();
      new CdkAppPipeline(stack, 'MultiEnvPipeline', {
        artifactsSourceKey: 'path/to/atifact.zip',
        notificationsType: NOTIFICATIONS_TYPE.NONE,
        environments: [
          {
            name: 'test',
            adminPermissions: true,
            buildSpec: {
              version: 0.1,
              phases: {
                install: {
                  commands: ['echo Downloading JUnit JAR file...', 'mkdir lib'],
                },
                pre_build: {
                  commands: ['echo Hello...'],
                },
                build: {
                  commands: ['echo Build started on `date`', 'ant'],
                },
                post_build: {
                  commands: ['echo Build completed on `date`'],
                },
              },
              artifacts: {
                files: ['build/jar/HelloWorld.zip'],
              },
            },
          },
        ],
      });
    });

    it('should create pipeline and codebuild resource', () => {
      expectCDK(stack).to(countResources('AWS::CodePipeline::Pipeline', 1));
      expectCDK(stack).to(countResources('AWS::CodeBuild::Project', 1));
    });

    it('should crete pipeline with single environment', () => {
      expectCDK(stack).to(countResources('AWS::CodePipeline::Pipeline', 1));
      expectCDK(stack).to(
        haveResource('AWS::CodePipeline::Pipeline', singleEnvPipeline)
      );
    });

    it('should create IAM policy to allow codebuild to access required resources', () => {
      expectCDK(stack).to(
        haveResourceLike('AWS::IAM::Policy', {
          PolicyDocument: {
            Statement: [
              {
                Action: [
                  'logs:CreateLogGroup',
                  'logs:CreateLogStream',
                  'logs:PutLogEvents',
                ],
                Effect: 'Allow',
                Resource: [
                  {
                    'Fn::Join': [
                      '',
                      [
                        'arn:',
                        {
                          Ref: 'AWS::Partition',
                        },
                        ':logs:',
                        {
                          Ref: 'AWS::Region',
                        },
                        ':',
                        {
                          Ref: 'AWS::AccountId',
                        },
                        ':log-group:/aws/codebuild/',
                        {
                          Ref: 'MultiEnvPipelineTestPipelineProject2C47B493',
                        },
                      ],
                    ],
                  },
                  {
                    'Fn::Join': [
                      '',
                      [
                        'arn:',
                        {
                          Ref: 'AWS::Partition',
                        },
                        ':logs:',
                        {
                          Ref: 'AWS::Region',
                        },
                        ':',
                        {
                          Ref: 'AWS::AccountId',
                        },
                        ':log-group:/aws/codebuild/',
                        {
                          Ref: 'MultiEnvPipelineTestPipelineProject2C47B493',
                        },
                        ':*',
                      ],
                    ],
                  },
                ],
              },
              {
                Action: [
                  'codebuild:CreateReportGroup',
                  'codebuild:CreateReport',
                  'codebuild:UpdateReport',
                  'codebuild:BatchPutTestCases',
                ],
                Effect: 'Allow',
                Resource: {
                  'Fn::Join': [
                    '',
                    [
                      'arn:',
                      {
                        Ref: 'AWS::Partition',
                      },
                      ':codebuild:',
                      {
                        Ref: 'AWS::Region',
                      },
                      ':',
                      {
                        Ref: 'AWS::AccountId',
                      },
                      ':report-group/',
                      {
                        Ref: 'MultiEnvPipelineTestPipelineProject2C47B493',
                      },
                      '-*',
                    ],
                  ],
                },
              },
              {
                Action: [
                  'ssm:DescribeParameters',
                  'ssm:GetParameters',
                  'ssm:GetParameter',
                  'ssm:GetParameterHistory',
                ],
                Effect: 'Allow',
                Resource: {
                  'Fn::Join': [
                    '',
                    [
                      'arn:',
                      {
                        Ref: 'AWS::Partition',
                      },
                      ':ssm:',
                      {
                        Ref: 'AWS::Region',
                      },
                      ':',
                      {
                        Ref: 'AWS::AccountId',
                      },
                      ':parameter',
                      {
                        Ref:
                          'MultiEnvPipelinetestDootstrapperCoreDeployAccessKeyId1ABD3E78',
                      },
                    ],
                  ],
                },
              },
              {
                Action: [
                  'ssm:DescribeParameters',
                  'ssm:GetParameters',
                  'ssm:GetParameter',
                  'ssm:GetParameterHistory',
                ],
                Effect: 'Allow',
                Resource: {
                  'Fn::Join': [
                    '',
                    [
                      'arn:',
                      {
                        Ref: 'AWS::Partition',
                      },
                      ':ssm:',
                      {
                        Ref: 'AWS::Region',
                      },
                      ':',
                      {
                        Ref: 'AWS::AccountId',
                      },
                      ':parameter',
                      {
                        Ref:
                          'MultiEnvPipelinetestDootstrapperCoreDeploySecretAccessKey90E4971B',
                      },
                    ],
                  ],
                },
              },
              {
                Action: [
                  's3:GetObject*',
                  's3:GetBucket*',
                  's3:List*',
                  's3:DeleteObject*',
                  's3:PutObject*',
                  's3:Abort*',
                ],
                Effect: 'Allow',
                Resource: [
                  {
                    'Fn::GetAtt': [
                      'MultiEnvPipelineArtifactBucket18578669',
                      'Arn',
                    ],
                  },
                  {
                    'Fn::Join': [
                      '',
                      [
                        {
                          'Fn::GetAtt': [
                            'MultiEnvPipelineArtifactBucket18578669',
                            'Arn',
                          ],
                        },
                        '/*',
                      ],
                    ],
                  },
                ],
              },
            ],
            Version: '2012-10-17',
          },
        })
      );
    });
  });

  describe('with multiple environments and no approval', () => {
    beforeAll(() => {
      stack = new Stack();
      new CdkAppPipeline(stack, 'MultiEnvPipeline', {
        artifactsSourceKey: 'path/to/atifact.zip',
        notificationsType: NOTIFICATIONS_TYPE.NONE,
        environments: [
          {
            name: 'test',
            adminPermissions: true,
            buildSpec: {
              version: 0.1,
              phases: {
                install: {
                  commands: ['echo Downloading JUnit JAR file...', 'mkdir lib'],
                },
              },
              artifacts: {
                files: ['build/jar/HelloWorld1.zip'],
              },
            },
          },
          {
            name: 'prod',
            adminPermissions: true,
            buildSpec: {
              version: 0.1,
              phases: {
                install: {
                  commands: ['echo Downloading JUnit JAR file...', 'mkdir lib'],
                },
              },
              artifacts: {
                files: ['build/jar/HelloWorld2.zip'],
              },
            },
          },
        ],
      });
    });

    it('should create pipeline and codebuild resource', () => {
      expectCDK(stack).to(countResources('AWS::CodePipeline::Pipeline', 1));
      expectCDK(stack).to(countResources('AWS::CodeBuild::Project', 2));
    });

    it('should crete pipeline with required stages', () => {
      expectCDK(stack).to(
        haveResource('AWS::CodePipeline::Pipeline', multiEnvNoApproval)
      );
    });
  });

  describe('with custom environments and approval config', () => {
    beforeAll(() => {
      stack = new Stack();
      new CdkAppPipeline(stack, 'MultiEnvPipeline', {
        artifactsSourceKey: 'path/to/atifact.zip',
        notificationsType: NOTIFICATIONS_TYPE.NONE,
        environments: [
          {
            name: 'test',
            adminPermissions: true,
            buildSpec: {
              version: 0.1,
              phases: {
                install: {
                  commands: ['echo Downloading JUnit JAR file...', 'mkdir lib'],
                },
              },
              artifacts: {
                files: ['build/jar/HelloWorld1.zip'],
              },
            },
          },
          {
            name: 'prod',
            approvalRequired: true,
            adminPermissions: true,
            runtimeVariables: { TEST_ENV: 'some env value' },
            buildSpec: {
              version: 0.1,
              phases: {
                install: {
                  commands: ['echo Downloading JUnit JAR file...', 'mkdir lib'],
                },
              },
              artifacts: {
                files: ['build/jar/HelloWorld2.zip'],
              },
            },
          },
        ],
      });
    });

    it('should create pipeline and codebuild resource', () => {
      expectCDK(stack).to(countResources('AWS::CodePipeline::Pipeline', 1));
      expectCDK(stack).to(countResources('AWS::CodeBuild::Project', 2));
    });

    it('should crete pipeline with required stages and approval action.', () => {
      expectCDK(stack).to(
        haveResource('AWS::CodePipeline::Pipeline', multiEnvApproval)
      );
    });
  });
});
