# Architecture

## Platform layers
1. Kernel
2. Dynamic Data Engine
3. Runtime Renderer
4. Farmandeh Studio
5. Module Engine
6. Workflow / Automation Engine
7. Permission Engine
8. Theme Engine
9. Template Engine
10. Multi-tenant Workspace Engine
11. Sync / Backup / Export
12. API / Integration Layer

## Isolation rule
A module must never directly own global navigation, authentication, theme state, or workspace state.

## Replaceability rule
Each page, module, workflow, theme and template has a stable key and version so it can be replaced independently.

## Multi-user rule
All business data is scoped by workspace_id from the beginning.

## Customization rule
Studio writes configuration records. Runtime renders those records. Source code is only required to add new engine capabilities.
