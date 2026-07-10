# @nocobase/plugin-workflow-auth-token

**Sign NocoBase auth tokens (JWT) from a workflow.** Issue a real, working login token for any user as a workflow step — the missing piece for SSO auto-login links, programmatic API keys and machine-to-machine access issued by business logic.

## Features

- **Sign Token node**: issues a JWT for a configured user (`userId` accepts variables), optional role, configurable `expiresIn` (`1h` / `1d` / `7d` / …)
- The token authenticates like a normal login token (verified: `auth:check` returns the user)
- Users / roles pickable via RemoteSelect in the node config; node supports test-run
- **Expiry-aware signOut protection**: tokens recorded in `apiKeys` are protected from being permanently black-listed by a user's signOut *while still inside their `expiresIn` window* — after expiry they block normally, so tokens can't be reused indefinitely

## Install

```bash
git clone https://github.com/Albert-mah/plugin-workflow-auth-token \
  packages/plugins/@nocobase/plugin-workflow-auth-token
yarn install
yarn pm add @nocobase/plugin-workflow-auth-token
yarn pm enable @nocobase/plugin-workflow-auth-token
```

## Usage

Add a **Sign Token** node; downstream nodes read `{{$jobsMapByNodeKey.<nodeKey>.token}}`.

Full SSO auto-login combo with [plugin-workflow-url-trigger](https://github.com/Albert-mah/plugin-workflow-url-trigger) and [plugin-workflow-crypto](https://github.com/Albert-mah/plugin-workflow-crypto): URL trigger receives an encrypted identity payload → Crypto decrypts & validates → Sign Token issues the JWT → HTTP Response redirects to the app with the token applied.

## Compatibility

Tested on NocoBase `2.1.x` and `2.2.0-beta.10` (issued token verified against `auth:check`).

## License

Apache-2.0

---

## 中文

在 NocoBase 工作流里**签发真实可登录的 JWT**：Sign Token 节点按 userId（支持变量）+ 可选角色 + expiresIn 出票，下游用 `{{$jobsMapByNodeKey.<node>.token}}` 取用；实测该 token 能通过 auth:check 正常鉴权。附带 signOut 保护：apiKeys 里登记的 token 在 expiresIn 窗口内不会被用户登出永久拉黑，过期后正常失效。与 url-trigger、crypto 组合实现 SSO 免密登录。已在 2.1.x 与 2.2.0-beta.10 实测。
