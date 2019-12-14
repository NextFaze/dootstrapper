#!/usr/bin/env node
import 'source-map-support/register'
import { DootstrapperStack } from '../lib/dootstrapper-stack'
import cdk = require('@aws-cdk/core')

const app = new cdk.App()
new DootstrapperStack(app, 'DootstrapperStack')
