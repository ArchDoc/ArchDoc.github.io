---
sidebar_position: 3
---

# Component

The **Component** schema is used to describe the various software components that make up your software system. A component can be thought of as a building block or module of the system, such as a microservice, database, external service, etc.

## Specification

| Property      | Type                 | Required | Description |
|---------------|----------------------|----------|-------------|
| description | `string` | ✅ | Short description of what this component does. |
| repository  | `string` |   | The URL to the code repository. |
| tags | `Array<string>` |  | A list of tags that should be applied to the component. |
| dependencies | `Map<string,string>` | ✅ | Describes the components that this specific component depends on. Each key of the map, must be a defined component. |
| documentation | `string` |  | Detailed documentation about the component. |

## Example

```yaml
components:
  api:
    description: The API gateway of the application.
    repository: https://github.com/MyOrg/api-gateway
    tags:
      - backend
      - public
    dependencies:
      auth-service: Creates and verifies JWTs 
      order-service: Manages user orders
      product-service: Searches product catalog
    documentation: This services provides a REST API to consumers.
```