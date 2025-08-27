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

- Reworded Installation instructions (775881d6ed4a6c9d7380585a1de22e8a4abf0c8a)
- Reworded Readme in regards to API endpoints (b7425f72b91b3a2cb41d2916bc96a8ddb60b7724)
- Moved `add_tags.add_tags`'s options definition into [hydrusapi.d.ts](/types/hydrusapi.d.ts) (b7425f72b91b3a2cb41d2916bc96a8ddb60b7724)
- Moved most cSpell ignore lines to the cspell property in package.json (b7425f72b91b3a2cb41d2916bc96a8ddb60b7724)
- Moved all remaining complex JSDoc objects into [hydrusapi.d.ts](/types/hydrusapi.d.ts) ()

### Added

- N/A

### Removed

- N/A

### Fixed

- Moved from a .npmignore file to the files property in package.json so that we stop packaging unneeded files (7dce9696e2dfc6926a1bdcc44613ee3cbc263bfb)
- Updated tests so that they create missing empty folders that git removes (81dcd1c5733911f88cec018f56c1bbc8747107a5)
- Fixed Build dependencies showing up as normal dependencies on NPM (6ec5a7d747865d7bd3467667c50b9c81c495a568)
