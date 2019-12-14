import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert'
import cdk = require('@aws-cdk/core')
import Dootstrapper = require('../lib/dootstrapper-stack')

test('Empty Stack', () => {
  const app = new cdk.App()
  // WHEN
  const stack = new Dootstrapper.DootstrapperStack(app, 'MyTestStack')
  // THEN
  expectCDK(stack).to(
    matchTemplate(
      {
        Resources: {},
      },
      MatchStyle.EXACT
    )
  )
})
