import { Stack } from '@aws-cdk/core';
import { expect as expectCDK, haveResource, SynthUtils } from '@aws-cdk/assert';
import { BasePipeline } from './base-pipeline';
import { Artifact } from '@aws-cdk/aws-codepipeline';
import { StringParameter } from '@aws-cdk/aws-ssm';
import { NOTIFICATIONS_TYPE } from '../constants/enums';
class Pipeline extends BasePipeline {
  constructor(stack: Stack) {
    super(stack, 'Pipeline', {
      artifactSourceKey: 'path/to/artifact.zip',
      notificationsType: NOTIFICATIONS_TYPE.NONE,
    });
    this.pipeline.addStage({
      actions: [
        this.createManualApprovalAction({ actionName: 'Approve', runOrder: 1 }),
      ],
      stageName: 'deploy',
    });
  }
}
describe('BasePipeline', () => {
  let stack: Stack;
  let pipeline: Pipeline;
  beforeEach(() => {
    stack = new Stack();
    pipeline = new Pipeline(stack);
  });

  it('should create s3 bucket with versioning enabled', () => {
    expectCDK(stack).to(
      haveResource('AWS::S3::Bucket', {
        VersioningConfiguration: {
          Status: 'Enabled',
        },
      })
    );
  });

  it('should create s3 checkout action', () => {
    const pipeline = SynthUtils.synthesize(stack).template.Resources
      .Pipeline9850B417;
    expect(pipeline.Properties.Stages).toEqual(
      jasmine.arrayContaining([
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
                  Ref: 'PipelineArtifactBucket5F943F51',
                },
                S3ObjectKey: 'path/to/artifact.zip',
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
                  'PipelineCheckoutS3SourceCodePipelineActionRole1E58F81D',
                  'Arn',
                ],
              },
              RunOrder: 1,
            },
          ],
          Name: 'Checkout',
        },
      ])
    );
  });

  it('should create cloudwatch trail to detect uploads to s3 bucket', () => {
    expectCDK(stack).to(
      haveResource('AWS::CloudTrail::Trail', {
        IsLogging: true,
        S3BucketName: {
          Ref: 'PipelineS3ArtifactTrailS3FCBF849B',
        },
        CloudWatchLogsLogGroupArn: {
          'Fn::GetAtt': ['PipelineS3ArtifactTrailLogGroup5B0E4B40', 'Arn'],
        },
        CloudWatchLogsRoleArn: {
          'Fn::GetAtt': ['PipelineS3ArtifactTrailLogsRole0F28D2C9', 'Arn'],
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
                          'Fn::GetAtt': [
                            'PipelineArtifactBucket5F943F51',
                            'Arn',
                          ],
                        },
                        '/path/to/artifact.zip',
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

  it('should create code build action for nodejs projects', () => {
    pipeline.createCodebuildAction({
      id: '1',
      stage: 'Test',
      runOrder: 1,
      runtimeVariables: {},
      buildSpec: {},
      inputSource: pipeline.checkoutSource,
      outputSource: new Artifact(),
      accessKeyId: new StringParameter(stack, 'AccessKey', {
        stringValue: 'AccessKey',
      }),
      secretAccessKey: new StringParameter(stack, 'SecretKey', {
        stringValue: 'SecretKey',
      }),
    });
    expectCDK(stack).to(
      haveResource('AWS::CodeBuild::Project', {
        Artifacts: {
          Type: 'CODEPIPELINE',
        },
        Environment: {
          ComputeType: 'BUILD_GENERAL1_SMALL',
          Image: 'aws/codebuild/nodejs:10.14.1',
          PrivilegedMode: false,
          Type: 'LINUX_CONTAINER',
        },
        ServiceRole: {
          'Fn::GetAtt': ['Pipeline1Role4E1D4C09', 'Arn'],
        },
        Source: {
          BuildSpec: {
            'Fn::Join': [
              '',
              [
                '{\n  "env": {\n    "parameter-store": {\n      "AWS_ACCESS_KEY_ID": "',
                {
                  Ref: 'AccessKeyE6B25659',
                },
                '",\n      "AWS_SECRET_ACCESS_KEY": "',
                {
                  Ref: 'SecretKey573D36D8',
                },
                '"\n    }\n  }\n}',
              ],
            ],
          },
          Type: 'CODEPIPELINE',
        },
        Description: 'Dootstrapper Codepipeline Deploy Project for stage Test',
        Name: '1',
      })
    );
  });
});
