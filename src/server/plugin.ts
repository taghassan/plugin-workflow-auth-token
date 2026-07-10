/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin } from '@nocobase/server';
import WorkflowPlugin from '@nocobase/plugin-workflow';

import SignTokenInstruction from './SignTokenInstruction';

/**
 * Parse expiresIn string ("1h", "1d", "7d", "30d", "90d") to milliseconds.
 * Returns 0 if format is unrecognized.
 */
function parseExpiresInMs(value: string | number): number {
  if (typeof value === 'number') return value * 1000;
  if (!value || typeof value !== 'string') return 0;
  const match = value.match(/^(\d+)([smhdwy])$/i);
  if (!match) return 0;
  const n = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  const mult: Record<string, number> = {
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
    w: 604_800_000,
    y: 31_536_000_000,
  };
  return n * (mult[unit] || 0);
}

export class PluginWorkflowAuthTokenServer extends Plugin {
  async load() {
    const workflowPlugin = this.app.pm.get(WorkflowPlugin) as WorkflowPlugin;
    workflowPlugin.registerInstruction('sign-token', SignTokenInstruction);

    // Wrap jwt.block() to skip tokens that exist in apiKeys table AND are still
    // within their declared expiresIn window. Without this, signOut would
    // permanently block API Key / SSO tokens. With time check, expired tokens
    // can be blocked normally so that "logout after expiry" behaves correctly
    // and tokens cannot be reused indefinitely past their expiresIn.
    const jwt = this.app.authManager.jwt;
    const originalBlock = jwt.block.bind(jwt);
    jwt.block = async (token: string) => {
      try {
        const apiKeysRepo = this.app.db.getRepository('apiKeys');
        if (apiKeysRepo) {
          const exists = await apiKeysRepo.findOne({ filter: { token } });
          if (exists) {
            const createdAt = new Date(exists.createdAt).getTime();
            const expiresInMs = parseExpiresInMs(exists.expiresIn);
            const stillValid = expiresInMs > 0 && Date.now() < createdAt + expiresInMs;
            if (stillValid) {
              // API key still within its expiresIn window — preserve it
              return null;
            }
            // Past expiresIn — fall through and block normally
          }
        }
      } catch {
        // If apiKeys check fails, fall through to original block
      }
      return originalBlock(token);
    };

    // Patch jwt.decode() so that on every JWT verification, we also check the
    // apiKey row's expiresIn. If the apiKey has passed its expiresIn window,
    // we ACTIVELY block the token (add to tokenBlacklist + bloom filter) and
    // throw "jwt expired". Subsequent requests with the same token are
    // rejected at the blacklist layer (fast path), no apiKey DB check needed.
    // This makes the apiKey table's expiresIn authoritative — necessary
    // because tokens may be signed with longer JWT exp than the apiKey wants.
    const originalDecode = jwt.decode.bind(jwt);
    jwt.decode = async (token: string) => {
      const decoded = await originalDecode(token);
      try {
        const apiKeysRepo = this.app.db.getRepository('apiKeys');
        if (apiKeysRepo) {
          const exists = await apiKeysRepo.findOne({ filter: { token } });
          if (exists) {
            const createdAt = new Date(exists.createdAt).getTime();
            const expiresInMs = parseExpiresInMs(exists.expiresIn);
            if (expiresInMs > 0 && Date.now() >= createdAt + expiresInMs) {
              // Actively blacklist the token so subsequent requests skip the
              // apiKeys lookup. originalBlock uses jti ?? token as key, with
              // expiration from JWT exp claim.
              await originalBlock(token);
              throw new Error('jwt expired');
            }
          }
        }
      } catch (err) {
        if (err.message === 'jwt expired') throw err;
        // any other error in our check — don't reject the token, fall through
      }
      return decoded;
    };
  }
}

export default PluginWorkflowAuthTokenServer;
