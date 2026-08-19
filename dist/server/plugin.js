/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var plugin_exports = {};
__export(plugin_exports, {
  PluginWorkflowAuthTokenServer: () => PluginWorkflowAuthTokenServer,
  default: () => plugin_default
});
module.exports = __toCommonJS(plugin_exports);
var import_server = require("@nocobase/server");
var import_plugin_workflow = __toESM(require("@nocobase/plugin-workflow"));
var import_SignTokenInstruction = __toESM(require("./SignTokenInstruction"));
function parseExpiresInMs(value) {
  if (typeof value === "number") return value * 1e3;
  if (!value || typeof value !== "string") return 0;
  const match = value.match(/^(\d+)([smhdwy])$/i);
  if (!match) return 0;
  const n = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  const mult = {
    s: 1e3,
    m: 6e4,
    h: 36e5,
    d: 864e5,
    w: 6048e5,
    y: 31536e6
  };
  return n * (mult[unit] || 0);
}
class PluginWorkflowAuthTokenServer extends import_server.Plugin {
  async load() {
    const workflowPlugin = this.app.pm.get(import_plugin_workflow.default);
    workflowPlugin.registerInstruction("sign-token", import_SignTokenInstruction.default);
    const jwt = this.app.authManager.jwt;
    const originalBlock = jwt.block.bind(jwt);
    jwt.block = async (token) => {
      try {
        const apiKeysRepo = this.app.db.getRepository("apiKeys");
        if (apiKeysRepo) {
          const exists = await apiKeysRepo.findOne({ filter: { token } });
          if (exists) {
            const createdAt = new Date(exists.createdAt).getTime();
            const expiresInMs = parseExpiresInMs(exists.expiresIn);
            const stillValid = expiresInMs > 0 && Date.now() < createdAt + expiresInMs;
            if (stillValid) {
              return null;
            }
          }
        }
      } catch {
      }
      return originalBlock(token);
    };
    const originalDecode = jwt.decode.bind(jwt);
    jwt.decode = async (token) => {
      const decoded = await originalDecode(token);
      try {
        const apiKeysRepo = this.app.db.getRepository("apiKeys");
        if (apiKeysRepo) {
          const exists = await apiKeysRepo.findOne({ filter: { token } });
          if (exists) {
            const createdAt = new Date(exists.createdAt).getTime();
            const expiresInMs = parseExpiresInMs(exists.expiresIn);
            if (expiresInMs > 0 && Date.now() >= createdAt + expiresInMs) {
              await originalBlock(token);
              throw new Error("jwt expired");
            }
          }
        }
      } catch (err) {
        if (err.message === "jwt expired") throw err;
      }
      return decoded;
    };
  }
}
var plugin_default = PluginWorkflowAuthTokenServer;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PluginWorkflowAuthTokenServer
});
