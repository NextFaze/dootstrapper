import { App } from '@aws-cdk/core';
import { DoostrapperDelivery } from './resources/doostrapper-delivery';
import { NOTIFICATIONS_TARGET, NOTIFICATIONS_TYPE } from './resources/enums';

const app = new App();

new DoostrapperDelivery(app, 'DoostrapperStack', {
  stackName: 'deploy-bootstrapper-stack',
  pipelineConfig: {
    artifactsSourceKey: 'path/to/latest.zip',
    environments: [
      {
        approvalRequired: false,
        adminPermissions: true,
        buildSpec: {
          version: 0.2,
          env: {
            variables: {
              AWS_DEFAULT_REGION: 'ap-southeast-1',
            },
          },
          phases: {
            install: {
              commands: [
                'echo "Running from test"',
                'node --version',
                'cd ./test',
                'ls',
                'npm install --only=prod',
                'echo ${AWS_ACCESS_KEY_ID}',
                'echo ${AWS_SECRET_ACCESS_KEY}',
                'echo ${AWS_DEFAULT_REGION}',
              ],
            },
            pre_build: {
              commands: ['npm run synth'],
            },
            build: {
              commands: ['npm run deploy'],
            },
          },
        },
        name: 'test',
        runtimeVariables: {},
      },
      {
        approvalRequired: true,
        adminPermissions: true,
        buildSpec: {
          version: 0.2,
          phases: {
            install: {
              commands: [
                'echo "Running from Prod"',
                'node --version',
                'cd test',
                'ls',
                'npm install --only=prod',
                'echo ${ENV_VAR}',
                'echo ${AWS_ACCESS_KEY_ID}',
                'echo ${AWS_SECRET_ACCESS_KEY}',
                'echo ${AWS_DEFAULT_REGION}',
              ],
            },
            pre_build: {
              commands: ['npm run synth'],
            },
            build: {
              commands: ['npm run deploy'],
            },
          },
        },
        name: 'prod',
        runtimeVariables: {
          ENV_VAR: 'variable working',
        },
      },
    ],
  },
  notificationsConfig: {
    notificationsType: NOTIFICATIONS_TYPE.PIPELINE_EXECUTION,
    notificationsTargetConfig: {
      targetType: NOTIFICATIONS_TARGET.EMAIL,
      emailAddress: 'rpatel@nextfaze.com',
      emailSubject: 'Test Deploy Notifications',
    },
  },
});

app.synth();
