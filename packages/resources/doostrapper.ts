import { Bucket } from '@aws-cdk/aws-s3'
import { App, Stack } from '@aws-cdk/core'
import { DoostrapperProps, IDoostrapper } from './interfaces'
export class Doostrapper extends Stack implements IDoostrapper {
  constructor(scope: App, id: string, props: DoostrapperProps) {
    super(scope, id, props)

    const {
      artifactsBucket: { bucketName, versioned },
    } = props
    const bucketResource = new Bucket(this, 'artifactsBucket', {
      bucketName,
      versioned: versioned === false ? versioned : true,
    })
  }
}
