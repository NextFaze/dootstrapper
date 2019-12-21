import {
  countResources,
  expect as expectCDK,
  haveResource,
} from '@aws-cdk/assert';
import { Stack } from '@aws-cdk/core';
import { Core } from './core';

describe('Core construct ', () => {
  let stack: Stack;

  describe('with admin permissions', () => {
    beforeAll(() => {
      stack = new Stack();
      new Core(stack, 'Core', {
        adminPermissions: true,
        environmentName: 'test',
      });
    });

    it('should create iam user with admin policy', () => {
      expectCDK(stack).to(
        haveResource('AWS::IAM::User', {
          ManagedPolicyArns: [
            {
              'Fn::Join': [
                '',
                [
                  'arn:',
                  {
                    Ref: 'AWS::Partition',
                  },
                  ':iam::aws:policy/AdministratorAccess',
                ],
              ],
            },
          ],
        })
      );
    });

    it('should create user access key', () => {
      expectCDK(stack).to(
        haveResource('AWS::IAM::AccessKey', {
          UserName: {
            Ref: 'CoreDeployUser0144F14F',
          },
        })
      );
    });

    it('should create ssm params to store accessKeyId and secretAccessKey', () => {
      expectCDK(stack).to(countResources('AWS::SSM::Parameter', 2));
      expectCDK(stack).to(
        haveResource('AWS::SSM::Parameter', {
          Type: 'String',
          Name: '/doostrapper/test/access_key_id',
          Value: {
            Ref: 'CoreDeployCredentials7007E7FA',
          },
        })
      );
      expectCDK(stack).to(
        haveResource('AWS::SSM::Parameter', {
          Type: 'String',
          Name: '/doostrapper/test/secret_access_key',
          Value: {
            'Fn::GetAtt': ['CoreDeployCredentials7007E7FA', 'SecretAccessKey'],
          },
        })
      );
    });
  });

  describe('without admin permissions', () => {
    beforeAll(() => {
      stack = new Stack();
      new Core(stack, 'Core', {
        adminPermissions: false,
        environmentName: 'test',
      });
    });

    it('should not create user or access key for user', () => {
      expectCDK(stack).notTo(haveResource('AWS::IAM::User'));
      expectCDK(stack).notTo(haveResource('AWS::IAM::AccessKey'));
    });

    it('should create ssm params with mock access Key and secrets', () => {
      +expectCDK(stack).to(countResources('AWS::SSM::Parameter', 2));
      expectCDK(stack).to(
        haveResource('AWS::SSM::Parameter', {
          Type: 'String',
          Name: '/doostrapper/test/access_key_id',
          Value: 'ACCESS_KEY_ID',
        })
      );
      expectCDK(stack).to(
        haveResource('AWS::SSM::Parameter', {
          Type: 'String',
          Name: '/doostrapper/test/secret_access_key',
          Value: 'SECRET_ACCESS_KEY',
        })
      );
    });
  });
});
