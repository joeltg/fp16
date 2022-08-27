# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2022-08-27

### Changed

- Switch precision values to integer enums instead of string constants
- Upgrade ava to 4.0.0

## [0.1.4] - 2021-09-14

### Changed

- Use `Object.is` to test for `-0` instead of dividing by `Infinity`

## [0.1.3] - 2021-09-14

### Changed

- Update the README and fix tests to reflect that `Precision: "underflow"` may indicate rounding to the smallest signed subnormal value in addition to signed zero.

## [0.1.2] - 2021-09-14

### Changed

- Fixed the Deno publish webhook URL (point to repository root instead of subdirectory)

## [0.1.1] - 2021-09-14

### Added

- Publish to Deno!

### Changed

- Fixed some linkes in the README

## [0.1.0] - 2021-09-14

### Added

- Initial implementation and tests!
- This changelog!

[unreleased]: https://github.com/joeltg/big-varint/compare/v0.1.3...HEAD
[0.1.3]: https://github.com/joeltg/big-varint/compare/v0.1.3
[0.1.2]: https://github.com/joeltg/big-varint/compare/v0.1.2
[0.1.1]: https://github.com/joeltg/big-varint/compare/v0.1.1
[0.1.0]: https://github.com/joeltg/big-varint/compare/v0.1.0
