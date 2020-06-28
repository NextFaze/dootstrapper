import {
  NOTIFICATIONS_TARGET,
  NOTIFICATIONS_TYPE,
  DOMAIN_NAME_REGISTRAR,
} from './enums';
import { PriceClass } from '@aws-cdk/aws-cloudfront';

/**
 * @param - __artifactsSourceKey__: Fully qualified s3 path to target artifact (i.e path/to/some/file.zip)
 * @param - __environments__: List of environments to setup in a pipeline
 * @param - __notificationsType__: Type of deployment notifications to receive
 * @typeParam T value for this type will be either {@link IFrontendEnvironment} or {@link IBackendEnvironment}
 */
export interface IBasePipelineProps<T> {
  artifactsSourceKey: string;
  environments: T[];
  /**
   * @default - Pipeline Execution events
   */
  notificationsType?: NOTIFICATIONS_TYPE;
}

/**
 * @param - __notificationsTargetConfig__:  Notifications Target config
 */
export interface INotificationConfigProps {
  notificationsTargetConfig:
    | INotificationsEmailTargetConfig
    | INotificationsSlackTargetConfig;
}

/**
 * @param - __targetType__: Type of notification target
 * @param - __emailAddress__: Email to send notifications to
 */
export interface INotificationsEmailTargetConfig {
  targetType: NOTIFICATIONS_TARGET.EMAIL;
  emailAddress: string;
}

/**
 * @param - __targetType__: Type of notification target
 * @param - __channelName__: Tame of the slack channel
 * @param - __channelTypes__: Comma separated list of channel types we are dealing with
 * @param - __channelId__: Id of the channel to send notifications to
 * see [Slack api reference](https://api.slack.com/methods/conversations.list#arg_types)
 */
export interface INotificationsSlackTargetConfig {
  targetType: NOTIFICATIONS_TARGET.SLACK;
  channelName: string;
  /**
   * @default public_channel
   * When using private channels, value for this field must be provided
   */
  channelTypes?: string;
  /**
   * @default - channel name will be used to find channel id
   */
  channelId?: string;
}

/**
 * @param - __adminPermissions__: Indicates if deploy user with admin access be created and
 *  injected into a codebuild container
 * @param - __privilegedMode__: Enable this flag if you want to build Docker images or
 * want your builds to get elevated privileges
 * @param - __runtimeVariables__: Any custom text only Runtime variables to inject into codebuild container
 * @param - __buildSpec__: BuildSpec file to execute on codebuild <br />
 * See [BuildSpec Specification](https://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html)
 * for syntax. Also note that, dootstrapper only supports specifying buildspec in a JSON format
 * @inheritdoc {@link IBaseEnvironment}
 *
 */
export interface IBackendEnvironment extends IBaseEnvironment {
  /**
   * @default - No admin access is created, developer must provide accessKeyId and secretAccessKey in SSM
   */
  adminPermissions?: boolean;
  /**
   * @default false
   */
  privilegedMode?: boolean;
  /**
   * @default - No environment variables are passed to pipeline
   */
  runtimeVariables?: { [key: string]: string };
  buildSpec: any;
}

/**
 * @param - __aliases__: List of aliases to register as an alternate names for cloudfront distribution <br />
 * i.e for app to be available on `app.example.com` and `www.example.com`,
 * value for this param needs to be ["app.example.com", "www.example.com"]
 * @param - __cloudfrontPriceClass__: Cloudfront pricing plan <br />
 * for more information on pricing see [Cloudfront Pricing Plan](https://aws.amazon.com/cloudfront/pricing/)
 * @param - __defaultRootObject__: Default object to return when app is requested without any routes
 * @param - __errorRootObject__: Default object to return when unknown path is requested
 * @param - __domainNameRegistrar: Domain name registrar to use
 * @param - __assetsAliases__: List of aliases to register as asset distribution alternate names
 * @inheritdoc {@link IBaseEnvironment}
 */
export interface IFrontendEnvironment extends IBaseEnvironment {
  aliases: string[];
  /**
   * @default PRICE_CLASS_100 - Cheapest plan is selected
   */
  cloudfrontPriceClass?: PriceClass;
  /**
   * @default index.html
   */
  defaultRootObject?: string;
  /**
   * @default index.html
   */
  errorRootObject?: string;
  /**
   * @default none
   */
  domainNameRegistrar?: DOMAIN_NAME_REGISTRAR;
  /**
   * @default none - no assets distribution will be created
   */
  assetsAliases?: string[];
}

export interface IAssetsDistributionConfig {
  aliases: string[];
}

/**
 * @param - __name__: Environment name
 * @param - __approvalRequired__: Manual approval to add before deploy action.<br />
 * This creates an approval action just before current environment's deployment action, and
 * notifies user using notification target configured in {@link INotificationConfigProps}
 */
export interface IBaseEnvironment {
  name: string;
  /**
   * @default - No approval action is added
   */
  approvalRequired?: boolean;
}
