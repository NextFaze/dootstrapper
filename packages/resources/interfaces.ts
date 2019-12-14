import { Pipeline } from '@aws-cdk/aws-codepipeline';
import { Bucket } from '@aws-cdk/aws-s3';
import { StackProps } from '@aws-cdk/core';

export interface IDoostrapper {
  readonly artifactsBucket: Bucket;
  readonly deployPipeline: Pipeline;
}

export interface DoostrapperProps extends StackProps {
  artifactsBucketConfig: ArtifactsBucketProps;
  pipelineConfig: PipelineProps;
  codeDeployConfig: CodeDeployConfig;
}

/**
 * @param bucketName artifacts bucket name
 * It is recommended not to have user defined bucket name
 * Bucket name needs to be unique across all accounts.
 * @param versioned this bucket should have versioning turned on or not.
 */
interface ArtifactsBucketProps {
  /**
   * @default - Cloudformation generated bucket name
   */
  bucketName?: string;
}

/**
 * @param pipelineName name of deploy pipeline
 * @param artifactsSourceKey s3 path where artifacts will be uploaded to, including suffix
 */
interface PipelineProps {
  /**
   * @default - AWS CloudFormation generates an ID and uses that for the pipeline name
   */
  pipelineName?: string;
  artifactsSourceKey: string;
}

interface CodeDeployConfig {
  projectName: string;
}
