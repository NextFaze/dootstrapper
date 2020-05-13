import { Construct, Duration } from '@aws-cdk/core';
import { LambdaSubscription } from '@aws-cdk/aws-sns-subscriptions';
import { Function, Runtime, Code } from '@aws-cdk/aws-lambda';
import { StringParameter } from '@aws-cdk/aws-ssm';

interface ISlackSubscriptionProps {
  channel: string;
  types?: string;
}

export class SlackSubscription extends Construct {
  readonly subscription: LambdaSubscription;
  constructor(scope: Construct, id: string, props: ISlackSubscriptionProps) {
    super(scope, id);
    const { channel, types = '' } = props;

    const param = new StringParameter(this, 'AuthParameter', {
      stringValue: 'Dummy Auth Token',
      description: 'String parameter to store auth token for slack bot',
    });

    const lambda = new Function(this, 'Handler', {
      runtime: Runtime.NODEJS_10_X,
      timeout: Duration.seconds(30),
      code: Code.fromAsset('handlers'),
      handler: 'bundle.handler',
      description: 'Handler to send deployment notifications to slack',
      environment: {
        AUTH_TOKEN_PARAM: param.parameterName,
        CHANNEL_NAME: channel,
        CHANNEL_TYPES: types,
      },
    });
    param.grantRead(lambda);

    this.subscription = new LambdaSubscription(lambda);
  }
}
