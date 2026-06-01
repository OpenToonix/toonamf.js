# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2]

### Fixed

- Added missing `iconv-lite` dependency
  to installation instructions in README.md

## [1.0.1]

### Fixed

- Badges in README.md
- Typo in package name in README.md

### Enhanced

- Use `iconv-lite` as a peer dependency for better handling of security issues
  and to allow users to choose their own version of `iconv-lite` if needed

## [1.0.0]

### Added

- Utility class to create ByteArray instances
  from various sources (arrays, buffers, etc.)
