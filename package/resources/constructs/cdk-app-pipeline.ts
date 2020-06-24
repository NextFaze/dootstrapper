import { IBasePipelineProps, IBackendEnvironment } from './../interfaces';
import { BasePipeline } from './base-pipeline';
import { Artifact } from '@aws-cdk/aws-codepipeline';
import { Construct } from '@aws-cdk/core';
import { paramCase, pascalCase } from 'change-case';
import { resolveRuntimeEnvironments } from '../helpers/resolve-runtime-environments';
import { CredentialStore } from './credential-store';

interface ICdkAppPipelineProps extends IBasePipelineProps<IBackendEnvironment> {
  artifactsSourceKey: string;
  environments: IBackendEnvironment[];
}

/**
 * @hidden
 */
export class CdkAppPipeline extends BasePipeline {
  constructor(
    scope: Construct,
    id: string,
    private props: ICdkAppPipelineProps
  ) {
    super(scope, id, {
      artifactSourceKey: props.artifactsSourceKey,
      notificationsType: props.notificationsType,
    });
    const { environments } = this.props;

    // Deploy stages
    environments.forEach((environment) => {
      const { adminPermissions = false, privilegedMode } = environment;
      const { accessKeyId, secretAccessKey } = new CredentialStore(
        this,
        `${environment.name}DootstrapperCore`,
        {
          adminPermissions,
          environmentName: environment.name,
        }
      );

      const output = new Artifact(pascalCase(`${environment.name}Source`));
      const stageName = pascalCase(`${environment.name}Deploy`);
      const { runtimeVariables = {}, buildSpec } = environment;
      const runTimeEnvironments = resolveRuntimeEnvironments(runtimeVariables);
      const actions = [];
      let runOrder = 0;

      if (environment.approvalRequired) {
        actions.push(
          this.createManualApprovalAction({
            actionName: paramCase(`${environment.name}Approve`),
            runOrder: ++runOrder,
          })
        );
      }

      actions.push(
        this.createCodebuildAction({
          privilegedMode: privilegedMode,
          id: pascalCase(`${environment.name}PipelineProject`),
          stage: stageName,
          runOrder: ++runOrder,
          runtimeVariables: runTimeEnvironments,
          // always create new object instance of build for new environment
          buildSpec: { ...buildSpec },
          inputSource: this.checkoutSource,
          outputSource: output,
          accessKeyId,
          secretAccessKey,
        })
      );
      // add multiple stages per environment
      this.pipeline.addStage({
        actions,
        stageName,
      });
    });
  }
}
