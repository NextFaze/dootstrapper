import { StackProps } from '@aws-cdk/core'

export interface IDoostrapper {}

export interface DoostrapperProps extends StackProps {
  artifactsBucket: ArtifactsBucketProps
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
  bucketName?: string
  /**
   * @default - Default value is true
   */
  versioned?: boolean
}
