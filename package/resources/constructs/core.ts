import { CfnAccessKey, ManagedPolicy, User } from '@aws-cdk/aws-iam';
import { StringParameter } from '@aws-cdk/aws-ssm';
import { Construct } from '@aws-cdk/core';

interface ICoreProps {
  adminPermissions: boolean;
  environmentName: string;
}

export class Core extends Construct {
  public readonly accessKeyId: StringParameter;
  public readonly secretAccessKey: StringParameter;
  private readonly credentials: CfnAccessKey;
  constructor(
    scope: Construct,
    id: string,
    { adminPermissions, environmentName }: ICoreProps
  ) {
    super(scope, id);

    if (adminPermissions) {
      const deployUser = new User(this, 'DeployUser', {
        managedPolicies: [
          ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'),
        ],
      });
      this.credentials = new CfnAccessKey(this, 'DeployCredentials', {
        userName: deployUser.userName,
      });
      // Developer will be required to create user with permissions manually
    }

    // create string parameter even if admin Permissions in not allowed
    // developer will be responsible for adding values to this param
    this.accessKeyId = new StringParameter(this, 'DeployAccessKeyId', {
      parameterName: `/dootstrapper/${environmentName}/access_key_id`,
      stringValue: this.credentials?.ref || 'ACCESS_KEY_ID',
    });
    this.secretAccessKey = new StringParameter(this, 'DeploySecretAccessKey', {
      parameterName: `/dootstrapper/${environmentName}/secret_access_key`,
      stringValue: this.credentials?.attrSecretAccessKey || 'SECRET_ACCESS_KEY',
    });
  }
}
