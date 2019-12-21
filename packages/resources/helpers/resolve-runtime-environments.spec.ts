import { resolveRuntimeEnvironments } from './resolve-runtime-environments';

describe('ResolveRuntimeEnvironments', () => {
  it('should resolve to valid codebuild environment params', () => {
    const result = resolveRuntimeEnvironments({
      TEST_ENV_1: 'this is environment 1',
      TEST_ENV_2: 'this is environment 2',
    });

    expect(result).toEqual({
      TEST_ENV_1: {
        type: 'PLAINTEXT',
        value: 'this is environment 1',
      },
      TEST_ENV_2: {
        type: 'PLAINTEXT',
        value: 'this is environment 2',
      },
    });
  });

  it('should handle empty environment variables', () => {
    const result = resolveRuntimeEnvironments({});
    expect(result).toEqual({});
  });
});
