# @nocobase/plugin-workflow-auth-token

NocoBase workflow instruction node for generating JWT authentication tokens. Used in SSO and passwordless login flows.

## Features

- **User selection** — dropdown search by nickname, or use workflow variables (e.g. from a query/decrypt node)
- **Role binding** — optional, restricts the token to a specific role
- **Configurable expiry** — 1h, 24h, 7d, 30d, 90d
- **NocoBase-native JWT** — same signing mechanism as API Keys plugin, recognized by standard auth check

## Installation

```bash
yarn nocobase pm create @nocobase/plugin-workflow-auth-token
yarn nocobase pm enable @nocobase/plugin-workflow-auth-token
```

## Node Configuration

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| User | number (select or variable) | — | User ID. Dropdown searches by nickname, or use `{{$jobsMapByNodeKey.xxx.userId}}` |
| Role | string (select or variable) | _(empty)_ | Optional. Token operates as this role. User must have the role |
| Expires in | select | 1d | Token lifetime: 1h, 24h, 7d, 30d, 90d |

## Node Output

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "userId": 2,
  "roleName": "member",
  "expiresIn": "1d"
}
```

## Usage Examples

### SSO login via encrypted email link

```
[URL Trigger /api/sso/**]
    → [Crypto: decrypt token → {userId: 2}]
    → [Sign Token: userId={{...userId}}, expires=24h]
    → [HTTP Response: redirect /admin/?token={{...token}}]
```

### Email-based passwordless login

```
[URL Trigger /api/sso/email-login]
    → [Query: find user by {{$context.query.email}}]
    → [Sign Token: userId={{...id}}, expires=1h]
    → [HTTP Response: data={{...}} (return token as JSON)]
```

### API key generation in workflow

```
[Collection Trigger: on user create]
    → [Sign Token: userId={{$context.data.id}}, role=member, expires=90d]
    → [Update Record: save token to user.apiKey field]
```

## Token Details

- **Signing**: `app.authManager.jwt.sign()` — same key/algorithm as all NocoBase auth
- **Payload**: `{ userId, roleName? }` — no `temp` flag (behaves like API key, not session)
- **Validation**: pass via `Authorization: Bearer <token>` header or `?authenticator=basic&token=<token>` query
- **Revocation**: can be blocked via JWT blacklist
- **No session tracking**: simpler than `signNewToken()`, no auto-renewal

## Error Handling

| Scenario | Result |
|----------|--------|
| Missing userId | `JOB_STATUS.ERROR` "userId is required" |
| User not found | `JOB_STATUS.ERROR` "User xxx not found" |
| User doesn't have specified role | `JOB_STATUS.ERROR` "User does not have role" |
