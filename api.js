
// cSpell: ignore undelete, inboxed, unarchived, doublecheck_file_system
// cSpell: ignore normalise, favourite, favourites, pngs, pdfs, someoverbooru
// cSpell: ignore normalised

/**
 * Takes an options object and convert it to an URLSearchParams instance
 * making sure that all lists and objects are encoded as JSON strings first
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

module.exports = class RawAPI{
    // region: RawAPI

    /** @type {boolean} */
    debug
    /** @type {string} */
    access_key
    /** @type {string} */
    address

    VERSION = 80
    /** What version of Hydrus are we testing against */
    HYDRUS_TARGET_VERSION = 635

    /**
     * These are the permissions that the client can have
     * @type {BASIC_PERMS}
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

    /**
     * We highly suggest wrapping this class' methods
     * in functions over using them directly.
     * @param {RawAPIOptions} [options={}] Extra options
     */
    constructor(options={}) {
        this.access_key = options?.access_key ?? ''
        this.address = options?.address ?? 'http://127.0.0.1:45869'
        this.debug = options?.debug ?? false
    }

    /**
     * Constructs an API call and then calls it, returning the result
     * @param {CallOptions} o
     * @returns {Object|boolean|number|ReadableStream}
     * Object if `return_as` is `raw` or `json`;
     * boolean if `return_as` is `success`;
     * number if `return_as` is `status`;
     * ReadableStream if `return_as` is `readable_stream`;
     */
    async call(o) {
        // region: call
        if (this.debug) {
            console.log(`ENDPOINT: ${o.endpoint}`)
        }

        o.headers = o.headers ?? new Headers()
        o.method = o.method ?? (o.queries ? 'GET' : (o.json ? 'POST' : (o.body ? 'POST' : 'GET')))
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

        const fetch_options = {}

        for (const key of Object.keys(o)) {
            if (!['endpoint', 'return_as', 'json'].includes(key)) {
                fetch_options[key] = o[key]
            }
        }

        fetch_options.body = fetch_options.body ?? (o.json ? JSON.stringify(o.json) : undefined)
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
            const throw_not_okay = () => {
                if (!response.ok) {
                    const message = `endpoint '${o.endpoint}' responded with status code '${response.status}' and status text '${response.statusText}'`
                    if (!this.debug) {
                        console.error(response)
                    }
                    // TODO: attempt to parse Hydrus error message from json
                    throw new Error(message)
                }
            }
            
            switch (o.return_as) {
                case 'raw':
                    return response
                case 'json':
                    throw_not_okay()
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
                    throw_not_okay()
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
     * Endpoint: /api_version
     *
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-api_version--idapi_version-
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {api_version_response}
     */
    async api_version(return_as) {
        // region: api_version
        return this.call({
            endpoint: '/api_version',
            return_as: return_as
        })
    }

    /**
     * Register a new external program with Hydrus.
     * This requires the 'add from api request' mini-dialog
     * under services->review services to be open, otherwise it will 403.
     * 
     * Endpoint: /request_new_permissions
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-request_new_permissions--idrequest_new_permissions-
     * @param {request_new_permissions_options} options
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {request_new_permissions_response}
     */
    async request_new_permissions(options, return_as) {
        // region: request_new_permissions
        if (options?.permissions === 'all') {
            options.permissions = Object.values(this.BASIC_PERM)
        }
        return await this.call({
            endpoint: '/request_new_permissions',
            queries: optionsToURLSearchParams(options),
            return_as: return_as
        })
    }

    /**
     * Gets a session key for the client.
     * 
     * A session key expires after 24 hours of inactivity,
     * whenever Hydrus restarts,
     * or if the underlying access key is deleted.
     * A request on an expired session key returns 419.
     * 
     * Endpoint: /session_key
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-session_key--idsession_key-
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {session_key_response}
     */
    async session_key(return_as) {
        // region: session_key
        return await this.call({
            endpoint: '/session_key',
            return_as: return_as
        })
    }

    /**
     * Returns the permissions that the client has
     * with its current access key.
     * 
     * Endpoint: /verify_access_key
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-verify_access_key--idverify_access_key-
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {verify_access_key_response}
     */
    async verify_access_key(return_as) {
        // region: verify_access_key
        return await this.call({
            endpoint: '/verify_access_key',
            return_as: return_as
        })
    }

    /**
     * Returns info for a given service.
     * If the service does not exist, this gives 404.
     * It is very unlikely but edge-case possible that
     * two services will have the same name,
     * in this case you'll get the pseudorandom first.
     * 
     * Endpoint: /get_service
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-get_service--idget_service-
     * @param {{service_name?: string, service_key?: string}} service either service_name or service_key must be provided
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {get_service_response}
     */
    async get_service(service, return_as) {
        // region: get_service
        return await this.call({
            endpoint: '/get_service',
            queries: optionsToURLSearchParams(service),
            return_as: return_as
        })
    }

    /**
     * Returns info for all services
     * 
     * Endpoint: /get_services
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-get_services--idget_services-
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {get_services_response}
     */
    async get_services(return_as) {
        // region: get_services
        return await this.call({
            endpoint: '/get_services',
            return_as: return_as
        })
    }

    /**
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#importing-and-deleting-files
     */
    get add_files() {
        return {
    /**
     * Tell Hydrus to import a file.
     * supply a json with either bytes : *file bytes* 
     * or path: *file path*
     * 
     * Endpoint: /add_files/add_file
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-add_filesadd_file--idadd_files_add_file-
     * @param {{bytes: *}|{path: string, delete_after_successful_import?: boolean}} options path to the file or the file data
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {add_file_response}
     */
    add_file: async(options, return_as) => {
        // region: add_files/add_file
        /** @type {CallOptions} */
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
        return await this.call(o)
    },

    /**
     * Tell Hydrus to delete one or more files
     * 
     * Endpoint: /add_files/delete_files
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-add_filesdelete_files--idadd_files_delete_files-
     * @param {Object} options
     * @param {number} [options.file_id] the id of the file to be deleted
     * @param {string} [options.hash] the SHA256 hash of the file to be deleted
     * @param {string[]} [options.hashes] the SHA256 hashes of the files to be deleted
     * @param {string} [options.file_domain] a local file domain; defaults to 'all my files'
     * @param {string} [options.reason] an optional reason for the file deletion
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {boolean} true if successful
     */
    delete_files: async(options, return_as) => {
        // region: add_files/delete_files
        return await this.call({
            endpoint: '/add_files/delete_files',
            json: options,
            return_as: return_as ?? 'success'
        })
    },

    /**
     * Tell Hydrus to undelete one or more files
     * 
     * Endpoint: /add_files/undelete_files
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-add_filesundelete_files--idadd_files_undelete_files-
     * @param {Object} options
     * @param {number} [options.file_id] the id of the file to be undeleted
     * @param {string} [options.hash] the SHA256 hash of the file to be undeleted
     * @param {string[]} [options.hashes] the SHA256 hashes of the files to be undeleted
     * @param {string} [options.file_domain] a local file domain; defaults to 'all my files'
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {boolean} successful if true
     */
    undelete_files: async (options, return_as) => {
        // region: add_files/undelete_files
        return await this.call({
            endpoint: '/add_files/undelete_files',
            json: options,
            return_as: return_as ?? 'success'
        })
    },

    /**
     * Tell Hydrus to clear any deletion records it has for a file
     * 
     * Endpoint: /add_files/clear_file_deletion_record
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-add_filesclear_file_deletion_record--idadd_files_clear_file_deletion_record-
     * @param {Object} options
     * @param {number} [options.file_id] the id of the file to have its deletion record removed
     * @param {string} [options.hash] the SHA256 hash of the file to have its deletion record removed
     * @param {string[]} [options.hashes] the SHA256 hashes of the files to have their deletion records removed
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {boolean} successful if true
     */
    clear_file_deletion_record: async(options, return_as) => {
        // region: add_files/clear_file_deletion_record
        return await this.call({
            endpoint: '/add_files/clear_file_deletion_record',
            json: options,
            return_as: return_as ?? 'success'
        })
    },

    /**
     * Add a file to one or more local file services
     * 
     * Endpoint: /add_files/migrate_files
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-add_filesmigrate_files--idadd_files_migrate_files-
     * @param {Object} options
     * @param {number} [options.file_id] the id of the file to be added to the given local file service(s)
     * @param {string} [options.hash] the SHA256 hash of the file to added to the given local file service(s)
     * @param {string[]} [options.hashes] the SHA256 hashes of the files to added to the given local file service(s)
     * @param {string} [options.file_service_key] The id of the file service to add to
     * @param {string[]} [options.file_service_keys] The ids of the file services to add to
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {boolean} successful if true
     */
    migrate_files: async(options, return_as) => {
        // region: add_files/migrate_files
        return await this.call({
            endpoint: '/add_files/migrate_files',
            json: options,
            return_as: return_as ?? 'success'
        })
    },

    /**
     * Tell Hydrus to archive inboxed files
     * 
     * Endpoint: /add_files/archive_files
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-add_filesarchive_files--idadd_files_archive_files-
     * @param {FilesObject} options
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {boolean} if true then the file was successfully archived, was already archived, or doesn't exist
     */
    archive_files: async(options, return_as) => {
        // region: add_files/archive_files
        return await this.call({
            endpoint: '/add_files/archive_files',
            json: options,
            return_as: return_as ?? 'success'
        })
    },

    /**
     * Tell Hydrus to unarchive files which moves them to the inbox
     * 
     * Endpoint: /add_files/unarchive_files
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-add_filesunarchive_files--idadd_files_unarchive_files-
     * @param {Object} options
     * @param {number} [options.file_id] the id of the file to be unarchived
     * @param {string} [options.hash] the SHA256 hash of the file to unarchived
     * @param {string[]} [options.hashes] the SHA256 hashes of the files to unarchived
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {boolean} if true then the file was successfully unarchived, was already unarchived, or doesn't exist
     */
    unarchive_files: async(options, return_as) => {
        // region: add_files/unarchive_files
        return await this.call({
            endpoint: '/add_files/unarchive_files',
            json: options,
            return_as: return_as ?? 'success'
        })
    },

    /**
     * Asks Hydrus to attempt to generate hashes for the given file.
     * supply a json with either bytes : *file bytes* 
     * or path: *file path*
     * 
     * Endpoint: /add_files/generate_hashes
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-add_filesgenerate_hashes--idadd_files_generate_hashes-
     * @param {generate_hashes_options} options path to the file or the file data
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {generate_hashes_response}
     */
    generate_hashes: async(options, return_as) => {
        // region: add_files/generate_hashes
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
        return await this.call(o)
    },

        }
    }

    /**
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#importing-and-editing-urls
     */
    get add_urls() {
        return {
    /**
     * Ask Hydrus about a URL's files.
     * 
     * Endpoint: /add_urls/get_url_files
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-add_urlsget_url_files--idadd_urls_get_url_files-
     * @param {get_url_files_options} options
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {get_url_files_response}
     */
    get_url_files: async(options, return_as) => {
        // region: add_urls/get_url_files
        const q = new URLSearchParams()
        if (options.doublecheck_file_system) {
            q.append('doublecheck_file_system', options.doublecheck_file_system)
        }
        q.append('url', options.url)
        return await this.call({
            endpoint: '/add_urls/get_url_files',
            queries: q,
            return_as: return_as
        })
    },

    /**
     * Ask Hydrus for information about a URL.
     * 
     * Endpoint: /add_urls/get_url_info
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-add_urlsget_url_info--idadd_urls_get_url_info-
     * @param {string} url url you want to check
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {get_url_info_response}
     */
    get_url_info: async(url, return_as) => {
        // region: add_urls/get_url_info
        return await this.call({
            endpoint: '/add_urls/get_url_info',
            queries: optionsToURLSearchParams({url: url}),
            return_as: return_as
        })
    },

    /**
     * Tell Hydrus to 'import' a URL.
     * This triggers the exact same routine as drag-and-dropping
     * a text URL onto the main Hydrus window.
     * 
     * Endpoint: /add_urls/add_url
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-add_urlsadd_url--idadd_urls_add_url-
     * @param {Object} options
     * @param {string} options.url url to add
     * @param {string} [options.destination_page_key] optional page identifier for the page to receive the url
     * @param {string} [options.destination_page_name] optional page name to receive the url
     * @param {string} [options.file_domain] optional, sets where to import the file
     * @param {boolean} [options.show_destination_page] optional, defaulting to false, controls whether the UI will change pages on add
     * @param {{[key: string]: string[]}} [options.service_keys_to_additional_tags] optional, selective, tags to give to any files imported from this url
     * @param {string[]} [options.filterable_tags] optional tags to be filtered by any tag import options that applies to the URL
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {add_url_response}
     */
    add_url: async(options, return_as) => {
        // region: add_urls/add_url
        return await this.call({
            endpoint: '/add_urls/add_url',
            json: options,
            return_as: return_as,
        })
    },

    /**
     * Manage which URLs Hydrus considers to be associated with which files.
     * 
     * Endpoint: /add_urls/associate_url
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-add_urlsassociate_url--idadd_urls_associate_url-
     * @param {Object} options
     * @param {number} [options.file_id] the id of the file to have URL(s) associated
     * @param {string} [options.hash] the SHA256 hash of the file to have URL(s) associated
     * @param {string[]} [options.hashes] the SHA256 hashes of the files to have URL(s) associated
     * @param {string} [options.url_to_add] a URL to add to the file(s)
     * @param {string[]} [options.urls_to_add] a list of URLs to add to the file(s)
     * @param {string} [options.url_to_delete] a URL to remove from the file(s)
     * @param {string} [options.urls_to_delete] a list of URLs to remove from the file(s)
     * @param {boolean} [options.normalise_urls=true]
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {boolean} successful if true
     */
    associate_url: async(options, return_as) => {
        // region: add_urls/associate_url
        return await this.call({
            endpoint: '/add_urls/associate_url',
            json: options,
            return_as: return_as ?? 'success'
        })
    }

        }
    }

    /**
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#editing-file-tags
     */
    get add_tags() {
        return {
    /**
     * Ask Hydrus about how it will see certain tags.
     * 
     * Endpoint: /add_tags/clean_tags
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-add_tagsclean_tags--idadd_tags_clean_tags-
     * @param {string[]} tags
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {clean_tags_response}
     */
    clean_tags: async(tags, return_as) => {
        // region: add_tags/clean_tags
        return await this.call({
            endpoint: '/add_tags/clean_tags',
            queries: optionsToURLSearchParams({tags: tags}),
            return_as: return_as
        })
    },

    /**
     * Fetch Hydrus' favourite tags. This is the list of tags you see beneath an autocomplete input, under the 'favourites' tab. This is not the per-service 'most used' tab you see in manage tags.
     * 
     * Endpoint: /add_tags/get_favourite_tags
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-add_tagsget_favourite_tags--idadd_tags_get_favourite_tags-
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {get_favourite_tags_response}
     */
    get_favourite_tags: async(return_as) => {
        // region add_tags/get_favourite_tags
        return await this.call({
            endpoint: '/add_tags/get_favourite_tags',
            return_as: return_as
        })
    },

    /**
     * Ask Hydrus about a tags' sibling and parent relationships.
     * 
     * /add_tags/get_siblings_and_parents
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-add_tagsget_siblings_and_parents--idadd_tags_get_siblings_and_parents-
     * @param {string[]} tags
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {get_siblings_and_parents_response}
     */
    get_siblings_and_parents: async(tags, return_as) => {
        // region add_tags/get_siblings_and_parents
        return await this.call({
            endpoint: '/add_tags/get_siblings_and_parents',
            queries: optionsToURLSearchParams({tags: tags}),
            return_as: return_as
        })
    },

    /**
     * Search Hydrus for tags.
     * 
     * Endpoint: /add_tags/search_tags
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-add_tagssearch_tags--idadd_tags_search_tags-
     * @param {Object} options
     * @param {string} options.search The query to search for
     * @param {string} [options.file_domain="all my files"]
     * @param {string} [options.tag_service_key]
     * @param {string} [options.tag_display_type="storage"] "storage" or "display"
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {search_tags_response}
     */
    search_tags: async(options, return_as) => {
        // region add_tags/search_tags
        return await this.call({
            endpoint: '/add_tags/search_tags',
            queries: optionsToURLSearchParams(options),
            return_as: return_as
        })
    },

    /**
     * Make changes to the tags that files have.
     * 
     * Endpoint: /add_tags/add_tags
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-add_tagsadd_tags--idadd_tags_add_tags-
     * @param {Object} options
     * @param {number} [options.file_id] the id of the file to be tagged
     * @param {string} [options.hash] the SHA256 hash of the file to be tagged
     * @param {string[]} [options.hashes] the SHA256 hashes of the files to be tagged
     * @param {{[key: string]: string[]}} [options.service_keys_to_tags] key is a service key and the value is an array of tags to add
     * @param {*} [options.service_keys_to_actions_to_tags] // TODO: type def
     * @param {boolean} [options.override_previously_deleted_mappings=true]
     * @param {boolean} [options.create_new_deleted_mappings=true]
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {boolean} successful if true
     */
    add_tags: async(options, return_as) => {
        // region: add_tags/add_tags
        return await this.call({
            endpoint: '/add_tags/add_tags',
            json: options,
            return_as: return_as ?? 'success'
        })
    },

    /**
     * Edit Hydrus' favourite tags.
     * This is the complement to /add_tags/get_favourite_tags.
     * 
     * Endpoint: set_favourite_tags
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-add_tagsset_favourite_tags--idadd_tags_set_favourite_tags-
     * @param {set_favourite_tags_options} options
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {get_favourite_tags_response}
     */
    set_favourite_tags: async(options, return_as) => {
        // region: add_tags/set_favourite_tags
        return await this.call({
            endpoint: '/add_tags/set_favourite_tags',
            json: options,
            return_as: return_as
        })
    },
    
        }
    }

    /**
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#editing-file-ratings
     */
    get edit_ratings() {
        return {
    /**
     * Add or remove ratings associated with a file.
     * 
     * Endpoint: /edit_ratings/set_rating
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-edit_ratingsset_rating--idedit_ratings_set_rating-
     * @param {set_rating_options} options
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {boolean} successful if true
     */
    set_rating: async(options, return_as) => {
        // region: edit_ratings/set_rating
        return await this.call({
            endpoint: '/edit_ratings/set_rating',
            json: options,
            return_as: return_as ?? 'success'
        })
    },
    
        }
    }

    /**
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#editing-file-times
     */
    get edit_times() {
        return {
            // TODO: https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#editing-file-times
        }
    }

    /**
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#editing-file-notes
     */
    get add_notes() {
        return {
            // TODO: https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#editing-file-notes
        }
    }

    /**
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#searching-and-fetching-files
     */
    get get_files() {
        return {
    /**
     * Search Hydrus for files.
     * 
     * Endpoint: /get_files/search_files
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-get_filessearch_files--idget_files_search_files-
     * @param {search_files_options} options
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {search_files_response}
     */
    search_files: async(options, return_as) => {
        // region: get_files/search_files
        return await this.call({
            endpoint: '/get_files/search_files',
            queries: optionsToURLSearchParams(options),
            return_as: return_as,
        })
    },

    /**
     * Takes one or more hashes and asks Hydrus for alternative hash types that match.
     * Example use case: You have a MD5 hash and want to find a SHA256 hash.
     * Hydrus will return results for any files it has ever had imported.
     * 
     * Endpoint: /get_files/file_hashes
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-get_filesfile_hashes--idget_files_file_hashes-
     * @param {file_hashes_options} options
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {file_hashes_response}
     */
    file_hashes: async(options, return_as) => {
        // region: get_files/file_hashes
        return await this.call({
            endpoint: '/get_files/file_hashes',
            queries: optionsToURLSearchParams(options),
            return_as: return_as,
        })
    },

    /**
     * Get a file's metadata
     * 
     * Endpoint: get_files/file_metadata
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-get_filesfile_metadata--idget_files_file_metadata-
     * @param {get_file_metadata_options} options
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {get_file_metadata_response}
     */
    file_metadata: async(options, return_as) => {
        // region: get_files/file_metadata
        return await this.call({
            endpoint: '/get_files/file_metadata',
            queries: optionsToURLSearchParams(options),
            return_as: return_as,
        })
    },

    /**
     * Get a file
     * 
     * Either `options.file_id` or `options.hash` must be defined, but not both.
     * By default, this will set the Content-Disposition header to inline,
     * which causes a web browser to show the file.
     * If you set `options.download` to `true`, it will set it to attachment,
     * which triggers the browser to automatically download it
     * (or open the 'save as' dialog) instead.
     * 
     * This stuff supports Range requests,
     * so if you want to build a video player, go nuts.
     * 
     * Endpoint: /get_files/file
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-get_filesfile--idget_files_file-
     * @param {file_options} options
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {ReadableStream<Uint8Array<ArrayBufferLike>>|Object|number} the raw readableStream if return_as is the default
     */
    file: async(options, return_as='readable_stream') => {
        // region: get_files/file
        return await this.call({
            endpoint: '/get_files/file',
            queries: optionsToURLSearchParams(options),
            return_as: return_as,
        })
    },

    /**
     * Get a file's thumbnail.
     * 
     * Either `options.file_id` or `options.hash` must be defined, but not both.
     * 
     * Response: The thumbnail for the file. Some hydrus thumbs are jpegs,
     * some are pngs.
     * It should give you the correct image/jpeg or image/png Content-Type.
     * 
     * If hydrus keeps no thumbnail for the filetype, for instance with pdfs,
     * then you will get the same default 'pdf' icon you see in Hydrus.
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
     * Also, even 'clean' thumbnails will not always fit inside the settings'
     * bounding box;
     * they may be boosted due to a high-DPI setting or spill over due to
     * a 'fill' vs 'fit' preference.
     * You cannot easily predict what resolution a thumbnail will or should have!
     * 
     * In general, thumbnails *are* the correct ratio.
     * If you are drawing thumbs, you should embed them to fit or fill,
     * but don't fix them at 100% true size:
     * make sure they can scale to the size you want!
     * 
     * !!! note "Size of Defaults"
     * If you get a 'default' filetype thumbnail like the pdf or hydrus one,
     * you will be pulling the pngs straight from the hydrus/static folder.
     * They will most likely be 200x200 pixels.
     * 
     * Endpoint: /get_files/thumbnail
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-get_filesthumbnail--idget_files_thumbnail-
     * @param {thumbnail_options} options
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {ReadableStream<Uint8Array<ArrayBufferLike>>|Object|number} the raw readableStream if return_as is the default
     */
    thumbnail: async(options, return_as='readable_stream') => {
        // region: get_files/thumbnail
        return await this.call({
            endpoint: '/get_files/thumbnail',
            queries: optionsToURLSearchParams(options),
            return_as: return_as,
        })
    },

    /**
     * Get a local file path.
     * 
     * Either `options.file_id` or `options.hash` must be defined, but not both.
     * 
     * This will give 404 if the file is not stored locally
     * (which includes if it should exist
     * but is actually missing from the file store).
     * 
     * Endpoint: /get_files/file_path
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-get_filesfile_path--idget_files_file_path-
     * @param {file_path_options} options
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {file_path_response}
     */
    file_path: async(options, return_as) => {
        // region: get_files/file_path
        return await this.call({
            endpoint: '/get_files/file_path',
            queries: optionsToURLSearchParams(options),
            return_as: return_as
        })
    },

    /**
     * Get a local file path.
     * 
     * Either `options.file_id` or `options.hash` must be defined, but not both.
     * 
     * All thumbnails in hydrus have the .thumbnail file extension
     * and in content are either jpeg (almost always)
     * or png (to handle transparency).
     * 
     * This will 400 if the given file type does not have a thumbnail in hydrus,
     * and it will 404 if there should be a thumbnail
     * but one does not exist and cannot be generated from the source file
     * (which probably would mean that the source file was itself Not Found).
     * 
     * Endpoint: /get_files/thumbnail_path
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-get_filesthumbnail_path--idget_files_thumbnail_path-
     * @param {thumbnail_path_options} options
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {thumbnail_path_response}
     */
    thumbnail_path: async(options, return_as) => {
        // region: get_files/thumbnail_path
        return await this.call({
            endpoint: '/get_files/thumbnail_path',
            queries: optionsToURLSearchParams(options),
            return_as: return_as
        })
    },

    /**
     * 
     * Endpoint: /get_files/local_file_storage_locations
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-get_fileslocal_file_storage_locations--idget_local_file_storage_locations-
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {local_file_storage_locations_response}
     */
    local_file_storage_locations: async(return_as) => {
        // region: get_files/local_file_storage_locations
        return await this.call({
            endpoint: '/get_files/local_file_storage_locations',
            return_as: return_as
        })
    },

    /**
     * 
     * Endpoint: /get_files/render
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-get_filesrender--idget_files_render-
     * @param {render_options} options
     * @param {'readable_stream'|'raw'} [return_as] Optional; returns a ReadableStream by default; How do you want the result returned?
     * @returns {ReadableStream|Response}
     */
    render: async(options, return_as='readable_stream') => {
        // region: get_files/render
        return await this.call({
            endpoint: '/get_files/render',
            queries: optionsToURLSearchParams(options),
            return_as: return_as
        })
    },


        }
    }

    /**
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#managing-file-relationships
     */
    get manage_file_relationships() {
        return {
            // TODO
        }
    }

    /**
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#managing-services
     */
    get manage_services() {
        return {
            // TODO
        }
    }

    /**
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
     * you will still get the cookies for someoverbooru.net and all its subdomains.
     * 
     * Endpoint: /manage_cookies/get_cookies
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-manage_cookiesget_cookies--idmanage_cookies_get_cookies-
     * @param {string} domain the domain to get cookies for
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {get_cookies_response}
     */
    get_cookies: async(domain, return_as) => {
        // region: manage_cookies/get_cookies
        return await this.call({
            endpoint: '/manage_cookies/get_cookies',
            queries: optionsToURLSearchParams({domain: domain}),
            return_as: return_as
        })
    },

    /**
     * Set some new cookies for Hydrus
     * This makes it easier to 'copy' a login from a web browser or similar
     * to hydrus if hydrus's login system can't handle the site yet
     *
     * /manage_cookies/set_cookies
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-manage_cookiesset_cookies--idmanage_cookies_set_cookies-
     * @param {set_cookies_options} options
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {boolean} Successful if true
     */
    set_cookies: async(options, return_as) => {
        // region: manage_cookies/set_cookies
        return await this.call({
            endpoint: '/manage_cookies/set_cookies',
            json: options,
            return_as: return_as ?? 'success'
        })
    },

        }
    }

    /**
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#managing-http-headers
     */
    get manage_headers() {
        return {
            // TODO
        }
    }

    /**
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#managing-pages
     */
    get manage_pages() {
        return {
    /**
     * Get the page structure of the current UI session.
     * 
     * Endpoint: /manage_pages/get_pages
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-manage_pagesget_pages--idmanage_pages_get_pages-
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {get_pages_response}
     */
    get_pages: async(return_as) => {
        // region: manage_pages/get_pages
        return await this.call({
            endpoint: '/manage_pages/get_pages',
            return_as: return_as
        })
    },

    /**
     * Get information about a specific page.
     * 
     * !!! warning "Under Construction" This is under construction.
     * The current call dumps a ton of info for different downloader pages.
     * Please experiment in IRL situations and give feedback for now!
     * I will flesh out this help with more enumeration info
     * and examples as this gets nailed down.
     * POST commands to alter pages (adding, removing, highlighting),
     * will come later.
     * 
     * Endpoint: /manage_pages/get_page_info
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-manage_pagesget_page_info--idmanage_pages_get_page_info-
     * @param {{page_key: string,  simple?: boolean}} options
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {get_page_info_response}
     */
    get_page_info: async(options, return_as) => {
        // region: manage_pages/get_page_info
        return await this.call({
            endpoint: `/manage_pages/get_page_info`,
            queries: optionsToURLSearchParams(options),
            return_as: return_as
        })
    },

    // TODO: https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-manage_pagesadd_files--idmanage_pages_add_files-

    /**
     * 'Show' a page in the main GUI, making it the current page in view. If it is already the current page, no change is made.
     * 
     * Endpoint: /manage_pages/focus_page
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-manage_pagesfocus_page--idmanage_pages_focus_page-
     * @param {string} page_key
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {boolean} successful if true
     */
    focus_page: async(page_key, return_as) => {
        // region: manage_pages/focus_page
        return await this.call({
            endpoint: `/manage_pages/focus_page`,
            json: {
                page_key: page_key
            },
            return_as: return_as ?? 'success'
        })
    },

    // TODO: https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-manage_pagesrefresh_page--idmanage_pages_refresh_page-

        }
    }

    /**
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#managing-popups
     */
    get manage_popups() {
        return {
            // TODO
        }
    }

    /**
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#managing-the-database
     */
    get manage_database() {
        return {
            // TODO
        }
    }
}
