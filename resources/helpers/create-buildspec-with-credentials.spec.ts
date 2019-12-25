import { createBuildSpecWithCredentials } from './create-buildspec-with-credentials';

describe('createBuildSpecWithCredentials', () => {
  it('should add parameter-store config into buildspec', () => {
    const result = createBuildSpecWithCredentials({
      buildSpec: {},
      accessKeyIdParamName: '/path/to/accessKey',
      secretAccessKeyParamName: '/path/to/secret',
    });

    expect(result).toEqual({
      env: {
        'parameter-store': {
          AWS_ACCESS_KEY_ID: '/path/to/accessKey',
          AWS_SECRET_ACCESS_KEY: '/path/to/secret',
        },
      },
    });
  });

  it('should not overwrite existing env config', () => {
    const result = createBuildSpecWithCredentials({
      buildSpec: {
        env: {
          variables: {
            EXISTING_PARAM: 'some-existing-param',
          },
        },
      },
      accessKeyIdParamName: '/path/to/accessKey',
      secretAccessKeyParamName: '/path/to/secret',
    });

    expect(result).toEqual({
      env: {
        variables: {
          EXISTING_PARAM: 'some-existing-param',
        },
        'parameter-store': {
          AWS_ACCESS_KEY_ID: '/path/to/accessKey',
          AWS_SECRET_ACCESS_KEY: '/path/to/secret',
        },
      },
    });
  });

  it('should not overwrite existing param-store config', () => {
    const result = createBuildSpecWithCredentials({
      buildSpec: {
        env: {
          variables: {
            EXISTING_PARAM: 'some-existing-param',
          },
          'parameter-store': {
            PARAM_1: '/param1',
          },
        },
      },
      accessKeyIdParamName: '/path/to/accessKey',
      secretAccessKeyParamName: '/path/to/secret',
    });

    expect(result).toEqual({
      env: {
        variables: {
          EXISTING_PARAM: 'some-existing-param',
        },
        'parameter-store': {
          PARAM_1: '/param1',
          AWS_ACCESS_KEY_ID: '/path/to/accessKey',
          AWS_SECRET_ACCESS_KEY: '/path/to/secret',
        },
      },
    });
  });
});
