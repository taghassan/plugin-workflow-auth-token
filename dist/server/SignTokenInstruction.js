/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var SignTokenInstruction_exports = {};
__export(SignTokenInstruction_exports, {
  default: () => SignTokenInstruction
});
module.exports = __toCommonJS(SignTokenInstruction_exports);
var import_plugin_workflow = require("@nocobase/plugin-workflow");
class SignTokenInstruction extends import_plugin_workflow.Instruction {
  async run(node, prevJob, processor) {
    const userId = processor.getParsedValue(node.config.userId, node.id);
    const roleName = processor.getParsedValue(node.config.roleName, node.id) || void 0;
    const expiresIn = node.config.expiresIn || "1d";
    if (!userId) {
      return { result: { error: "userId is required" }, status: import_plugin_workflow.JOB_STATUS.ERROR };
    }
    return this.signToken(userId, roleName, expiresIn);
  }
  async test(config) {
    const { userId, roleName, expiresIn = "1d" } = config;
    if (!userId) {
      return { result: { error: "userId is required" }, status: import_plugin_workflow.JOB_STATUS.ERROR };
    }
    return this.signToken(userId, roleName, expiresIn);
  }
  async signToken(userId, roleName, expiresIn = "1d") {
    try {
      const app = this.workflow.app;
      const userRepo = app.db.getRepository("users");
      const user = await userRepo.findOne({ filterByTk: userId });
      if (!user) {
        return { result: { error: `User ${userId} not found` }, status: import_plugin_workflow.JOB_STATUS.ERROR };
      }
      if (roleName) {
        const rolesRepo = app.db.getRepository("users.roles", userId);
        const role = await rolesRepo.findOne({ filter: { name: roleName } });
        if (!role) {
          return { result: { error: `User ${userId} does not have role "${roleName}"` }, status: import_plugin_workflow.JOB_STATUS.ERROR };
        }
      }
      const payload = { userId: user.id };
      if (roleName) {
        payload.roleName = roleName;
      }
      const token = app.authManager.jwt.sign(payload, { expiresIn });
      const apiKeysRepo = app.db.getRepository("apiKeys");
      if (apiKeysRepo) {
        await apiKeysRepo.model.create({
          name: `workflow-${Date.now()}`,
          roleName: roleName || null,
          expiresIn,
          token,
          createdById: userId
        });
      }
      return {
        result: { token, userId: user.id, roleName: roleName || null, expiresIn },
        status: import_plugin_workflow.JOB_STATUS.RESOLVED
      };
    } catch (err) {
      return {
        result: { error: err.message },
        status: import_plugin_workflow.JOB_STATUS.ERROR
      };
    }
  }
}
