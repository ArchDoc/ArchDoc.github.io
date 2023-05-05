---
sidebar_position: 2
---

# User

The **User** schema allows users of the software system to be described and documented. This schema is useful in describing the different types of users who interact with the system, their roles, and what components they utilize for their use case.

## Specification

| Property      | Type                 | Required | Description |
|---------------|----------------------|----------|-------------|
| description | `string` | ✅ | Short description of how the user interacts with your system. |
| tags | `Array<string>` |  | A list of tags that should be applied to the user. |
| dependencies | `Map<string,string>` | ✅ | Describes the components that this specific user depends on. Each key of the map, must be a defined component. |
| documentation | `string` |  | Detailed documentation about the user. |

## Example

```yaml
users:
  user:
    description: A normal user of the app.
    tags:
      - customer
    dependencies:
      ui: Interfaces with the UI
    documentation: Users will primarily utilize the web console to interface with the rest of our system.
```