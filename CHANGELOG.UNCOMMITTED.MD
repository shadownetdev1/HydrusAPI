<!-- insert_point -->

## <!-- version -->

### Changed

- Reformatted inline documentation

### Added

- Implemented `edit_times.increment_file_viewtime()`
- Implemented `edit_times.set_file_viewtime()`
- Implemented `edit_times.set_time()`
- Added `TIMESTAMP_TYPE` and `SERVICE_TYPE` enums
- Added `tools.get_services_of_type()`
- Added `tools.get_services_of_name()`
- Added missing inline documentation

### Fixed

- The `ServicesObject` and `ServiceObject` type defs were documenting deprecated features causing them to be wrong for some endpoints
- Test for `edit_times.increment_file_viewtime()`
