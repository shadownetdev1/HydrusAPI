<!-- insert_point -->

## <!-- version -->

<!--
    DO NOT change the insert_point and version lines above.
    This note, "_Optional notice_" (if unchanged), and any unused groups should be removed before release.
    Reference https://common-changelog.org/ for formatting.
    Make sure to attribute all authors. Ideally by linking to their GitHub profile with their name as the text.
    [shadownetdev1](https://github.com/shadownetdev1) for example.
-->

### Changed

- Installation instructions

### Added

- N/A

### Removed

- N/A

### Fixed

- Moved from a .npmignore file to the files property in package.json so that we stop packaging unneeded files (7dce9696e2dfc6926a1bdcc44613ee3cbc263bfb)
- Updated tests so that they create missing empty folders that git removes (81dcd1c5733911f88cec018f56c1bbc8747107a5)
- Fixed Build dependencies showing up as normal dependencies on NPM ()
