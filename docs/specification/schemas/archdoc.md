---
sidebar_position: 1
---

# ArchDoc

The **ArchDoc** schema is the root-level schema of an ArchDoc Specification file. 

## Specification

| Property     | Type     | Required | Description |
|--------------|----------|----------|-------------|
| archdoc      | `string` | ✅ | The ArchDoc Specification version of the document. |
| users        | <code>Map<string,[User](./user.md)></code> | ✅ | An object that defines the users of your software system. Each key is the short name of a type of user that interacts with your system. |
| components   | <code>Map<string,[Component](./component.md)></code> | ✅ | An object that defines the components of your software system. Each key is the short name of a type of component that powers your system. |

## Example

```yaml
archdoc: 1.0.0
users:
    user:
        ...
    admin:
        ...

components:
    ui:
        ...
    api:
        ...
```