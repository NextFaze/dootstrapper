import { App } from '@aws-cdk/core';
import { Doostrapper } from './resources/doostrapper';
import { NOTIFICATIONS_TARGET, NOTIFICATIONS_TYPE } from './resources/enums';

const app = new App();

new Doostrapper(app, 'DoostrapperStack', {
  stackName: 'deploy-bootstrapper-stack',
  pipelineConfig: {
    artifactsSourceKey: 'path/to/latest.zip',
    environments: [
      {
        approvalRequired: false,
        buildSpec: {
          version: 0.2,
          phases: {
            install: {
              commands: [
                'echo "Running from test"',
                'node --version',
                'cd ./test',
                'ls',
                'npm install --only=prod',
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
        buildSpec: {
          version: 0.2,
          phases: {
            install: {
              commands: [
                'echo "Running from Prod"',
                'node --version',
                'cd test',
                'npm install --only=prod',
                'echo "${ENV_VAR}"',
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
