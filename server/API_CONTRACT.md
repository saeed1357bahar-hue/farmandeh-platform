# Server API Contract v0.1

Base scope: /api/v1/workspaces/{workspaceId}

Required resources:
- users
- roles
- permissions
- entities
- records
- modules
- pages
- forms
- workflows
- themes
- templates
- audit-log
- export
- import

Rules:
- Every request is authenticated.
- Every business record is workspace-scoped.
- Server stores configuration and business data separately.
- Configuration changes are versioned.
- Audit logging is mandatory for destructive actions.
