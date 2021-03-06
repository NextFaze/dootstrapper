export enum NOTIFICATIONS_TYPE {
  PIPELINE_EXECUTION = 'pipelineExecution',
  STAGE_EXECUTION = 'stageExecution',
  ACTION_EXECUTION = 'actionExecution',
  NONE = 'none',
}

export enum NOTIFICATIONS_TARGET {
  EMAIL = 'email',
  SLACK = 'slack',
}

/**
 * @hidden
 */
export enum NOTIFICATIONS_DETAILS_TYPE {
  PIPELINE = 'CodePipeline Pipeline Execution State Change',
  STAGE = 'CodePipeline Stage Execution State Change',
  ACTION = 'CodePipeline Action Execution State Change',
}

export enum DOMAIN_NAME_REGISTRAR {
  AWS = 'aws',
}
