
# HydrusAPI

[![NPM](https://nodei.co/npm/hydrusapi.svg?data=d,s)](https://www.npmjs.com/package/hydrusapi)

[![Hydrus API Version: 80 (Partial support)](https://img.shields.io/badge/Hydrus%20API%20Version-80%20(Partial%20support)-blue)](https://github.com/hydrusnetwork/hydrus/blob/3dfc84dec9166ecec0dcf874e5ad0cb2b64d0bc4/docs/developer_api.md)
[![Tested with Hydrus version 636](https://img.shields.io/badge/Tested%20with%20Hydrus%20Version-636%20-blue)](https://github.com/hydrusnetwork/hydrus/releases/tag/v636)
[![GitHub reported bug count](https://img.shields.io/github/issues-search?query=repo%3Ashadownetdev1%2FHydrusAPI%20is%3Aopen%20label%3Abug&label=Reported%20bugs)](https://github.com/shadownetdev1/HydrusAPI/issues?q=is%3Aissue%20state%3Aopen%20label%3Abug)
![GitHub Issues or Pull Requests](https://img.shields.io/github/issues/shadownetdev1/HydrusAPI)
[![npm bundle size](https://img.shields.io/bundlephobia/min/hydrusapi?label=Minified%20Size)](https://github.com/shadownetdev1/HydrusAPI/releases)

[![Line Test Coverage Badge](https://raw.githubusercontent.com/shadownetdev1/HydrusAPI/refs/heads/main/badges/lines.svg)](https://shadownetdev1.github.io/HydrusAPI/coverage/)
[![Statement Test Coverage Badge](https://raw.githubusercontent.com/shadownetdev1/HydrusAPI/refs/heads/main/badges/statements.svg)](https://shadownetdev1.github.io/HydrusAPI/coverage/)
[![Function Test Coverage Badge](https://raw.githubusercontent.com/shadownetdev1/HydrusAPI/refs/heads/main/badges/functions.svg)](https://shadownetdev1.github.io/HydrusAPI/coverage/)
[![Branch Test Coverage Badge](https://raw.githubusercontent.com/shadownetdev1/HydrusAPI/refs/heads/main/badges/branches.svg)](https://shadownetdev1.github.io/HydrusAPI/coverage/)

<p align="center">
  <img width="100%" alt="Warning: This API implementation is provided as is (just like Hydrus). You should be regularly backing up your Hydrus database regardless of any external libraries (like this one) that you are or aren't using." src="https://raw.githubusercontent.com/shadownetdev1/HydrusAPI/refs/heads/main/badges/warning.svg">
  <!-- The above text is also defined in `badges/warning.svg`. It only exists here to assist screen readers. When updating this text make sure change the text in `badges/warning.svg` to match -->
</p>

HydrusAPI is an implementation of the [Hydrus client](https://github.com/hydrusnetwork/hydrus/) [API](https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md) in JavaScript. The goal is to fully support the most recent version of the [Hydrus client](https://github.com/hydrusnetwork/hydrus/) [API](https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md) in a typed, tested, and documented implementation. It was original based off of [hydrus.js](https://www.npmjs.com/package/hydrus.js), but it has drastically deviated from that project and should not be used as a drop in replacement.

As of currently most Hydrus API endpoints are implemented and all the API endpoints supported by [hydrus.js](https://www.npmjs.com/package/hydrus.js) are implemented. A list of implemented endpoints are provided at [the bottom of this page](#endpoints).

## Installation

If you are using npm or an alternative package manager then installation is as simple as `npm install hydrusapi` or `[package manager] install hydrusapi`.

For other users you can download from the [releases page](https://github.com/shadownetdev1/HydrusAPI/releases).

## Documentation and Usage

We highly suggest making sure that at least the Hydrus API version if not the Hydrus Client version matches the version of HydrusAPI that you are using.

HydrusAPI currently doesn't have any documentation or usage instructions. Your best option at the moment is to look at how the [tests](tests/api.test.mjs) are implemented.

## Contributing

Contributions are greatly appreciated. These can come in the form of [reporting issues](https://github.com/shadownetdev1/HydrusAPI/issues/new/choose) and [creating pull requests](https://github.com/shadownetdev1/HydrusAPI/compare). If you have working knowledge of JavaScript and want to contribute, but don't know where to get started then looking at our [currently open issues](https://github.com/shadownetdev1/HydrusAPI/issues) or [unimplemented endpoints](#endpoints) would be suggested.

We do not provide a way support us monetarily (at this time). We suggest supporting the wonderful Hydrus Developer on their [Patreon](https://www.patreon.com/hydrus_dev) instead. This project would have no reason to exist if it wasn't for the over a decade of work that Hydrus Developer has put into their project.

## Versioning

HydrusAPI is versioned using \[Hydrus API version\].\[Hydrus version\].\[HydrusAPI version\]. This works well since all our endpoints should match a given Hydrus API/Client version pair. We suggest matching `Hydrus API version` and `Hydrus version` as closely as possible. Mismatched `Hydrus version`s should be okay, but mismatched `Hydrus API version`s could cause serious issues.

## Thanks and Attribution

NPM badge provided by [NodeICO](https://nodei.co/npm/hydrusapi/).

Hydrus version, reported bugs, issue count, and minified size badges provided by [Shields.io](https://shields.io/).

Code coverage badges provided by [Warren Jervis](https://github.com/wjervis7)'s [Vitest Badge Action](https://github.com/marketplace/actions/vitest-badge-action).

[Hummingbird at feeder image](https://raw.githubusercontent.com/shadownetdev1/HydrusAPI/main/tests/files/hummingbird-at-feeder-1754669486LJt.jpg) provided by [Paul Brennan](https://www.zazzle.com/store/paul68) on [PublicDomainPictures.net](https://www.publicdomainpictures.net/en/view-image.php?image=711307&picture=hummingbird-at-feeder).

[Tree image](https://raw.githubusercontent.com/shadownetdev1/HydrusAPI/main/tests/files/tree-1332664495LMO.jpg) provided by [George Hodan](https://www.facebook.com/hodanpictures) on [PublicDomainPictures.net](https://www.publicdomainpictures.net/en/view-image.php?image=20740&picture=tree).

[Tokyo travel image (used to test url imports)](https://raw.githubusercontent.com/shadownetdev1/HydrusAPI/main/tests/files/japan-travel-poster-vintage-1590660773y1R.jpg) provided by Karen Arnold on [PublicDomainPictures.net](https://www.publicdomainpictures.net/en/view-image.php?image=339146&picture=japan-travel-poster-vintage).

[Venice travel image (used to test tagging and rating)](https://raw.githubusercontent.com/shadownetdev1/HydrusAPI/main/tests/files/venice-italy-travel-poster-15626778587Sq.jpg) provided by Karen Arnold on [PublicDomainPictures.net](https://www.publicdomainpictures.net/en/view-image.php?image=298999&picture=venice-italy-travel-poster).

[Seascape Sunset image (used to test notes and timestamps)](https://raw.githubusercontent.com/shadownetdev1/HydrusAPI/main/tests/files/seascape-sunset-1500478633cRS.jpg) provided by Jean Beaufort on [PublicDomainPictures.net](https://www.publicdomainpictures.net/en/view-image.php?image=222856&picture=seascape-sunset).

## License

HydrusAPI is licensed under the same [DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE](license.txt) as Hydrus is [as of August 23rd 2025](https://github.com/hydrusnetwork/hydrus/blob/3dfc84dec9166ecec0dcf874e5ad0cb2b64d0bc4/license.txt).

## Endpoints

This is all the endpoints that exist as of Hydrus API version 80. Checked endpoints have been implemented or are no longer available.

- [x] `/api_version`
- [x] `/request_new_permissions`
  - While this is implemented and we do not expect it to break it cannot be automatically tested due to its nature.
- [x] `/session_key`
- [x] `/verify_access_key`
- [x] `/get_service`
- [x] `/get_services`
- [x] `/add_files/add_file`
- [x] `/add_files/delete_files`
- [x] `/add_files/undelete_files`
- [x] `/add_files/clear_file_deletion_record`
- [x] `/add_files/migrate_files`
- [x] `/add_files/archive_files`
- [x] `/add_files/unarchive_files`
- [x] `/add_files/generate_hashes`
- [x] `/add_urls/get_url_files`
- [x] `/add_urls/get_url_info`
- [x] `/add_urls/add_url`
- [x] `/add_urls/associate_url`
- [x] `/add_tags/clean_tags`
- [x] `/add_tags/get_tag_services`
  - No longer supported.
  - Use `/get_services` instead.
- [x] `/add_tags/get_favourite_tags`
- [x] `/add_tags/get_siblings_and_parents`
- [x] `/add_tags/search_tags`
- [x] `/add_tags/add_tags`
- [x] `/add_tags/set_favourite_tags`
- [x] `/edit_ratings/set_rating`
- [x] `/edit_times/increment_file_viewtime`
- [x] `/edit_times/set_file_viewtime`
- [x] `/edit_times/set_time`
- [x] `/add_notes/set_notes`
- [x] `/add_notes/delete_notes`
- [x] `/get_files/search_files`
- [x] `/get_files/file_hashes`
- [x] `/get_files/file_metadata`
- [x] `/get_files/file`
- [x] `/get_files/thumbnail`
- [x] `/get_files/file_path`
- [x] `/get_files/thumbnail_path`
- [x] `/get_files/local_file_storage_locations`
- [x] `/get_files/render`
- [ ] `/manage_file_relationships/get_file_relationships`
- [ ] `/manage_file_relationships/get_potentials_count`
- [ ] `/manage_file_relationships/get_potential_pairs`
- [ ] `/manage_file_relationships/get_random_potentials`
- [ ] `/manage_file_relationships/remove_potentials`
- [ ] `/manage_file_relationships/set_file_relationships`
- [ ] `/manage_file_relationships/set_kings`
- [x] `/manage_services/get_pending_counts`
- [x] `/manage_services/commit_pending`
  - Due to the nature of this endpoint it doesn't have a test.
- [x] `/manage_services/forget_pending`
  - Due to the nature of this endpoint it doesn't have a test.
- [x] `/manage_cookies/get_cookies`
- [x] `/manage_cookies/set_cookies`
- [ ] `/manage_headers/get_headers`
- [ ] `/manage_headers/set_headers`
- [x] `/manage_headers/set_user_agent`
  - Will NOT BE implemented due to it being deprecated.
  - Use `/manage_headers/set_headers` instead.
- [x] `/manage_pages/get_pages`
- [x] `/manage_pages/get_page_info`
- [x] `/manage_pages/add_files`
- [x] `/manage_pages/focus_page`
- [x] `/manage_pages/refresh_page`
- [ ] `/manage_popups/get_popups`
- [ ] `/manage_popups/add_popup`
- [ ] `/manage_popups/call_user_callable`
- [ ] `/manage_popups/cancel_popup`
- [ ] `/manage_popups/dismiss_popup`
- [ ] `/manage_popups/finish_popup`
- [ ] `/manage_popups/finish_and_dismiss_popup`
- [ ] `/manage_popups/update_popup`
- [x] `/manage_database/force_commit`
- [x] `/manage_database/lock_on`
- [x] `/manage_database/lock_off`
- [x] `/manage_database/mr_bones`
- [x] `/manage_database/get_client_options`
  - While this is implemented it will not be documented or tested due to its UNSTABLE nature!
  - Expect the results of this endpoint to change with each Hydrus Client version!
