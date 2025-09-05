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
- Bumped target Hydrus version to 637
- GitHub releases now includes a zip file that contain the release
- Better documentation about version control.

### Added

- Implemented `manage_file_relationships.get_file_relationships()`
- Implemented `manage_file_relationships.get_potentials_count()`
- Implemented `manage_file_relationships.get_potential_pairs()`
- `types/hydrusapi.d.ts` is now packaged for GitHub releases

### Removed

- N/A

### Fixed

- N/A
