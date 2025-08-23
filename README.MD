
# HyAPI

![Test Coverage badge](badges/coverage.svg) ![Hydrus API Version: 80 (Partial)](https://img.shields.io/badge/Hydrus%20API%20Version-80%20(Partial)-blue) ![Hydrus version](https://img.shields.io/badge/Tested%20With%20Hydrus%20Version-629%20-blue)

<p align="center">
  <img width="100%" alt="Warning: This API implementation is in an alpha state and is provided as is. While I expect that all implemented and tested endpoints work as expected I cannot guarantee that that is the case. Also as of right now there are several API endpoints that are implemented that don't have tests and there are many endpoints that still need to be implemented." src="badges/warning.svg">
</p>

HyAPI is an implementation of the [Hydrus client](https://github.com/hydrusnetwork/hydrus/) [API](https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md) in JavaScript. The goal is to fully support the most recent version of the [Hydrus client](https://github.com/hydrusnetwork/hydrus/) [API](https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md) in a fully typed and documented implementation. It was original based off of [hydrus.js](https://www.npmjs.com/package/hydrus.js), but it has drastically deviated from that project and should not be used as a drop in replacement.

As of currently all endpoints from [hydrus.js](https://www.npmjs.com/package/hydrus.js) and a few more are implemented. There is still a lot to do to fully implement Hydrus API Version 80.

## Installation

HyAPI currently doesn't have an npm package or release. The best way to us it at this point in time would be to git clone the repo or to download [src/api.js](src/api.js) and use it directly.

## Documentation and Usage

HyAPI currently doesn't have any documentation or usage instructions. Your best bet is to look at how the [unit tests](src/tests/api.test.mjs) are implemented.

## Contributing

Contributions are greatly appreciated. These can come in the form of reporting issues and creating pull requests. If you have working knowledge of JavaScript, want to contribute, but don't know where to get started then looking at our currently open issues would be suggested

## License

HyAPI is licensed under the same [DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE](license.txt) as [Hydrus is as of August 23rd 2025](https://github.com/hydrusnetwork/hydrus/blob/3dfc84dec9166ecec0dcf874e5ad0cb2b64d0bc4/license.txt).
