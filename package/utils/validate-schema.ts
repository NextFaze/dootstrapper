import AJV from 'ajv';

export function validateSchema(schema: any, data: any) {
  const ajv = new AJV();
  const valid = ajv.validate(schema, data);
  if (!valid) {
    return {
      valid: false,
      errors: ajv.errors,
    };
  }

  return { valid: true };
}
