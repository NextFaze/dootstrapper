import { App } from '@aws-cdk/core';
const assert1 = require('./test/assert1.json');

describe('Doostrapper', () => {
  let app: App;
  beforeEach(() => {
    app = new App();
  });
  // it('Should create with minimum config', () => {
  //   const stack = new Doostrapper(app, 'TestStack', {
  //     stackName: 'test-stack',
  //     pipelineConfig: {
  //       artifactsSourceKey: 'backend/artifacts/resources.zip',
  //     },
  //     notificationsConfig: {
  //       notificationsType: NOTIFICATIONS_TYPE.PIPELINE_EXECUTION,
  //       notificationsTargetConfig: {
  //         targetType: NOTIFICATIONS_TARGET.EMAIL,
  //         emailAddress: 'example@example.com',
  //         emailSubject: 'Deploy Notifications',
  //       },
  //     },
  //   });

  //   expect(stack).toBeTruthy();
  //   expectCDK(stack).toMatch(assert1, MatchStyle.EXACT);
  // });
});
