import { Plugin } from '@nocobase/client';
import WorkflowPlugin from '@nocobase/plugin-workflow/client';

import SignTokenInstruction from './SignTokenInstruction';

export class PluginWorkflowAuthTokenClient extends Plugin {
  async load() {
    const workflow = this.app.pm.get('workflow') as WorkflowPlugin;
    workflow.registerInstruction('sign-token', SignTokenInstruction);
  }
}

export default PluginWorkflowAuthTokenClient;
