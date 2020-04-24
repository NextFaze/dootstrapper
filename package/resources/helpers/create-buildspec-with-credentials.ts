/**
 * @hidden
 */
export function createBuildSpecWithCredentials({
  buildSpec,
  accessKeyIdParamName,
  secretAccessKeyParamName,
}: {
  buildSpec: any;
  accessKeyIdParamName: string;
  secretAccessKeyParamName: string;
}) {
  if (buildSpec.constructor !== {}.constructor) {
    throw new Error(
      'BuildSpec file must be of type object yml is not supported!'
    );
  }
  const ssmParams = {
    AWS_ACCESS_KEY_ID: accessKeyIdParamName,
    AWS_SECRET_ACCESS_KEY: secretAccessKeyParamName,
  };

  // persist user defined parameter-store variables if there is any
  if (!buildSpec.env) {
    buildSpec.env = {
      'parameter-store': {
        ...ssmParams,
      },
    };
  } else {
    buildSpec.env.variables = {
      ...buildSpec.env.variables,
    };
    buildSpec.env['parameter-store'] = {
      ...buildSpec.env['parameter-store'],
      ...ssmParams,
    };
  }
  return buildSpec;
}
