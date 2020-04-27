import { BuildEnvironmentVariableType } from '@aws-cdk/aws-codebuild';

// Pipeline Runtime environment variables support is limited to type PLAIN TEXT
/**
 * @hidden
 */
export function resolveRuntimeEnvironments(runtimeVariables: {
  [key: string]: string;
}) {
  return Object.keys(runtimeVariables).reduce((acc, key) => {
    if (runtimeVariables.hasOwnProperty(key)) {
      acc[key] = {
        type: BuildEnvironmentVariableType.PLAINTEXT,
        value: runtimeVariables[key],
      };
    }
    return acc;
  }, {} as any);
}
