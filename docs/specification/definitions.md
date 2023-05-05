---
sidebar_position: 2
---

# Definitions

The following provides descriptions on how an ArchDoc Specification file is to be constructed and validated.

## ArchDoc Specification File
The ArchDoc Specification file is a YAML file that contains a single YAML document, where the structure equals the [ArchDoc](./schemas/archdoc.md) schema.

## Validation
Each schema in an ArchDoc Specification file has a defined specification, defining all available properties to use. When parsing an ArchDoc Specification file, an error **MUST** be thrown if any of the following is true:
 - **Type**: The property's type is not the same as the value provided in the file.
 - **Required**: The property is required and not present in the file.