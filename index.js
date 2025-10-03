
/**
 * @import HydrusAPI from './types/types.d.ts'
 */

/**
 * Takes an options object and convert it to
 * an URLSearchParams instance
 * making sure that all lists and objects are
 * encoded as JSON strings first
 * @param {{[key: string]: any}} options
 * @returns {URLSearchParams}
 */
const optionsToURLSearchParams = (options) => {
    for (const [key, value] of Object.entries(options)) {
        if (Array.isArray(value) || (typeof value === "object" && value !== null)) {
            options[key] = JSON.stringify(value)
        }
    }
    return new URLSearchParams(options)
}

module.exports = class API{
    // region: API

    /** @type {boolean} */
    debug
    /** @type {string} */
    access_key
    /** @type {string} */
    address

    /** What API version do we support */
    VERSION = 81
    /** What version of Hydrus are we testing against */
    HYDRUS_TARGET_VERSION = 641

    /**
     * These are the permissions that the client can have
     * @type {HydrusAPI.BASIC_PERMS}
     */
    BASIC_PERM = Object.freeze({
        MODIFY_URLS: 0,
        MODIFY_FILES: 1,
        MODIFY_TAGS: 2,
        SEARCH_AND_FETCH_FILES: 3,
        MANAGE_PAGES: 4,
        MANAGE_COOKIES_AND_HEADERS: 5,
        MANAGE_DATABASE: 6,
        EDIT_NOTES: 7,
        EDIT_FILE_RELATIONSHIPS: 8,
        EDIT_FILE_RATINGS: 9,
        MANAGE_POPUPS: 10,
        EDIT_FILE_TIMES: 11,
        COMMIT_PENDING: 12,
        SEE_LOCAL_PATHS: 13,
    })

    /** @type {HydrusAPI.CANVAS_TYPE} */
    CANVAS_TYPE = Object.freeze({
        /** The normal viewer in hydrus that is its own window */
        MEDIA_VIEWER: 0,
        /** The box in the bottom-left corner of the Main GUI window */
        PREVIEW_VIEWER: 1,
        /** Something to represent your own access, if you wish */
        API_VIEWER: 4,
    })

    /** @type {HydrusAPI.TIMESTAMP_TYPE} */
    TIMESTAMP_TYPE = Object.freeze({
        /** File modified time (web domain) */
        MODIFIED_TIME_WEB_DOMAIN: 0,
        /** File modified time (on the hard drive) */
        MODIFIED_TIME_DISK: 1,
        /** File import time */
        IMPORTED_TIME: 3,
        /** File delete time */
        DELETED_TIME: 4,
        /** Archived time */
        ARCHIVED_TIME: 5,
        /** Last viewed */
        LAST_VIEWED: 6,
        /** File originally imported time */
        ORIGINAL_IMPORT_TIME: 7,
    })

    /** @type {HydrusAPI.SERVICE_TYPE} */
    SERVICE_TYPE = Object.freeze({
        /** 0 - tag repository */
        TAG_REPO: 0,
        /** 1 - file repository */
        FILE_REPO: 1,
        /** 2 - a local file domain like 'my files' */
        LOCAL_FILE_DOMAIN: 2,
        /** 5 - a local tag domain like 'my tags' */
        LOCAL_TAG_DOMAIN: 5,
        /** 6 - a 'numerical' rating service with several stars */
        RATING_SERVICE_NUMERICAL: 6,
        /** 7 - a 'like/dislike' rating service with on/off status */
        RATING_SERVICE_BOOLEAN: 7,
        /** 10 - all known tags -- a union of all the tag services */
        ALL_KNOWN_TAGS: 10,
        /** 11 - all known files -- a union of all the file services and files that appear in tag services */
        ALL_KNOWN_FILES: 11,
        /** 12 - the local booru -- you can ignore this */
        LOCAL_BOORU: 12,
        /** 13 - IPFS */
        IPFS: 13,
        /** 14 - trash */
        TRASH: 14,
        /** 15 - all local files -- all files on hard disk ('all my files' + updates + trash) */
        ALL_LOCAL_FILES: 15,
        /** 17 - file notes */
        FILE_NOTES: 17,
        /** 18 - Client API */
        CLIENT_API: 18,
        /** 19 - deleted from anywhere -- you can ignore this */
        DELETED_FROM_ANYWHERE: 19,
        /** 20 - local updates -- a file domain to store repository update files in */
        LOCAL_UPDATES: 20,
        /** 21 - all my files -- union of all local file domains */
        ALL_MY_FILES: 21,
        /** 22 - a 'inc/dec' rating service with positive integer rating */
        RATING_SERVICE_INC_DEC: 22,
        /** 99 - server administration */
        SERVER_ADMIN: 99,
    })

    /** @type {HydrusAPI.POTENTIALS_SEARCH_TYPE} */
    POTENTIALS_SEARCH_TYPE = Object.freeze({
        /** 0 - one file matches search 1 */
        A_FILE_MATCHES_SEARCH_ONE: 0,
        /** 1 - both files match search 1 */
        BOTH_FILES_MATCH_SEARCH_ONE: 1,
        /** 2 - one file matches search 1, the other 2 */
        EACH_FILE_MATCHES_A_SEPARATE_SEARCH: 2,
    })

    /** @type {HydrusAPI.PIXEL_DUPLICATES} */
    PIXEL_DUPLICATES = Object.freeze({
        /** 0 - must be pixel duplicates */
        MUST_BE_DUPLICATES: 0,
        /** 1 - can be pixel duplicates */
        CAN_BE_DUPLICATES: 1,
        /** 2 - must not be pixel duplicates */
        MUST_NOT_BE_DUPLICATES: 2,
    })

    /**
     * @type {number|undefined}
     * Setting this to a HydrusAPI version will allow usage
     * when the HydrusAPI API version and Hydrus API version
     * mismatches.
     * 
     * !!! This use case will not be supported
     */
    api_version_override

    /**
     * We highly suggest wrapping this class' methods
     * in functions over using them directly.
     * @param {HydrusAPI.APIOptions} [options={}] Extra options
     */
    constructor(options={}) {
        this.access_key = options?.access_key ?? ''
        this.address = options?.address ?? 'http://127.0.0.1:45869'
        this.debug = options?.debug ?? false
        this.api_version_override = options?.api_version_override
        this._first_successful_versioning = false
    }

    /**
     * Constructs an API call and then calls it,
     * returning the result
     * @param {HydrusAPI.CallOptions} o
     * @returns {Promise<Object|boolean|number|ReadableStream>}
     * Object if `o.return_as` is `raw` or `json`;
     * boolean if `o.return_as` is `success`;
     * number if `o.return_as` is `status`;
     * ReadableStream if `o.return_as` is `readable_stream`;
     */
    async call(o) {
        // region: call
        if (this.debug) {
            console.log(`ENDPOINT: ${o.endpoint}`)
        }
        
        if (o.endpoint !== '/api_version' && !this._first_successful_versioning) {
            await this.api_version()
        }

        o.headers = o.headers ?? new Headers()
        o.method = o.method ?? (
            o.queries ? 'GET' : (
                o.json ? 'POST' : (o.body ? 'POST' : 'GET')
            )
        )
        o.return_as = o.return_as ?? 'json'

        if (o.json && !o.headers.has('content-type')) {
            o.headers.set('content-type', 'application/json')
        }

        if (o.queries) {
            o.endpoint = o.endpoint + '?' + o.queries.toString()
        }

        if (this?.access_key !== '') {
            if (!o.headers.has('hydrus-client-api-access-key')) {
                o.headers.set(
                    'hydrus-client-api-access-key',
                    this.access_key
                )
            }
        }

        /** @type {{[key: string]: any}} */
        const fetch_options = {}

        for (const key of Object.keys(o)) {
            if (!['endpoint', 'return_as', 'json'].includes(key)) {
                fetch_options[key] = o[key]
            }
        }

        fetch_options.body = fetch_options.body ?? (
            o.json ? JSON.stringify(o.json) : undefined
        )
        if (this.debug) {
            console.log(fetch_options)
        }
        return await fetch(
            this.address + o.endpoint,
            fetch_options
        )
        .then(async(response) => {
            if (this.debug) {
                console.log(response)
            }
            const throw_not_okay = async() => {
                if (!response.ok) {
                    const message = `endpoint '${o.endpoint}' responded with status code '${response.status}' and text '${response.statusText}'. Previous messages may review more details.`
                    if (!this.debug) {
                        console.error(response)
                    }
                    try {
                        console.error(await response.json())
                    } catch {
                        // do nothing
                    }
                    throw new Error(message)
                }
            }
            
            switch (o.return_as) {
                case 'raw':
                    return response
                case 'json':
                    await throw_not_okay()
                    try {
                        return await response.json()
                    } catch (e) {
                        if (e instanceof SyntaxError) {
                            throw new Error(`Invalid json returned from Hydrus! Does this endpoint return json?`)
                        }
                    }
                    break;
                case 'status':
                    return response.status
                case 'success':
                    return response.ok
                case 'readable_stream':
                    await throw_not_okay()
                    if (!(response?.body instanceof ReadableStream)) {
                        throw new Error(`response.body doesn't exist or isn't a readable stream`)
                    }
                    return response.body
                default:
                    throw new Error(`unhandled return_as value of '${o.return_as}'`)
            }
        })
    }

    /**
     * Gets the current API version.
     * 
     * GET Endpoint: /api_version
     *
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-api_version--idapi_version-
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<HydrusAPI.api_version_response>}
     */
    async api_version(return_as) {
        // region: api_version
        if (
            this._first_successful_versioning ||
            (return_as && return_as !== 'json')
        ) {
            return /** @type {Promise<HydrusAPI.api_version_response>} */ (await this.call({
                endpoint: '/api_version',
                return_as: return_as
            }))
        } else {
            const json = /** @type {HydrusAPI.api_version_response} */ (await this.call({
                endpoint: '/api_version',
                return_as: return_as
            }))
            if (json.hydrus_version !== this.HYDRUS_TARGET_VERSION) {
                console.warn(`This version of HydrusAPI is targetting Hydrus version '${this.HYDRUS_TARGET_VERSION}', but you are currently connected to version '${json.hydrus_version}'.`)
            }
            if (json.version !== this.VERSION) {
                if (!this.api_version_override || this.api_version_override !== json.version) {
                    throw new Error(
                        `This version of HydrusAPI is made for Hydrus API version '${this.VERSION}', but you attempted to connect to version '${json.version}'. This is not officially supported. We suggest finding a version of HydrusAPI that matches your Hydrus API version. If you still want to continue then pass 'api_version_override: ${json.version}' in the api options when initializing. NO support will be provided for this use case.`
                    )
                } else {
                    console.warn(`'api_version_override' is set to '${this.api_version_override}'. No support will be provided for this use case.`)
                }
            }
            this._first_successful_versioning = true
            return json
        }
        
    }

    /**
     * Register a new external program with Hydrus.
     * This requires the 'add from api request' mini-dialog
     * under services->review services to be open,
     * otherwise it will 403.
     * 
     * GET Endpoint: /request_new_permissions
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-request_new_permissions--idrequest_new_permissions-
     * @param {HydrusAPI.request_new_permissions_options} options
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<HydrusAPI.request_new_permissions_response>}
     */
    async request_new_permissions(options, return_as) {
        // region: request_new_permissions
        if (options?.permissions === 'all') {
            options.permissions = Object.values(this.BASIC_PERM)
        }
        return /** @type {Promise<HydrusAPI.request_new_permissions_response>} */ (await this.call({
            endpoint: '/request_new_permissions',
            queries: optionsToURLSearchParams(options),
            return_as: return_as
        }))
    }

    /**
     * Gets a session key for the client.
     * 
     * A session key expires after 24 hours of inactivity,
     * whenever Hydrus restarts,
     * or if the underlying access key is deleted.
     * A request on an expired session key returns 419.
     * 
     * GET Endpoint: /session_key
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-session_key--idsession_key-
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<HydrusAPI.session_key_response>}
     */
    async session_key(return_as) {
        // region: session_key
        return /** @type {Promise<HydrusAPI.session_key_response>} */ (await this.call({
            endpoint: '/session_key',
            return_as: return_as
        }))
    }

    /**
     * Returns the permissions that the client has
     * with its current access key.
     * 
     * GET Endpoint: /verify_access_key
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-verify_access_key--idverify_access_key-
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<HydrusAPI.verify_access_key_response>}
     */
    async verify_access_key(return_as) {
        // region: verify_access_key
        return /** @type {Promise<HydrusAPI.verify_access_key_response>} */ (await this.call({
            endpoint: '/verify_access_key',
            return_as: return_as
        }))
    }

    /**
     * Returns info for a given service.
     * If the service does not exist, this gives 404.
     * It is very unlikely but edge-case possible that
     * two services will have the same name,
     * in this case you'll get the pseudorandom first.
     * 
     * GET Endpoint: /get_service
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-get_service--idget_service-
     * @param {{service_name?: string, service_key?: string}} service either service_name or service_key must be provided
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<HydrusAPI.get_service_response>}
     */
    async get_service(service, return_as) {
        // region: get_service
        return /** @type {Promise<HydrusAPI.get_service_response>} */ (await this.call({
            endpoint: '/get_service',
            queries: optionsToURLSearchParams(service),
            return_as: return_as
        }))
    }

    /**
     * Returns info for all services
     * 
     * GET Endpoint: /get_services
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-get_services--idget_services-
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<HydrusAPI.get_services_response>}
     */
    async get_services(return_as) {
        // region: get_services
        return /** @type {Promise<HydrusAPI.get_services_response>} */ (await this.call({
            endpoint: '/get_services',
            return_as: return_as
        }))
    }

    /**
     * Features:
     * * Import files
     * * Delete files
     * * Undelete files
     * * Clear deletion records for deleted files
     * * Copy files between file domains
     * * Archive files
     * * Unarchive files
     * * Generate hashes for a file
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#importing-and-deleting-files
     */
    get add_files() {
        return {
    /**
     * Tell Hydrus to import a file.
     * supply a json with either bytes : *file bytes* 
     * or path: *file path*
     * 
     * POST Endpoint: /add_files/add_file
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-add_filesadd_file--idadd_files_add_file-
     * @param {{bytes: *}|{path: string, delete_after_successful_import?: boolean}} options path to the file or the file data
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<HydrusAPI.add_file_response>}
     */
    add_file: async(options, return_as) => {
        // region: add_files/add_file
        /** @type {HydrusAPI.CallOptions} */
        const o = {
            endpoint: '/add_files/add_file',
            return_as: return_as
        }
        if ('path' in options) {
            o.json = options
        } else if ('bytes' in options) {
            o.headers = new Headers({'content-type': 'application/octet-stream'})
            o.body = options.bytes
        } else {
            throw new Error('path or bytes must be defined in options')
        }
        return /** @type {Promise<HydrusAPI.add_file_response>} */ (await this.call(o))
    },

    /**
     * Tell Hydrus to delete one or more files
     * 
     * POST Endpoint: /add_files/delete_files
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-add_filesdelete_files--idadd_files_delete_files-
     * @param {HydrusAPI.delete_files_options} options
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<boolean>} true if successful
     */
    delete_files: async(options, return_as) => {
        // region: add_files/delete_files
        return /** @type {Promise<boolean>} */ (await this.call({
            endpoint: '/add_files/delete_files',
            json: options,
            return_as: return_as ?? 'success'
        }))
    },

    /**
     * Tell Hydrus to undelete one or more files
     * 
     * POST Endpoint: /add_files/undelete_files
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-add_filesundelete_files--idadd_files_undelete_files-
     * @param {HydrusAPI.undelete_files_options} options
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<boolean>} successful if true
     */
    undelete_files: async (options, return_as) => {
        // region: add_files/undelete_files
        return /** @type {Promise<boolean>} */ (await this.call({
            endpoint: '/add_files/undelete_files',
            json: options,
            return_as: return_as ?? 'success'
        }))
    },

    /**
     * Tell Hydrus to clear any deletion records it has for a file
     * 
     * POST Endpoint: /add_files/clear_file_deletion_record
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-add_filesclear_file_deletion_record--idadd_files_clear_file_deletion_record-
     * @param {HydrusAPI.FilesObject} options
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<boolean>} successful if true
     */
    clear_file_deletion_record: async(options, return_as) => {
        // region: add_files/clear_file_deletion_record
        return /** @type {Promise<boolean>} */ (await this.call({
            endpoint: '/add_files/clear_file_deletion_record',
            json: options,
            return_as: return_as ?? 'success'
        }))
    },

    /**
     * Add a file to one or more local file services
     * 
     * POST Endpoint: /add_files/migrate_files
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-add_filesmigrate_files--idadd_files_migrate_files-
     * @param {HydrusAPI.migrate_files_options} options
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<boolean>} successful if true
     */
    migrate_files: async(options, return_as) => {
        // region: add_files/migrate_files
        return /** @type {Promise<boolean>} */ (await this.call({
            endpoint: '/add_files/migrate_files',
            json: options,
            return_as: return_as ?? 'success'
        }))
    },

    /**
     * Tell Hydrus to archive inboxed files
     * 
     * POST Endpoint: /add_files/archive_files
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-add_filesarchive_files--idadd_files_archive_files-
     * @param {HydrusAPI.FilesObject} options
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<boolean>} if true then the file was successfully archived, was already archived, or doesn't exist
     */
    archive_files: async(options, return_as) => {
        // region: add_files/archive_files
        return /** @type {Promise<boolean>} */ (await this.call({
            endpoint: '/add_files/archive_files',
            json: options,
            return_as: return_as ?? 'success'
        }))
    },

    /**
     * Tell Hydrus to unarchive files which moves them to the inbox
     * 
     * POST Endpoint: /add_files/unarchive_files
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-add_filesunarchive_files--idadd_files_unarchive_files-
     * @param {HydrusAPI.FilesObject} options
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<boolean>} if true then the file was successfully unarchived, was already unarchived, or doesn't exist
     */
    unarchive_files: async(options, return_as) => {
        // region: add_files/unarchive_files
        return /** @type {Promise<boolean>} */ (await this.call({
            endpoint: '/add_files/unarchive_files',
            json: options,
            return_as: return_as ?? 'success'
        }))
    },

    /**
     * Asks Hydrus to attempt to generate hashes for the given file.
     * supply a json with either bytes : *file bytes* 
     * or path: *file path*
     * 
     * POST Endpoint: /add_files/generate_hashes
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-add_filesgenerate_hashes--idadd_files_generate_hashes-
     * @param {HydrusAPI.generate_hashes_options} options path to the file or the file data
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<HydrusAPI.generate_hashes_response>}
     */
    generate_hashes: async(options, return_as) => {
        // region: add_files/generate_hashes
        /** @type {HydrusAPI.CallOptions} */
        const o = {
            endpoint: '/add_files/generate_hashes',
            return_as: return_as
        }
        if ('path' in options) {
            o.json = options
        } else if ('bytes' in options) {
            o.headers = new Headers({'content-type': 'application/octet-stream'})
            o.body = options.bytes
        } else {
            throw new Error('path or bytes must be defined in options')
        }
        return /** @type {Promise<HydrusAPI.generate_hashes_response>} */ (await this.call(o))
    },

        }
    }

    /**
     * Features:
     * * Get files associated with a url
     * * Associate and dissociate files with a url
     * * Get info about a url
     * * Import a url
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#importing-and-editing-urls
     */
    get add_urls() {
        return {
    /**
     * Ask Hydrus about a URL's files.
     * 
     * GET Endpoint: /add_urls/get_url_files
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-add_urlsget_url_files--idadd_urls_get_url_files-
     * @param {HydrusAPI.get_url_files_options} options
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<HydrusAPI.get_url_files_response>}
     */
    get_url_files: async(options, return_as) => {
        // region: add_urls/get_url_files
        const q = new URLSearchParams()
        if (options.doublecheck_file_system) {
            q.append('doublecheck_file_system', `${options.doublecheck_file_system}`)
        }
        q.append('url', options.url)
        return /** @type {Promise<HydrusAPI.get_url_files_response>} */ (await this.call({
            endpoint: '/add_urls/get_url_files',
            queries: q,
            return_as: return_as
        }))
    },

    /**
     * Ask Hydrus for information about a URL.
     * 
     * GET Endpoint: /add_urls/get_url_info
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-add_urlsget_url_info--idadd_urls_get_url_info-
     * @param {string} url url you want to check
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<HydrusAPI.get_url_info_response>}
     */
    get_url_info: async(url, return_as) => {
        // region: add_urls/get_url_info
        return /** @type {Promise<HydrusAPI.get_url_info_response>} */ (await this.call({
            endpoint: '/add_urls/get_url_info',
            queries: optionsToURLSearchParams({url: url}),
            return_as: return_as
        }))
    },

    /**
     * Tell Hydrus to 'import' a URL.
     * This triggers the exact same routine as drag-and-dropping
     * a text URL onto the main Hydrus window.
     * 
     * POST Endpoint: /add_urls/add_url
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-add_urlsadd_url--idadd_urls_add_url-
     * @param {HydrusAPI.add_url_options} options
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<HydrusAPI.add_url_response>}
     */
    add_url: async(options, return_as) => {
        // region: add_urls/add_url
        return /** @type {Promise<HydrusAPI.add_url_response>} */ (await this.call({
            endpoint: '/add_urls/add_url',
            json: options,
            return_as: return_as,
        }))
    },

    /**
     * Manage which URLs Hydrus considers to be
     * associated with which files.
     * 
     * POST Endpoint: /add_urls/associate_url
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-add_urlsassociate_url--idadd_urls_associate_url-
     * @param {HydrusAPI.associate_url_options} options
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<boolean>} successful if true
     */
    associate_url: async(options, return_as) => {
        // region: add_urls/associate_url
        return /** @type {Promise<boolean>} */ (await this.call({
            endpoint: '/add_urls/associate_url',
            json: options,
            return_as: return_as ?? 'success'
        }))
    }

        }
    }

    /**
     * Features:
     * * Get clean version of a list of tags
     * * Get, set, or modify favourite tags
     * * Get a tags sibling and parent relationships
     * * Search Hydrus for a tag
     * * Add or remove tags from files
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#editing-file-tags
     */
    get add_tags() {
        return {
    /**
     * Ask Hydrus about how it will see certain tags.
     * 
     * GET Endpoint: /add_tags/clean_tags
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-add_tagsclean_tags--idadd_tags_clean_tags-
     * @param {string[]} tags
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<HydrusAPI.clean_tags_response>}
     */
    clean_tags: async(tags, return_as) => {
        // region: add_tags/clean_tags
        return /** @type {Promise<HydrusAPI.clean_tags_response>} */ (await this.call({
            endpoint: '/add_tags/clean_tags',
            queries: optionsToURLSearchParams({tags: tags}),
            return_as: return_as
        }))
    },

    /**
     * Fetch Hydrus' favourite tags.
     * This is the list of tags you see beneath an
     * autocomplete input, under the 'favourites' tab.
     * This is not the per-service 'most used' tab you see
     * in manage tags.
     * 
     * GET Endpoint: /add_tags/get_favourite_tags
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-add_tagsget_favourite_tags--idadd_tags_get_favourite_tags-
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<HydrusAPI.get_favourite_tags_response>}
     */
    get_favourite_tags: async(return_as) => {
        // region add_tags/get_favourite_tags
        return /** @type {Promise<HydrusAPI.get_favourite_tags_response>} */ (await this.call({
            endpoint: '/add_tags/get_favourite_tags',
            return_as: return_as
        }))
    },

    /**
     * Ask Hydrus about a tags' sibling and parent relationships.
     * 
     * GET Endpoint: /add_tags/get_siblings_and_parents
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-add_tagsget_siblings_and_parents--idadd_tags_get_siblings_and_parents-
     * @param {string[]} tags
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<HydrusAPI.get_siblings_and_parents_response>}
     */
    get_siblings_and_parents: async(tags, return_as) => {
        // region add_tags/get_siblings_and_parents
        return /** @type {Promise<HydrusAPI.get_siblings_and_parents_response>} */ (await this.call({
            endpoint: '/add_tags/get_siblings_and_parents',
            queries: optionsToURLSearchParams({tags: tags}),
            return_as: return_as
        }))
    },

    /**
     * Search Hydrus for tags.
     * 
     * GET Endpoint: /add_tags/search_tags
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-add_tagssearch_tags--idadd_tags_search_tags-
     * @param {HydrusAPI.search_tags_options} options
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<HydrusAPI.search_tags_response>}
     */
    search_tags: async(options, return_as) => {
        // region add_tags/search_tags
        return /** @type {Promise<HydrusAPI.search_tags_response>} */ (await this.call({
            endpoint: '/add_tags/search_tags',
            queries: optionsToURLSearchParams(options),
            return_as: return_as
        }))
    },

    /**
     * Make changes to the tags that files have.
     * 
     * POST Endpoint: /add_tags/add_tags
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-add_tagsadd_tags--idadd_tags_add_tags-
     * @param {HydrusAPI.add_tags_options} options
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<boolean>} successful if true
     */
    add_tags: async(options, return_as) => {
        // region: add_tags/add_tags
        return /** @type {Promise<boolean>} */ (await this.call({
            endpoint: '/add_tags/add_tags',
            json: options,
            return_as: return_as ?? 'success'
        }))
    },

    /**
     * Edit Hydrus' favourite tags.
     * This is the complement to /add_tags/get_favourite_tags.
     * 
     * POST Endpoint: set_favourite_tags
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-add_tagsset_favourite_tags--idadd_tags_set_favourite_tags-
     * @param {HydrusAPI.set_favourite_tags_options} options
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<HydrusAPI.get_favourite_tags_response>}
     */
    set_favourite_tags: async(options, return_as) => {
        // region: add_tags/set_favourite_tags
        return /** @type {Promise<HydrusAPI.get_favourite_tags_response>} */ (await this.call({
            endpoint: '/add_tags/set_favourite_tags',
            json: options,
            return_as: return_as
        }))
    },
    
        }
    }

    /**
     * Add or remove ratings associated with a file.
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#editing-file-ratings
     */
    get edit_ratings() {
        return {
    /**
     * Add or remove ratings associated with a file.
     * 
     * POST Endpoint: /edit_ratings/set_rating
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-edit_ratingsset_rating--idedit_ratings_set_rating-
     * @param {HydrusAPI.set_rating_options} options
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<boolean>} successful if true
     */
    set_rating: async(options, return_as) => {
        // region: edit_ratings/set_rating
        return /** @type {Promise<boolean>} */ (await this.call({
            endpoint: '/edit_ratings/set_rating',
            json: options,
            return_as: return_as ?? 'success'
        }))
    },
    
        }
    }

    /**
     * Set or modify viewtime
     * 
     * Set modified at, imported at,
     * deleted at, archived at, last viewed,
     * and original import times
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#editing-file-times
     */
    get edit_times() {
        return {
    /**
     * Add a file view to the file viewing statistics system.
     * 
     * This increments the number of views stored for
     * the file in the file viewing statistics system.
     * This system records "last time the file was viewed",
     * "total number of views", and "total viewtime"
     * for three different `canvas_types`
     * 
     * It doesn't matter much, but in hydrus
     * the "last time the file was viewed" is considered
     * to be when the user started viewing the file, not ended,
     * so if you wish to track that too, you can send it along.
     * If you do not include a timestamp, the system will use now,
     * which is close enough, assuming you are sending recent
     * rather than deferred data.
     * 
     * You can send multiple file identifiers,
     * but I imagine you will just be sending one most of the time.
     * 
     * If the user has disabled file viewing statistics tracking
     * on their client (under the options), this will 403.
     * 
     * POST Endpoint: /edit_times/increment_file_viewtime
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-edit_timesincrement_file_viewtime--idedit_times_increment_file_viewtime-
     * @param {HydrusAPI.increment_and_set_file_viewtime_options} options
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<boolean>} Successful if true
     */
    increment_file_viewtime: async(options, return_as) => {
        // region: edit_times/increment_file_viewtime
        return /** @type {Promise<boolean>} */ (await this.call({
            endpoint: '/edit_times/increment_file_viewtime',
            json: options,
            return_as: return_as ?? 'success'
        }))
    },

    /**
     * Set fixed values in the file viewing statistics system.
     * 
     * This is an override to set the number of views stored
     * for the file in the file viewing statistics system
     * to fixed values you specify.
     * 
     * I recommend you only use this call for unusual maintenance,
     * migration, or reset situations--stick to the
     * `edit_times.increment_file_viewtime()` call for normal use.
     * 
     * The system records "last time the file was viewed",
     * "total number of views",
     * and "total viewtime" for three different `canvas_types`
     * 
     * The "Client API" viewer was added so you may record
     * your views separately if you wish.
     * Otherwise you might like to fold them into the normal
     * Media viewer count.
     * 
     * If you do not include a timestamp,
     * the system will either leave what is currently recorded,
     * or, if the file has no viewing data yet, fill in with now.
     * 
     * You can send multiple file identifiers,
     * but I imagine you will just be sending one.
     * 
     * If the user has disabled file viewing statistics tracking
     * on their client (under the options), this will 403.
     * 
     * POST Endpoint: /edit_times/set_file_viewtime
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-edit_timesset_file_viewtime--idedit_times_set_file_viewtime-
     * @param {HydrusAPI.increment_and_set_file_viewtime_options} options
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<boolean>} Successful if true
     */
    set_file_viewtime: async(options, return_as) => {
        // region: edit_times/set_file_viewtime
        return /** @type {Promise<boolean>} */ (await this.call({
            endpoint: '/edit_times/set_file_viewtime',
            json: options,
            return_as: return_as ?? 'success'
        }))
    },

    /**
     * Add or remove timestamps associated with a file.
     *
     * This is a copy of the manage times dialog in the program,
     * so if you are uncertain about something, check that out.
     * The client records timestamps up to millisecond accuracy.
     * 
     * You have to select some files, obviously.
     * I'd imagine most uses will be over one file at a time,
     * but you can spam 100 or 10,000 if you need to.
     * 
     * Then choose whether you want to work with
     * timestamp or timestamp_ms.
     * timestamp can be an integer or a float,
     * and in the latter case, the API will suck up the three
     * most significant digits to be the millisecond data.
     * timestamp_ms is an integer of milliseconds,
     * simply the timestamp value multiplied by 1,000.
     * It doesn't matter which you use--whichever is easiest for you.
     * 
     * If you send null timestamp time,
     * then this will instruct to delete the existing value,
     * if possible and reasonable.
     * 
     * !!! warning "Adding or Deleting"
     * You can add or delete
     * `TIMESTAMP_TYPE.MODIFIED_TIME_WEB_DOMAIN` (0) timestamps,
     * but you can only edit existing instances of all the others.
     * This is broadly how the manage times dialog works, also.
     * Stuff like `TIMESTAMP_TYPE.LAST_VIEWED` (6)
     * is tied up with other numbers
     * like `viewtime` and `num_views`,
     * so if that isn't already in the database,
     * then we can't just add the timestamp on its own.
     * Same with `TIMESTAMP_TYPE.DELETED_TIME` (4)
     * for a file that isn't deleted!
     * So, in general, other than web domain stuff,
     * you can only edit times you already
     * see in `get_files.file_metadata()`.
     * 
     * If you select `TIMESTAMP_TYPE.MODIFIED_TIME_WEB_DOMAIN` (0),
     * you have to include a domain,
     * which will usually be a web domain,
     * but you can put anything in there.
     * 
     * If you select `TIMESTAMP_TYPE.MODIFIED_TIME_DISK` (1),
     * the client will not alter the modified time on your hard disk,
     * only the database record. This is unlike the dialog.
     * Let's let this system breathe a bit before we try
     * to get too clever.
     * 
     * If you select `TIMESTAMP_TYPE.IMPORTED_TIME` (3),
     * `TIMESTAMP_TYPE.DELETED_TIME` (4),
     * or `TIMESTAMP_TYPE.ORIGINAL_IMPORT_TIME` (7),
     * you have to include a file_service_key.
     * The `TIMESTAMP_TYPE.ORIGINAL_IMPORT_TIME` (7) time
     * is for deleted files only;
     * it records when the file was originally imported
     * so if the user hits 'undo',
     * the database knows what import time to give back to it.
     * 
     * If you select `TIMESTAMP_TYPE.LAST_VIEWED` (6),
     * you have to include a `CANVAS_TYPE`
     * 
     * POST Endpoint: /edit_times/set_time
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-edit_timesset_time--idedit_times_set_time-
     * @param {HydrusAPI.set_time_options} options
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<boolean>} Successful if true
     */
    set_time: async(options, return_as) => {
        // region: edit_times/set_time
        return /** @type {Promise<boolean>} */ (await this.call({
            endpoint: '/edit_times/set_time',
            json: options,
            return_as: return_as ?? 'success'
        }))
    },
        }
    }

    /**
     * Add, modify, and remove notes from files
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#editing-file-notes
     */
    get add_notes() {
        return {
    /**
     * Add or update notes associated with a file.
     * 
     * POST Endpoint: /add_notes/set_notes
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-add_notesset_notes--idadd_notes_set_notes-
     * @param {HydrusAPI.set_notes_options} options
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<HydrusAPI.set_notes_response>}
     */
    set_notes: async(options, return_as) => {
        // region: add_notes/set_notes
        return /** @type {Promise<HydrusAPI.set_notes_response>} */ (await this.call({
            endpoint: '/add_notes/set_notes',
            json: options,
            return_as: return_as
        }))
    },

    /**
     * Remove notes associated with a file.
     * 
     * This operation is idempotent.
     * 
     * POST Endpoint: /add_notes/delete_notes
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-add_notesdelete_notes--idadd_notes_delete_notes-
     * @param {HydrusAPI.delete_notes_options} options
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<boolean>} Successful if true
     */
    delete_notes: async(options, return_as) => {
        // region: add_notes/delete_notes
        return /** @type {Promise<boolean>} */ (await this.call({
            endpoint: '/add_notes/delete_notes',
            json: options,
            return_as: return_as ?? 'success'
        }))
    },
        }
    }

    /**
     * Features:
     * * Search for files
     * * Get alternative hashes for a given hash
     * * Get metadata about a file
     * * Get a file or its thumbnail
     * * Get the path (from Hydrus's viewpoint)
     * of a file or its thumbnail
     * * Get the local file storage locations
     * * Get a file as rendered by Hydrus
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#searching-and-fetching-files
     */
    get get_files() {
        return {
    /**
     * Search Hydrus for files.
     * 
     * GET Endpoint: /get_files/search_files
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-get_filessearch_files--idget_files_search_files-
     * @param {HydrusAPI.search_files_options} options
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<HydrusAPI.search_files_response>}
     */
    search_files: async(options, return_as) => {
        // region: get_files/search_files
        return /** @type {Promise<HydrusAPI.search_files_response>} */ (await this.call({
            endpoint: '/get_files/search_files',
            queries: optionsToURLSearchParams(options),
            return_as: return_as,
        }))
    },

    /**
     * Takes one or more hashes and asks Hydrus for
     * alternative hash types that match.
     * 
     * Example use case: You have a MD5 hash
     * andwant to finda SHA256 hash.
     * Hydrus will return results for
     * any files it has ever had imported.
     * 
     * GET Endpoint: /get_files/file_hashes
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-get_filesfile_hashes--idget_files_file_hashes-
     * @param {HydrusAPI.file_hashes_options} options
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<HydrusAPI.file_hashes_response>}
     */
    file_hashes: async(options, return_as) => {
        // region: get_files/file_hashes
        return /** @type {Promise<HydrusAPI.file_hashes_response>} */ (await this.call({
            endpoint: '/get_files/file_hashes',
            queries: optionsToURLSearchParams(options),
            return_as: return_as,
        }))
    },

    /**
     * Get a file's metadata
     * 
     * GET Endpoint: get_files/file_metadata
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-get_filesfile_metadata--idget_files_file_metadata-
     * @param {HydrusAPI.get_file_metadata_options} options
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<HydrusAPI.get_file_metadata_response>}
     */
    file_metadata: async(options, return_as) => {
        // region: get_files/file_metadata
        return /** @type {Promise<HydrusAPI.get_file_metadata_response>} */ (await this.call({
            endpoint: '/get_files/file_metadata',
            queries: optionsToURLSearchParams(options),
            return_as: return_as,
        }))
    },

    /**
     * Get a file
     * 
     * Either `options.file_id` or `options.hash` must be defined,
     * but not both.
     * 
     * By default, this will set the
     * Content-Disposition header to inline,
     * which causes a web browser to show the file.
     * If you set `options.download` to `true`,
     * it will set it to attachment,
     * which triggers the browser to automatically download it
     * (or open the 'save as' dialog) instead.
     * 
     * This stuff supports Range requests,
     * so if you want to build a video player, go nuts.
     * 
     * GET Endpoint: /get_files/file
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-get_filesfile--idget_files_file-
     * @param {HydrusAPI.file_options} options
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<ReadableStream<Uint8Array<ArrayBufferLike>>|Object|number>} the raw readableStream if return_as is the default
     */
    file: async(options, return_as='readable_stream') => {
        // region: get_files/file
        return (await this.call({
            endpoint: '/get_files/file',
            queries: optionsToURLSearchParams(options),
            return_as: return_as,
        }))
    },

    /**
     * Get a file's thumbnail.
     * 
     * Either `options.file_id` or `options.hash` must be defined,
     * but not both.
     * 
     * Response: The thumbnail for the file.
     * Some hydrus thumbs are jpegs, some are pngs.
     * It should give you the correct
     * `image/jpeg` or `image/png` Content-Type.
     * 
     * If hydrus keeps no thumbnail for the filetype,
     * for instance with pdfs,
     * then you will get the same
     * default 'pdf' icon you see in Hydrus.
     * If the file does not exist in Hydrus,
     * or the thumbnail was expected but is missing from storage,
     * you will get the fallback 'hydrus' icon,
     * again just as you would in Hydrus itself.
     * This request should never give a 404.
     * 
     * !!! note "Size of Normal Thumbs" Thumbnails are not guaranteed
     * to be the correct size! 
     * If a thumbnail has not been loaded in Hydrus in years,
     * it could well have been fitted for older thumbnail settings.
     * Also, even 'clean' thumbnails will
     * not always fit inside the settings' bounding box;
     * they may be boosted due to a
     * high-DPI setting or spill over due to
     * a 'fill' vs 'fit' preference.
     * You cannot easily predict what resolution
     * a thumbnail will or should have!
     * 
     * In general, thumbnails *are* the correct ratio.
     * If you are drawing thumbs,
     * you should embed them to fit or fill,
     * but don't fix them at 100% true size:
     * make sure they can scale to the size you want!
     * 
     * !!! note "Size of Defaults"
     * If you get a 'default' filetype thumbnail
     * like the pdf or hydrus one,
     * you will be pulling the pngs straight from
     * the hydrus/static folder.
     * They will most likely be 200x200 pixels.
     * 
     * GET Endpoint: /get_files/thumbnail
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-get_filesthumbnail--idget_files_thumbnail-
     * @param {HydrusAPI.thumbnail_options} options
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<ReadableStream<Uint8Array<ArrayBufferLike>>|Object|number>} the raw readableStream if return_as is the default
     */
    thumbnail: async(options, return_as='readable_stream') => {
        // region: get_files/thumbnail
        return (await this.call({
            endpoint: '/get_files/thumbnail',
            queries: optionsToURLSearchParams(options),
            return_as: return_as,
        }))
    },

    /**
     * Get a local file path.
     * 
     * Either `options.file_id` or `options.hash` must be defined,
     * but not both.
     * 
     * This will give 404 if the file is not stored locally
     * (which includes if it should exist
     * but is actually missing from the file store).
     * 
     * GET Endpoint: /get_files/file_path
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-get_filesfile_path--idget_files_file_path-
     * @param {HydrusAPI.file_path_options} options
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<HydrusAPI.file_path_response>}
     */
    file_path: async(options, return_as) => {
        // region: get_files/file_path
        return /** @type {Promise<HydrusAPI.file_path_response>} */ (await this.call({
            endpoint: '/get_files/file_path',
            queries: optionsToURLSearchParams(options),
            return_as: return_as
        }))
    },

    /**
     * Get a local file path.
     * 
     * Either `options.file_id` or `options.hash` must be defined,
     * but not both.
     * 
     * All thumbnails in hydrus have the .thumbnail file extension
     * and in content are either jpeg (almost always)
     * or png (to handle transparency).
     * 
     * This will 400 if the given file type
     * does not have a thumbnail in hydrus,
     * and it will 404 if there should be a thumbnail
     * but one does not exist and cannot
     * be generated from the source file
     * (which probably would mean that the source file
     * was itself Not Found).
     * 
     * GET Endpoint: /get_files/thumbnail_path
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-get_filesthumbnail_path--idget_files_thumbnail_path-
     * @param {HydrusAPI.thumbnail_path_options} options
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<HydrusAPI.thumbnail_path_response>}
     */
    thumbnail_path: async(options, return_as) => {
        // region: get_files/thumbnail_path
        return /** @type {Promise<HydrusAPI.thumbnail_path_response>} */ (await this.call({
            endpoint: '/get_files/thumbnail_path',
            queries: optionsToURLSearchParams(options),
            return_as: return_as
        }))
    },

    /**
     * Get the local file storage locations,
     * as you see under database->migrate files.
     * 
     * GET Endpoint: /get_files/local_file_storage_locations
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-get_fileslocal_file_storage_locations--idget_local_file_storage_locations-
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<HydrusAPI.local_file_storage_locations_response>}
     */
    local_file_storage_locations: async(return_as) => {
        // region: get_files/local_file_storage_locations
        return /** @type {Promise<HydrusAPI.local_file_storage_locations_response>} */ (await this.call({
            endpoint: '/get_files/local_file_storage_locations',
            return_as: return_as
        }))
    },

    /**
     * Get an image or Ugoira file as rendered by Hydrus.
     * 
     * GET Endpoint: /get_files/render
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-get_filesrender--idget_files_render-
     * @param {HydrusAPI.render_options} options
     * @param {'readable_stream'|'raw'} [return_as] Optional; returns a ReadableStream by default; How do you want the result returned?
     * @returns {Promise<ReadableStream|Response>}
     */
    render: async(options, return_as='readable_stream') => {
        // region: get_files/render
        return /** @type {Promise<ReadableStream|Response>} */ (await this.call({
            endpoint: '/get_files/render',
            queries: optionsToURLSearchParams(options),
            return_as: return_as
        }))
    },


        }
    }

    /**
     * This refers to the File Relationships system,
     * which includes 'potential duplicates', 'duplicates',
     * and 'alternates'.
     * 
     * This system is pending significant rework and expansion,
     * so please do not get too married to some of the routines here.
     * I am mostly just exposing my internal commands,
     * so things are a little ugly/hacked.
     * I expect duplicate and alternate groups to get some form
     * of official identifier in future,
     * which may end up being the way to refer and edit things here.
     * 
     * Also, at least for now,
     * 'Manage File Relationships' permission is not going to
     * be bound by the search permission restrictions that
     * normal file search does.
     * Getting this file relationship management permission
     * allows you to search anything.
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#managing-file-relationships
     */
    get manage_file_relationships() {
        return {
    /**
     * Get the current relationships for one or more files.
     * 
     * `king` refers to which file is set as the best of a duplicate
     * group. If you are doing potential duplicate comparisons,
     * the kings of your two groups are usually the ideal
     * representatives, and the 'get some pairs to filter'-style
     * commands will always select the kings of the various
     * to-be-compared duplicate groups.
     * 
     * `is_king` is a convenience bool for when a file is king
     * of its own group.
     * 
     * **It is possible for the king to not be available.**
     * 
     * Every group has a king, but if that file has been deleted,
     * or if the file domain here is limited and the king
     * is on a different file service, then it may not be available.
     * The regular hydrus potential duplicate pair commands always
     * look at kings, so a group like this will not contribute
     * to any 'potential duplicate pairs' count or filter fetch
     * and so on. 
     * 
     * If you need to do your own clever manual lookups,
     * `king_is_on_file_domain` lets you know if the king is on
     * the file domain you set,
     * and `king_is_local` lets you know if it is on the
     * hard disk--if `king_is_local=true`,
     * you can do a `get_files.file()` request on it.
     * 
     * It is generally rare, but you have to deal with the king
     * being unavailable--in this situation,
     * your best bet is to just use the file itself as its own
     * representative.
     * 
     * All the relationships you get are filtered by the file domain.
     * If you set the file domain to 'all known files',
     * you will get every relationship a file has,
     * including all deleted files,
     * which is often less useful than you would think.
     * The default, 'all my files', is usually most useful.
     * 
     * A file that has no duplicates is considered to be in
     * a duplicate group of size 1 and thus is always its own king.
     * 
     * The numbers are from a duplicate status enum, as so:
     * * 0 - potential duplicates
     * * 1 - false positives
     * * 3 - alternates
     * * 8 - duplicates
     * 
     * Note that because of JSON constraints,
     * these are the string versions of the integers since they
     * are Object keys.
     * 
     * All the hashes given here are in 'all my files',
     * i.e. not in the trash.
     * A file may have duplicates that have long been deleted, but,
     * like the null king above, they will not show here.
     * 
     * GET Endpoint: /manage_file_relationships/get_file_relationships
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-manage_file_relationshipsget_file_relationships--idmanage_file_relationships_get_file_relationships-
     * @param {HydrusAPI.get_file_relationships_options} options
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<HydrusAPI.get_file_relationships_response>}
     */
    get_file_relationships: async(options, return_as) => {
        // region: manage_file_relationships/get_file_relationships
        return /** @type {Promise<HydrusAPI.get_file_relationships_response>} */ (await this.call({
            endpoint: '/manage_file_relationships/get_file_relationships',
            queries: optionsToURLSearchParams(options),
            return_as: return_as
        }))
    },

    /**
     * Get the count of remaining potential duplicate pairs
     * in a particular search domain.
     * Exactly the same as the counts you see in the duplicate
     * processing page.
     * 
     * The arguments here reflect the same options as you see in
     * duplicate page sidebar and auto-resolution system that search
     * for potential duplicate pairs.
     * tag_service_key_x and tags_x work the same as
     * `get_files.search_files()`.
     * The _2 variants are only useful if the
     * `potentials_search_type` is `2`.
     * 
     * `potentials_search_type` is
     * defined by `POTENTIALS_SEARCH_TYPE`
     * 
     * `pixel_duplicates` is
     * defined by `PIXEL_DUPLICATES`
     * 
     * The max_hamming_distance is the same 'search distance'
     * you see in the Client UI.
     * A higher number means more speculative 'similar files' search.
     * If pixel_duplicates is set to
     * `PIXEL_DUPLICATES.MUST_BE_DUPLICATES` (0),
     * then max_hamming_distance is obviously ignored.
     * 
     * If you confirm that a pair of potentials are duplicates,
     * this may transitively collapse other potential pairs
     * and decrease the count by more than 1.
     * 
     * GET Endpoint: /manage_file_relationships/get_potentials_count
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-manage_file_relationshipsget_potentials_count--idmanage_file_relationships_get_potentials_count-
     * @param {HydrusAPI.get_potentials_count_options} [options] Optional
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<HydrusAPI.get_potentials_count_response>}
     */
    get_potentials_count: async(options, return_as) => {
        // region: manage_file_relationships/get_potentials_count
        options = options ?? {}
        return /** @type {Promise<HydrusAPI.get_potentials_count_response>} */ (await this.call({
            endpoint: '/manage_file_relationships/get_potentials_count',
            queries: optionsToURLSearchParams(options),
            return_as: return_as
        }))
    },

    /**
     * Get some potential duplicate pairs for a filtering workflow. Exactly the same as the 'duplicate filter' in the duplicate processing page.
     * 
     * The search arguments work the same
     * as `manage_file_relationships.get_potentials_count()`.
     * 
     * `max_num_pairs` is simple and just caps how many pairs you get.
     * 
     * Returns a list of file hash pairs.
     * These file hashes are all kings that are available in
     * the given file domain.
     * Treat it as the client filter does,
     * where you fetch batches to process one after another.
     * I expect to add grouping/sorting options in the near future.
     * 
     * You may see the same file more than once in each batch,
     * and if you expect to process and commit these as a batch,
     * just like the filter does,
     * you would be wise to skip through pairs that are implicated
     * by a previous decision.
     * When considering whether to display the 'next' pair,
     * you should test:
     * * In the current batch of decisions,
     * has either file been manually deleted by the user?
     * * In the current batch of decisions,
     * has either file been adjudicated as the B in
     * a 'A is better than B' or 'A is the same as B'?
     * 
     * If either is true, you should skip the pair, since,
     * after your current decisions are committed,
     * that file is no longer in any potential duplicate pairs
     * in the search you gave.
     * The respective file is either no longer in the file domain,
     * or it has been merged into another group
     * (that file is no longer a king and either the potential pair
     * no longer exists via transitive collapse or, rarely,
     * hydrus can present you with a better comparison pair
     * if you ask for a new batch).
     * 
     * You will see significantly fewer than `max_num_pairs` as you
     * get close to the last available pairs,
     * and when there are none left, you will get an empty list.
     * 
     * GET Endpoint: /manage_file_relationships/get_potential_pairs
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-manage_file_relationshipsget_potential_pairs--idmanage_file_relationships_get_potential_pairs-
     * @param {HydrusAPI.get_potential_pairs_options} [options] Optional
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<HydrusAPI.get_potential_pairs_response>}
     */
    get_potential_pairs: async(options, return_as) => {
        // region: manage_file_relationships/get_potential_pairs
        options = options ?? {}
        return /** @type {Promise<HydrusAPI.get_potential_pairs_response>} */ (await this.call({
            endpoint: '/manage_file_relationships/get_potential_pairs',
            queries: optionsToURLSearchParams(options),
            return_as: return_as
        }))
    },

    /**
     * Get some random potentially duplicate file hashes.
     * Exactly the same as the 'show some random potential dupes'
     * button in the duplicate processing page.
     * 
     * The arguments work the same as
     * `manage_file_relationships.get_potentials_count()`,
     * with the caveat that `potentials_search_type`
     * has special logic:
     *
     * * 0 - first file matches search 1
     * * 1 - all files match search 1
     * * 2 - first file matches search 1, the others 2
     *
     * Essentially, the first hash is the 'master' to which the
     * others are paired.
     * The other files will include every matching file.
     * 
     * These returned hashes will all be kings.
     * If there are no potential duplicate groups in the search,
     * this returns an empty list.
     * 
     * GET Endpoint: /manage_file_relationships/get_random_potentials
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-manage_file_relationshipsget_random_potentials--idmanage_file_relationships_get_random_potentials-
     * @param {HydrusAPI.get_random_potentials_options} [options] Optional
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<HydrusAPI.get_random_potentials_response>}
     */
    get_random_potentials: async(options, return_as) => {
        // region: manage_file_relationships/get_random_potentials
        options = options ?? {}
        return /** @type {Promise<HydrusAPI.get_random_potentials_response>} */ (await this.call({
            endpoint: '/manage_file_relationships/get_random_potentials',
            queries: optionsToURLSearchParams(options),
            return_as: return_as
        }))
    },
        }
    }

    /**
     * Features:
     * * Get the counts of pending content for each
     * upload-capable service
     * * Commit or forget pending content
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#managing-services
     */
    get manage_services() {
        return {
    /**
     * Get the counts of pending content for each
     * upload-capable service. This basically lets you construct
     * the "pending" menu in the main GUI menubar.
     * 
     * GET Endpoint: /manage_services/get_pending_counts
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-manage_servicesget_pending_counts--idmanage_services_get_pending_counts-
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<HydrusAPI.get_pending_counts_response>}
     */
    get_pending_counts: async(return_as) => {
        // region: manage_services/get_pending_counts
        return /** @type {Promise<HydrusAPI.get_pending_counts_response>} */ (await this.call({
            endpoint: '/manage_services/get_pending_counts',
            return_as: return_as
        }))
    },

    /**
     * Start the job to upload a service's pending content.
     * 
     * This starts the upload popup,
     * just like if you click 'commit' in the menu.
     * This upload could ultimately
     * take one second or several minutes
     * to finish, but the response will come back immediately.
     * 
     * If the job is already running, this will return 409.
     * If it cannot start because of a difficult problem,
     * like all repositories being paused
     * or the service account object
     * being unsynced or something, it gives 422; in this case,
     * please direct the user to check their client manually,
     * since there is probably an error popup on screen.
     * 
     * If tracking the upload job's progress is important,
     * you could hit it again and see if it gives 409, or you could
     * `manage_services.get_pending_counts()` again--since
     * the counts will update live as the upload happens--but note
     * that the user may pend more just after the upload is complete,
     * so do not wait forever for it to fall back down to 0.
     * 
     * !!! Due to the nature of this endpoint it is not tested
     * 
     * POST Endpoint: /manage_services/commit_pending
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-manage_servicescommit_pending--idmanage_services_commit_pending-
     * @param {string} service_key The service to commit
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<boolean>} Successful if true
     */
    commit_pending: async(service_key, return_as) => {
        // region: manage_services/commit_pending
        return /** @type {Promise<boolean>} */ (await this.call({
            endpoint: '/manage_services/commit_pending',
            json: {service_key: service_key},
            return_as: return_as ?? 'success'
        }))
    },

    /**
     * Forget all pending content for a service.
     * 
     * This clears all pending content for a service,
     * just like if you click 'forget' in the menu.
     * 
     * !!! Due to the nature of this endpoint it is not tested
     * 
     * POST Endpoint: /manage_services/forget_pending
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-manage_servicesforget_pending--idmanage_services_forget_pending-
     * @param {string} service_key The service to forget for
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<boolean>} Successful if true
     */
    forget_pending: async(service_key, return_as) => {
        // region: manage_services/forget_pending
        return /** @type {Promise<boolean>} */ (await this.call({
            endpoint: '/manage_services/forget_pending',
            json: {service_key: service_key},
            return_as: return_as ?? 'success'
        }))
    },

        }
    }

    /**
     * Get and modify cookies for a given domain (website)
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#managing-cookies
     */
    get manage_cookies() {
        return {
    /**
     * Get the cookies for a particular domain.
     * 
     * This request will also return any cookies for subdomains.\
     * The session system in hydrus generally stores cookies
     * according to the second-level domain,
     * so if you request for specific.someoverbooru.net,
     * you will still get the cookies
     * for someoverbooru.net and all its subdomains.
     * 
     * GET Endpoint: /manage_cookies/get_cookies
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-manage_cookiesget_cookies--idmanage_cookies_get_cookies-
     * @param {string} domain the domain to get cookies for
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<HydrusAPI.get_cookies_response>}
     */
    get_cookies: async(domain, return_as) => {
        // region: manage_cookies/get_cookies
        return /** @type {Promise<HydrusAPI.get_cookies_response>} */ (await this.call({
            endpoint: '/manage_cookies/get_cookies',
            queries: optionsToURLSearchParams({domain: domain}),
            return_as: return_as
        }))
    },

    /**
     * Set some new cookies for Hydrus
     * This makes it easier to 'copy'
     * a login from a web browser or similar
     * to hydrus if hydrus's login system
     * can't handle the site yet
     *
     * POST Endpoint: /manage_cookies/set_cookies
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-manage_cookiesset_cookies--idmanage_cookies_set_cookies-
     * @param {HydrusAPI.set_cookies_options} options
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<boolean>} Successful if true
     */
    set_cookies: async(options, return_as) => {
        // region: manage_cookies/set_cookies
        return /** @type {Promise<boolean>} */ (await this.call({
            endpoint: '/manage_cookies/set_cookies',
            json: options,
            return_as: return_as ?? 'success'
        }))
    },

        }
    }

    /**
     * Get and modify HTTP Headers for a given domain (website)
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#managing-http-headers
     */
    get manage_headers() {
        return {
            // TODO
        }
    }

    /**
     * Features:
     * * Get a list of pages
     * * Get info about a page
     * * Add files to a page
     * * Focus (make active) a page
     * * Refresh a page
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#managing-pages
     */
    get manage_pages() {
        return {
    /**
     * Get the page structure of the current UI session.
     * 
     * GET Endpoint: /manage_pages/get_pages
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-manage_pagesget_pages--idmanage_pages_get_pages-
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<HydrusAPI.get_pages_response>}
     */
    get_pages: async(return_as) => {
        // region: manage_pages/get_pages
        return /** @type {Promise<HydrusAPI.get_pages_response>} */ (await this.call({
            endpoint: '/manage_pages/get_pages',
            return_as: return_as
        }))
    },

    /**
     * Get information about a specific page.
     * 
     * !!! warning "Under Construction" This is under construction.
     * The current call dumps a ton of info
     * for different downloader pages.
     * Please experiment in IRL situations
     * and give feedback for now!
     * I will flesh out this help with more enumeration info
     * and examples as this gets nailed down.
     * POST commands to alter pages (adding, removing, highlighting),
     * will come later.
     * 
     * GET Endpoint: /manage_pages/get_page_info
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-manage_pagesget_page_info--idmanage_pages_get_page_info-
     * @param {{page_key: string,  simple?: boolean}} options
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<HydrusAPI.get_page_info_response>}
     */
    get_page_info: async(options, return_as) => {
        // region: manage_pages/get_page_info
        return /** @type {Promise<HydrusAPI.get_page_info_response>} */ (await this.call({
            endpoint: `/manage_pages/get_page_info`,
            queries: optionsToURLSearchParams(options),
            return_as: return_as
        }))
    },

    /**
     * Add files to a page.
     * 
     * POST Endpoint: /manage_pages/add_files
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-manage_pagesadd_files--idmanage_pages_add_files-
     * @param {HydrusAPI.add_files_options} options
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<boolean>} Successful if true
     */
    add_files: async(options, return_as) => {
        // region: manage_pages/add_files
        return /** @type {Promise<boolean>} */ (await this.call({
            endpoint: '/manage_pages/add_files',
            json: options,
            return_as: return_as ?? 'success'
        }))
    },

    /**
     * 'Show' a page in the main GUI,
     * making it the current page in view.
     * If it is already the current page, no change is made.
     * 
     * POST Endpoint: /manage_pages/focus_page
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-manage_pagesfocus_page--idmanage_pages_focus_page-
     * @param {string} page_key
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<boolean>} successful if true
     */
    focus_page: async(page_key, return_as) => {
        // region: manage_pages/focus_page
        return /** @type {Promise<boolean>} */ (await this.call({
            endpoint: `/manage_pages/focus_page`,
            json: {
                page_key: page_key
            },
            return_as: return_as ?? 'success'
        }))
    },

    /**
     * Refresh a page in the main GUI.
     * 
     * Like hitting F5 in the client,
     * this obviously makes file search pages perform their
     * search again, but for other page types it will force
     * the currently in-view files to be re-sorted.
     * 
     * POST Endpoint: /manage_pages/refresh_page
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-manage_pagesrefresh_page--idmanage_pages_refresh_page-
     * @param {string} page_key The page key for the page you wish to refresh
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<boolean>} Successful if true
     */
    refresh_page: async(page_key, return_as) => {
        // region: manage_pages/refresh_page
        return /** @type {Promise<boolean>} */ (await this.call({
            endpoint: '/manage_pages/refresh_page',
            json: {page_key: page_key},
            return_as: return_as ?? 'success'
        }))
    },

        }
    }

    /**
     * Create, trigger, and remove Hydrus popups
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#managing-popups
     */
    get manage_popups() {
        return {
            // TODO
        }
    }

    /**
     * Features:
     * * Lock and unlock the database
     * * Force a commit
     * * Get statistics from Mr. Bones
     * * Get all of Hydrus Network's client settings
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#managing-the-database
     */
    get manage_database() {
        return {
    /**
     * Force the database to write all pending changes
     * to disk immediately.
     * 
     * !!! info:
     * Hydrus holds a constant BEGIN IMMEDIATE transaction
     * on its database. Separate jobs are 'transactionalised'
     * using SAVEPOINT, and the real transactions are only COMMIT-ed
     * to disk every 30 seconds or so.
     * Thus, if the client crashes, a user can lose up to 30 seconds
     * of changes (or more, if they use the launch path
     * to extend the inter-transaction duration).
     *
     * This command lets you force a COMMIT as soon as possible.
     * The request will only return when the commit is done
     * and finished, so you can trust when this returns 200 OK
     * that you are in the clear and everything is saved.
     * If the database is currently disconnected (e.g. there
     * is a vacuum going on), then it returns very fast,
     * but you can typically expect it to take a handful
     * of milliseconds. If there is a normal database job already
     * happening when you call, it will COMMIT when that is complete,
     * and if things are really busy (e.g. amidst idle-time
     * repository processing) then there could be hundreds of
     * megabytes to write. This job may, when the database is under
     * strain, take ten or more seconds to complete.
     * 
     * POST Endpoint: /manage_database/force_commit
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-manage_databaseforce_commit--idmanage_database_force_commit-
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<boolean>} Successful if true
     */
    force_commit: async(return_as) => {
        // region: manage_database/force_commit
        return /** @type {Promise<boolean>} */ (await this.call({
            endpoint: '/manage_database/force_commit',
            method: 'POST',
            return_as: return_as ?? 'success'
        }))
    },

    /**
     * Pause the client's database activity and disconnect
     * the current connection.
     * 
     * This is a hacky prototype.
     * 
     * It commands the client database to pause its job queue
     * and release its connection (and related file locks
     * and journal files). This puts the client in a similar position
     * as a long VACUUM command--it'll hang in there,
     * but not much will work, and since the UI async code isn't
     * great yet, the UI may lock up after a minute or two.
     * If you would like to automate database backup without shutting
     * the client down, this is the thing to play with.
     *
     * This should return pretty quick, but it will wait
     * up to five seconds for the database to actually disconnect.
     * If there is a big job (like a VACUUM) current going on,
     * it may take substantially longer to finish that up
     * and process this STOP command.
     * You might like to check for the existence of a journal file
     * in the db dir just to be safe.
     *
     * As long as this lock is on,
     * all Client API calls except the unlock command will return 503.
     * (This is a decent way to test the current lock status, too)
     * 
     * POST Endpoint: /manage_database/lock_on
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-manage_databaselock_on--idmanage_database_lock_on-
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<boolean>} Successful if true
     */
    lock_on: async(return_as) => {
        // region: manage_database/lock_on
        return /** @type {Promise<boolean>} */ (await this.call({
            endpoint: '/manage_database/lock_on',
            method: 'POST',
            return_as: return_as ?? 'success'
        }))
    },

    /**
     * Reconnect the client's database and resume activity.
     * 
     * This is the obvious complement to lock_on.
     * The client will resume processing its job queue
     * and will catch up. If the UI was frozen,
     * it should free up in a few seconds,
     * just like after a big VACUUM.
     * 
     * POST Endpoint: /manage_database/lock_off
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-manage_databaselock_off--idmanage_database_lock_off-
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<boolean>} Successful if true
     */
    lock_off: async(return_as) => {
        // region: manage_database/lock_off
        return /** @type {Promise<boolean>} */ (await this.call({
            endpoint: '/manage_database/lock_off',
            method: 'POST',
            return_as: return_as ?? 'success'
        }))
    },

    /**
     * Gets the data from database->how boned am I?.
     * 
     * This is a simple Object of numbers for advanced purposes.
     * Useful if you want to show or record some stats.
     * The numbers are the same as the dialog shows,
     * so double check that to confirm what each value is for.
     * 
     * GET Endpoint: /manage_database/mr_bones
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-manage_databasemr_bones--idmanage_database_mr_bones-
     * @param {HydrusAPI.mr_bones_options} [options] Optional
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<HydrusAPI.mr_bones_response>}
     */
    mr_bones: async(options = {}, return_as) => {
        // region: manage_database/mr_bones
        return /** @type {Promise<HydrusAPI.mr_bones_response>} */ (await this.call({
            endpoint: '/manage_database/mr_bones',
            queries: optionsToURLSearchParams(options),
            return_as: return_as
        }))
    },

    /**
     * Gets the current options from the client.
     * 
     * !!! This endpoint is unstable and could potentially change with hydrus version instead of api version
     * !!! This endpoint will throw an error if Hydrus' version doesn't match this.HYDRUS_TARGET_VERSION
     * 
     * !!! While this endpoint's response will be type defined it will not be documented or tested due to its unstable nature
     * 
     * !!! Type defs are a best attempt and should be taken with a grain of salt
     * 
     * GET Endpoint: /manage_database/get_client_options
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-manage_databaseget_client_options--idmanage_database_get_client_options-
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<HydrusAPI.get_client_options_response>}
     */
    get_client_options: async(return_as) => {
        const ver = await this.api_version()
        if (ver.hydrus_version !== this.HYDRUS_TARGET_VERSION) {
            throw new Error(`This endpoint is currently experimental. Please use a version of HydrusAPI that matches '${this.VERSION}.${this.HYDRUS_TARGET_VERSION}.*'!`)
        }
        // region: manage_database/get_client_options
        return /** @type {Promise<HydrusAPI.get_client_options_response>} */ (await this.call({
            endpoint: '/manage_database/get_client_options',
            return_as: return_as
        }))
    },

        }
    }

    /**
     * These are functions that add useful features that don't exist
     * on any endpoint. This allows us to add functionality while
     * keeping the usage for the endpoint methods close to the same
     * as the raw api.
     */
    get tools () {
        return {
    /**
     * calls the `api.get_services()` endpoint,
     * checks each entry for ones with a matching
     * SERVICE_TYPE, and then returns a new array
     * with the results
     * 
     * @param {HydrusAPI.SERVICE_TYPE_VALUE} [service_type=11] Optional; defaults to `all known files`; The service type to get
     * @returns {Promise<HydrusAPI.ServiceObjectWithKey[]>}
     */
    get_services_of_type: async(service_type=11) => {
        /** @type {HydrusAPI.ServiceObjectWithKey[]} */
        const matches = []
        const services = (await this.get_services()).services
        /** @type {string} */
        let key
        /** @type {HydrusAPI.ServiceObject & {service_key?: string}} */
        let value
        for ([key, value] of Object.entries(services)) {
            if (value.type === service_type) {
                value.service_key = key
                matches.push(/** @type {HydrusAPI.ServiceObjectWithKey} */ (value))
            }
        }
        return matches
    },

    /**
     * calls the `api.get_services()` endpoint,
     * checks each entry for ones with a matching
     * name, and then returns a new array
     * with the results
     * 
     * @param {string} name The name of the service to get
     * @returns {Promise<HydrusAPI.ServiceObjectWithKey[]>}
     */
    get_services_of_name: async(name) => {
        /** @type {HydrusAPI.ServiceObjectWithKey[]} */
        const matches = []
        const services = (await this.get_services()).services
        /** @type {string} */
        let key
        /** @type {HydrusAPI.ServiceObject & {service_key?: string}} */
        let value
        for ([key, value] of Object.entries(services)) {
            if (value.name === name) {
                value.service_key = key
                matches.push(/** @type {HydrusAPI.ServiceObjectWithKey} */ (value))
            }
        }
        return matches
    },
        }
    }
}
