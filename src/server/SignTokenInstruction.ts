/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Processor, Instruction, JOB_STATUS, FlowNodeModel } from '@nocobase/plugin-workflow';

/**
 * Generate a NocoBase auth token for a given user.
 * Registers the token in the apiKeys table (same as API Keys plugin),
 * so it can be managed and revoked from the admin panel.
 */
export default class SignTokenInstruction extends Instruction {
  async run(node: FlowNodeModel, prevJob, processor: Processor) {
    const userId = processor.getParsedValue(node.config.userId, node.id);
    const roleName = processor.getParsedValue(node.config.roleName, node.id) || undefined;
    const expiresIn = node.config.expiresIn || '1d';

    if (!userId) {
      return { result: { error: 'userId is required' }, status: JOB_STATUS.ERROR };
    }

    return this.signToken(userId, roleName, expiresIn);
  }

  async test(config) {
    const { userId, roleName, expiresIn = '1d' } = config;

    if (!userId) {
      return { result: { error: 'userId is required' }, status: JOB_STATUS.ERROR };
    }

    return this.signToken(userId, roleName, expiresIn);
  }

  private async signToken(userId: number, roleName?: string, expiresIn = '1d') {
    try {
      const app = this.workflow.app;

      const userRepo = app.db.getRepository('users');
      const user = await userRepo.findOne({ filterByTk: userId });
      if (!user) {
        return { result: { error: `User ${userId} not found` }, status: JOB_STATUS.ERROR };
      }

      if (roleName) {
        const rolesRepo = app.db.getRepository('users.roles', userId);
        const role = await rolesRepo.findOne({ filter: { name: roleName } });
        if (!role) {
          return { result: { error: `User ${userId} does not have role "${roleName}"` }, status: JOB_STATUS.ERROR };
        }
      }

      const payload: any = { userId: user.id };
      if (roleName) {
        payload.roleName = roleName;
      }
      const token = app.authManager.jwt.sign(payload, { expiresIn: expiresIn as any });

      // Register in apiKeys table — same as API Keys plugin.
      // Without this, auth:signOut will jwt.block() the token permanently
      // (since there's no jti, the full token string becomes the blacklist key).
      // With apiKeys record, the token is visible in admin panel and can be
      // properly managed (delete → block, not silently lost).
      const apiKeysRepo = app.db.getRepository('apiKeys');
      if (apiKeysRepo) {
        await apiKeysRepo.model.create({
          name: `workflow-${Date.now()}`,
          roleName: roleName || null,
          expiresIn,
          token,
          createdById: userId,
        });
      }

      return {
        result: { token, userId: user.id, roleName: roleName || null, expiresIn },
        status: JOB_STATUS.RESOLVED,
      };
    } catch (err) {
      return {
        result: { error: err.message },
        status: JOB_STATUS.ERROR,
      };
    }
  }
}
