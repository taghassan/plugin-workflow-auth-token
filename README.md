# @nocobase/plugin-workflow-auth-token

NocoBase workflow node for generating auth tokens (JWT). Used in SSO / passwordless login flows.

## Sign Token Node

- Configurable user ID (supports workflow variables)
- Optional role binding (user must have the role)
- Configurable expiry: 1h, 24h, 7d, 30d, 90d
- Uses same JWT mechanism as NocoBase API Keys

## Installation

```bash
yarn nocobase pm create @nocobase/plugin-workflow-auth-token
yarn nocobase pm enable @nocobase/plugin-workflow-auth-token
```
