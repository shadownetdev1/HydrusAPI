<!-- insert_point -->

## <!-- version -->

<!--
    DO NOT change the insert_point and version lines above.
    This note, "_Optional notice_" (if unchanged), and any unused groups should be removed before release.
    Reference https://common-changelog.org/ for formatting.
    Make sure to attribute all authors. Ideally by linking to their GitHub profile with their name as the text.
    [shadownetdev1](https://github.com/shadownetdev1) for example.
-->

_Optional notice_

### Changed

- HydrusAPI now throws an error on an API version mismatch.
  - This can be overridden using the `api_version_override` api option, but support will not be provided for this use case.
  - HydrusAPI now makes sure that a version check happens first even if the first endpoint called is not `api_version()`.
- Better documentation about version control.

### Added

- Implemented `manage_file_relationships.get_file_relationships()`
- Implemented `manage_file_relationships.get_potentials_count()`

### Removed

- N/A

### Fixed

- N/A
