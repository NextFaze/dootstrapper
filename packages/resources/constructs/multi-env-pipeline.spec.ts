import {
  countResources,
  expect as expectCDK,
  haveResource,
} from '@aws-cdk/assert';
import { Bucket } from '@aws-cdk/aws-s3';
import { Topic } from '@aws-cdk/aws-sns';
import { Stack } from '@aws-cdk/core';
import { MultiEnvPipeline } from './multi-env-pipeline';
describe('MultiEnvPipeline', () => {
  let stack: Stack;

  describe('with single environment config', () => {
    beforeAll(() => {
      stack = new Stack();
      new MultiEnvPipeline(stack, 'MultiEnvPipeline', {
        artifactsBucket: new Bucket(stack, 'Bucket'),
        artifactsSourceKey: 'path/to/atifact.zip',
        notificationTopic: new Topic(stack, 'Topic'),
        environments: [
          {
            name: 'test',
            approvalRequired: false,
            runtimeVariables: {},
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

    it('should crete pipeline', () => {
      expectCDK(stack).to(
        haveResource('AWS::CodePipeline::Pipeline', {
          Stages: [
            {
              Actions: [
                {
                  ActionTypeId: {
                    Category: 'Source',
                    Owner: 'AWS',
                    Provider: 'S3',
                    Version: '1',
                  },
                  Configuration: {
                    S3Bucket: {
                      Ref: 'Bucket83908E77',
                    },
                    S3ObjectKey: 'path/to/atifact.zip',
                    PollForSourceChanges: false,
                  },
                  Name: 'S3Source',
                  OutputArtifacts: [
                    {
                      Name: 'S3Source',
                    },
                  ],
                  RoleArn: {
                    'Fn::GetAtt': [
                      'MultiEnvPipelineCheckoutS3SourceCodePipelineActionRole1382D76F',
                      'Arn',
                    ],
                  },
                  RunOrder: 1,
                },
              ],
              Name: 'Checkout',
            },
            {
              Actions: [
                {
                  ActionTypeId: {
                    Category: 'Build',
                    Owner: 'AWS',
                    Provider: 'CodeBuild',
                    Version: '1',
                  },
                  Configuration: {
                    ProjectName: {
                      Ref: 'MultiEnvPipelineTestPipelineProject2C47B493',
                    },
                  },
                  InputArtifacts: [
                    {
                      Name: 'S3Source',
                    },
                  ],
                  Name: 'Deploy',
                  OutputArtifacts: [
                    {
                      Name: 'TestSource',
                    },
                  ],
                  RoleArn: {
                    'Fn::GetAtt': [
                      'MultiEnvPipelineTestDeployCodePipelineActionRole068F06FC',
                      'Arn',
                    ],
                  },
                  RunOrder: 1,
                },
              ],
              Name: 'TestDeploy',
            },
          ],
        })
      );
    });
  });

  describe('with multiple environments config', () => {
    beforeAll(() => {
      stack = new Stack();
      new MultiEnvPipeline(stack, 'MultiEnvPipeline', {
        artifactsBucket: new Bucket(stack, 'Bucket'),
        artifactsSourceKey: 'path/to/atifact.zip',
        notificationTopic: new Topic(stack, 'Topic'),
        environments: [
          {
            name: 'test',
            approvalRequired: false,
            runtimeVariables: {},
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
            runtimeVariables: {},
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

    it('should crete pipeline', () => {
      expectCDK(stack).to(
        haveResource('AWS::CodePipeline::Pipeline', {
          Stages: [
            {
              Actions: [
                {
                  ActionTypeId: {
                    Category: 'Source',
                    Owner: 'AWS',
                    Provider: 'S3',
                    Version: '1',
                  },
                  Configuration: {
                    S3Bucket: {
                      Ref: 'Bucket83908E77',
                    },
                    S3ObjectKey: 'path/to/atifact.zip',
                    PollForSourceChanges: false,
                  },
                  Name: 'S3Source',
                  OutputArtifacts: [
                    {
                      Name: 'S3Source',
                    },
                  ],
                  RoleArn: {
                    'Fn::GetAtt': [
                      'MultiEnvPipelineCheckoutS3SourceCodePipelineActionRole1382D76F',
                      'Arn',
                    ],
                  },
                  RunOrder: 1,
                },
              ],
              Name: 'Checkout',
            },
            {
              Actions: [
                {
                  ActionTypeId: {
                    Category: 'Build',
                    Owner: 'AWS',
                    Provider: 'CodeBuild',
                    Version: '1',
                  },
                  Configuration: {
                    ProjectName: {
                      Ref: 'MultiEnvPipelineTestPipelineProject2C47B493',
                    },
                  },
                  InputArtifacts: [
                    {
                      Name: 'S3Source',
                    },
                  ],
                  Name: 'Deploy',
                  OutputArtifacts: [
                    {
                      Name: 'TestSource',
                    },
                  ],
                  RoleArn: {
                    'Fn::GetAtt': [
                      'MultiEnvPipelineTestDeployCodePipelineActionRole068F06FC',
                      'Arn',
                    ],
                  },
                  RunOrder: 1,
                },
              ],
              Name: 'TestDeploy',
            },
            {
              Actions: [
                {
                  ActionTypeId: {
                    Category: 'Approval',
                    Owner: 'AWS',
                    Provider: 'Manual',
                    Version: '1',
                  },
                  Configuration: {
                    NotificationArn: {
                      Ref: 'TopicBFC7AF6E',
                    },
                  },
                  Name: 'prod-approve',
                  RoleArn: {
                    'Fn::GetAtt': [
                      'MultiEnvPipelineProdDeployprodapproveCodePipelineActionRole344AC21E',
                      'Arn',
                    ],
                  },
                  RunOrder: 1,
                },
                {
                  ActionTypeId: {
                    Category: 'Build',
                    Owner: 'AWS',
                    Provider: 'CodeBuild',
                    Version: '1',
                  },
                  Configuration: {
                    ProjectName: {
                      Ref: 'MultiEnvPipelineProdPipelineProjectB3FAF0CF',
                    },
                  },
                  InputArtifacts: [
                    {
                      Name: 'S3Source',
                    },
                  ],
                  Name: 'Deploy',
                  OutputArtifacts: [
                    {
                      Name: 'ProdSource',
                    },
                  ],
                  RoleArn: {
                    'Fn::GetAtt': [
                      'MultiEnvPipelineProdDeployCodePipelineActionRole9B75987B',
                      'Arn',
                    ],
                  },
                  RunOrder: 2,
                },
              ],
              Name: 'ProdDeploy',
            },
          ],
        })
      );
    });
  });
});
