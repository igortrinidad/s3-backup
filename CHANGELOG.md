# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.0.0] (2025-01-03)

### BREAKING CHANGES

* **aws-sdk**: Migrated from AWS SDK v2 to AWS SDK v3
* **storage**: Replaced @slynova/flydrive with custom S3StorageManager using AWS SDK v3
* **dependencies**: Removed aws-sdk v2 and @slynova/flydrive dependencies

### Features

* **s3**: Implement custom S3StorageManager with AWS SDK v3 client
* **performance**: Improved performance and reduced bundle size with modular AWS SDK v3
* **security**: Enhanced security with latest AWS SDK v3 features and best practices

### Migration Guide

This is a major version upgrade that requires AWS SDK v3. The S3 configuration format remains the same:
- `key`: AWS Access Key ID
- `secret`: AWS Secret Access Key  
- `region`: AWS Region
- `bucket`: S3 Bucket name

No configuration changes are required, only the underlying implementation has been modernized.

### 1.0.1 (2022-09-15)


### Routine tasks | Implementações gerais

* add support to pgsql database ([fd32557](https://github.com/igortrinidad/s3-backup/commit/fd325576624346bf78911f134cea107adc9d4e8e))
* audit and fix the packages ([6cead42](https://github.com/igortrinidad/s3-backup/commit/6cead427d8a0a4f2f3d1ad5356ccb7771cd79879))


### Bug Fixes | Melhorias

* change port data to right place ([24831aa](https://github.com/igortrinidad/s3-backup/commit/24831aa3cd2e42427192338c6866c7d2bde5eb80))
* typo variable name ([09310b9](https://github.com/igortrinidad/s3-backup/commit/09310b94e11244598e785aa9d11c34fdd3a5256d))
