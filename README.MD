
# HyAPI

[![Hydrus API Version: 80 (Partial support)](https://img.shields.io/badge/Hydrus%20API%20Version-80%20(Partial%20support)-blue)](https://github.com/hydrusnetwork/hydrus/blob/3dfc84dec9166ecec0dcf874e5ad0cb2b64d0bc4/docs/developer_api.md)
[![Tested with Hydrus version 635](https://img.shields.io/badge/Tested%20with%20Hydrus%20Version-635%20-blue)](https://github.com/hydrusnetwork/hydrus/releases/tag/v635)

<!-- [![NPM](https://nodei.co/npm/hyapi.svg?data=d,s)](https://www.npmjs.com/package/hyapi) -->

[![Line Test Coverage Badge](badges/lines.svg)](https://shadownetdev1.github.io/HyAPI/coverage/)
[![Statement Test Coverage Badge](badges/statements.svg)](https://shadownetdev1.github.io/HyAPI/coverage/)
[![Function Test Coverage Badge](badges/functions.svg)](https://shadownetdev1.github.io/HyAPI/coverage/)
[![Branch Test Coverage Badge](badges/branches.svg)](https://shadownetdev1.github.io/HyAPI/coverage/)

<p align="center">
  <img width="100%" alt="Warning: This API implementation is in an alpha state and is provided as is. While I expect that all implemented and tested endpoints work as expected I cannot guarantee that that is the case. Also as of right now there are several API endpoints that are implemented that don't have tests and there are many endpoints that still need to be implemented." src="badges/warning.svg">
</p>

HyAPI is an implementation of the [Hydrus client](https://github.com/hydrusnetwork/hydrus/) [API](https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md) in JavaScript. The goal is to fully support the most recent version of the [Hydrus client](https://github.com/hydrusnetwork/hydrus/) [API](https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md) in a fully typed and documented implementation. It was original based off of [hydrus.js](https://www.npmjs.com/package/hydrus.js), but it has drastically deviated from that project and should not be used as a drop in replacement.

As of currently all endpoints from [hydrus.js](https://www.npmjs.com/package/hydrus.js) and a few more are implemented. There is still a lot to do to fully implement Hydrus API Version 80.

## Installation

HyAPI currently doesn't have an npm package or release. The best way to us it at this point in time would be to git clone the repo or to download [api.js](api.js) and use it directly.

## Documentation and Usage

HyAPI currently doesn't have any documentation or usage instructions. Your best bet is to look at how the [unit tests](src/tests/api.test.mjs) are implemented.

## Contributing

Contributions are greatly appreciated. These can come in the form of reporting issues and creating pull requests. If you have working knowledge of JavaScript, want to contribute, but don't know where to get started then looking at our currently open issues would be suggested

## Versioning

HyAPI is versioned using \[Hydrus API version\].\[Hydrus version\].\[Minor version\]. This works well since all our endpoints should match a given Hydrus API/Client version pair

## Thanks

<!-- NPM badge provided by [NodeICO](https://nodei.co/npm/hyapi/). -->

Hydrus version badges provided by [Shields.io](https://shields.io/).

Code coverage badges provided by [Warren Jervis](https://github.com/wjervis7)'s [Vitest Badge Action](https://github.com/marketplace/actions/vitest-badge-action).

[Hummingbird at feeder image](/tests/files/hummingbird-at-feeder-1754669486LJt.jpg) provided by [Paul Brennan](https://www.zazzle.com/store/paul68) on [PublicDomainPictures.net](https://www.publicdomainpictures.net/en/view-image.php?image=711307&picture=hummingbird-at-feeder)

[Tree image](/tests/files/tree-1332664495LMO.jpg) provided by [George Hodan](https://www.facebook.com/hodanpictures) on [PublicDomainPictures.net](https://www.publicdomainpictures.net/en/view-image.php?image=20740&picture=tree)

[Tokyo travel image (used to test url imports)](/tests/files/japan-travel-poster-vintage-1590660773y1R.jpg) provided by Karen Arnold on [PublicDomainPictures.net](https://www.publicdomainpictures.net/en/view-image.php?image=339146&picture=japan-travel-poster-vintage)

## License

HyAPI is licensed under the same [DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE](license.txt) as Hydrus is [as of August 23rd 2025](https://github.com/hydrusnetwork/hydrus/blob/3dfc84dec9166ecec0dcf874e5ad0cb2b64d0bc4/license.txt).
