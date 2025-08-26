
# HydrusAPI

[![NPM](https://nodei.co/npm/hydrusapi.svg?data=d,s)](https://www.npmjs.com/package/hydrusapi)

[![Hydrus API Version: 80 (Partial support)](https://img.shields.io/badge/Hydrus%20API%20Version-80%20(Partial%20support)-blue)](https://github.com/hydrusnetwork/hydrus/blob/3dfc84dec9166ecec0dcf874e5ad0cb2b64d0bc4/docs/developer_api.md)
[![Tested with Hydrus version 635](https://img.shields.io/badge/Tested%20with%20Hydrus%20Version-635%20-blue)](https://github.com/hydrusnetwork/hydrus/releases/tag/v635)

[![Line Test Coverage Badge](https://raw.githubusercontent.com/shadownetdev1/HydrusAPI/refs/heads/main/badges/lines.svg)](https://shadownetdev1.github.io/HydrusAPI/coverage/)
[![Statement Test Coverage Badge](https://raw.githubusercontent.com/shadownetdev1/HydrusAPI/refs/heads/main/badges/statements.svg)](https://shadownetdev1.github.io/HydrusAPI/coverage/)
[![Function Test Coverage Badge](https://raw.githubusercontent.com/shadownetdev1/HydrusAPI/refs/heads/main/badges/functions.svg)](https://shadownetdev1.github.io/HydrusAPI/coverage/)
[![Branch Test Coverage Badge](https://raw.githubusercontent.com/shadownetdev1/HydrusAPI/refs/heads/main/badges/branches.svg)](https://shadownetdev1.github.io/HydrusAPI/coverage/)

<p align="center">
  <img width="100%" alt="Warning: This API implementation is in an alpha state and is provided as is. While I expect that all implemented endpoints work as expected I cannot guarantee that that is the case." src="https://raw.githubusercontent.com/shadownetdev1/HydrusAPI/refs/heads/main/badges/warning.svg">
</p>

HydrusAPI is an implementation of the [Hydrus client](https://github.com/hydrusnetwork/hydrus/) [API](https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md) in JavaScript. The goal is to fully support the most recent version of the [Hydrus client](https://github.com/hydrusnetwork/hydrus/) [API](https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md) in a typed, tested, and documented implementation. It was original based off of [hydrus.js](https://www.npmjs.com/package/hydrus.js), but it has drastically deviated from that project and should not be used as a drop in replacement.

As of currently most Hydrus API endpoints are implemented and all API endpoints from [hydrus.js](https://www.npmjs.com/package/hydrus.js) are implemented. A list of implemented endpoints are provided at the bottom of this page.

## Installation

If you are using npm installation is as simple as `npm install hydrusapi@alpha`.

For browser users [download the latest release](https://github.com/shadownetdev1/HydrusAPI/releases). Do note that minified versions are not yet provided.

## Documentation and Usage

HydrusAPI currently doesn't have any documentation or usage instructions. Your best bet is to look at how the [tests](src/tests/api.test.mjs) are implemented.

## Contributing

Contributions are greatly appreciated. These can come in the form of [reporting issues](https://github.com/shadownetdev1/HydrusAPI/issues/new/choose) and [creating pull requests](https://github.com/shadownetdev1/HydrusAPI/compare). If you have working knowledge of JavaScript and want to contribute, but don't know where to get started then looking at our [currently open issues](https://github.com/shadownetdev1/HydrusAPI/issues) or [unimplemented endpoints](#endpoints) would be suggested.

We do not provide a way support us monetarily (at this time). We suggest supporting the wonderful Hydrus Developer on their [Patreon](https://www.patreon.com/hydrus_dev) instead. This project would have no reason to exist if it wasn't for the over a decade of work that Hydrus Developer has put into their project.

## Versioning

HydrusAPI is versioned using \[Hydrus API version\].\[Hydrus version\].\[Minor version\]. This works well since all our endpoints should match a given Hydrus API/Client version pair. The version in [`package.json`](./package.json) is automatically updated to match the tag name on release.

## Thanks and Attribution

NPM badge provided by [NodeICO](https://nodei.co/npm/hydrusapi/).

Hydrus version badges provided by [Shields.io](https://shields.io/).

Code coverage badges provided by [Warren Jervis](https://github.com/wjervis7)'s [Vitest Badge Action](https://github.com/marketplace/actions/vitest-badge-action).

[Hummingbird at feeder image](/tests/files/hummingbird-at-feeder-1754669486LJt.jpg) provided by [Paul Brennan](https://www.zazzle.com/store/paul68) on [PublicDomainPictures.net](https://www.publicdomainpictures.net/en/view-image.php?image=711307&picture=hummingbird-at-feeder)

[Tree image](/tests/files/tree-1332664495LMO.jpg) provided by [George Hodan](https://www.facebook.com/hodanpictures) on [PublicDomainPictures.net](https://www.publicdomainpictures.net/en/view-image.php?image=20740&picture=tree)

[Tokyo travel image (used to test url imports)](/tests/files/japan-travel-poster-vintage-1590660773y1R.jpg) provided by Karen Arnold on [PublicDomainPictures.net](https://www.publicdomainpictures.net/en/view-image.php?image=339146&picture=japan-travel-poster-vintage)

[Venice traval image (used to test tagging and rating)](/test/files/venice-italy-travel-poster-15626778587Sq.jpg) provided by Karen Arnold on [PublicDomainPictures.net](https://www.publicdomainpictures.net/en/view-image.php?image=298999&picture=venice-italy-travel-poster)

## License

HydrusAPI is licensed under the same [DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE](license.txt) as Hydrus is [as of August 23rd 2025](https://github.com/hydrusnetwork/hydrus/blob/3dfc84dec9166ecec0dcf874e5ad0cb2b64d0bc4/license.txt).

## Endpoints

This is all the endpoints that exist as of Hydrus API version 80. Checked endpoints have been implemented.

- [x] `/api_version`
- [x] `/request_new_permissions`; While this is implemented and we do not expect it to break it cannot be automatically tested due to its nature.
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
- [x] `/add_files/generate_hashes`; While this is implemented it is not working due to Hydrus currently having a bug that makes it unusable. A pull request is pending that fixes this issue [here](https://github.com/hydrusnetwork/hydrus/pull/1784)
- [x] `/add_urls/get_url_files`
- [x] `/add_urls/get_url_info`
- [x] `/add_urls/add_url`
- [x] `/add_urls/associate_url`
- [x] `/add_tags/clean_tags`
- `/add_tags/get_tag_services`; No longer available. Use `/get_services` instead
- [x] `/add_tags/get_favourite_tags`
- [x] `/add_tags/get_siblings_and_parents`
- [x] `/add_tags/search_tags`
- [x] `/add_tags/add_tags`
- [x] `/add_tags/set_favourite_tags`
- [x] `/edit_ratings/set_rating`
- [ ] `/edit_times/increment_file_viewtime`
- [ ] `/edit_times/set_file_viewtime`
- [ ] `/edit_times/set_time`
- [ ] `/add_notes/set_notes`
- [ ] `/add_notes/delete_notes`
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
- [ ] `/manage_services/get_pending_counts`
- [ ] `/manage_services/commit_pending`
- [ ] `/manage_services/forget_pending`
- [x] `/manage_cookies/get_cookies`
- [x] `/manage_cookies/set_cookies`
- [ ] `/manage_headers/get_headers`
- [ ] `/manage_headers/set_headers`
- `/manage_headers/set_user_agent`; Will NOT BE implemented due to it being deprecated. Use `/manage_headers/set_headers` instead.
- [x] `/manage_pages/get_pages`
- [x] `/manage_pages/get_page_info`
- [ ] `/manage_pages/add_files`
- [x] `/manage_pages/focus_page`
- [ ] `/manage_pages/refresh_page`
- [ ] `/manage_popups/get_popups`
- [ ] `/manage_popups/add_popup`
- [ ] `/manage_popups/call_user_callable`
- [ ] `/manage_popups/cancel_popup`
- [ ] `/manage_popups/dismiss_popup`
- [ ] `/manage_popups/finish_popup`
- [ ] `/manage_popups/finish_and_dismiss_popup`
- [ ] `/manage_popups/update_popup`
- [ ] `/manage_database/force_commit`
- [ ] `/manage_database/lock_on`
- [ ] `/manage_database/lock_off`
- [ ] `/manage_database/mr_bones`
- [ ] `/manage_database/get_client_options`
