import { Plugin } from '@nocobase/server';
import WorkflowPlugin from '@nocobase/plugin-workflow';

import SignTokenInstruction from './SignTokenInstruction';

export class PluginWorkflowAuthTokenServer extends Plugin {
  async load() {
    const workflowPlugin = this.app.pm.get(WorkflowPlugin) as WorkflowPlugin;
    workflowPlugin.registerInstruction('sign-token', SignTokenInstruction);
  }
}

export default PluginWorkflowAuthTokenServer;
