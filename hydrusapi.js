
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

module.exports = class API{
    // region: API

    /** @type {boolean} */
    debug
    /** @type {string} */
    access_key
    /** @type {string} */
    address

    /** What API version do we support */
    VERSION = 80
    /** What version of Hydrus are we testing against */
    HYDRUS_TARGET_VERSION = 636

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
     * GET Endpoint: /request_new_permissions
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
     * GET Endpoint: /session_key
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
     * GET Endpoint: /verify_access_key
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
     * GET Endpoint: /get_service
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
     * GET Endpoint: /get_services
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
     * POST Endpoint: /add_files/add_file
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
     * POST Endpoint: /add_files/delete_files
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-add_filesdelete_files--idadd_files_delete_files-
     * @param {delete_files_options} options
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
     * POST Endpoint: /add_files/undelete_files
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-add_filesundelete_files--idadd_files_undelete_files-
     * @param {undelete_files_options} options
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
     * POST Endpoint: /add_files/clear_file_deletion_record
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-add_filesclear_file_deletion_record--idadd_files_clear_file_deletion_record-
     * @param {FilesObject} options
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
     * POST Endpoint: /add_files/migrate_files
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-add_filesmigrate_files--idadd_files_migrate_files-
     * @param {migrate_files_options} options
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
     * POST Endpoint: /add_files/archive_files
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
     * POST Endpoint: /add_files/unarchive_files
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-add_filesunarchive_files--idadd_files_unarchive_files-
     * @param {FilesObject} options
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
     * POST Endpoint: /add_files/generate_hashes
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
     * GET Endpoint: /add_urls/get_url_files
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
     * GET Endpoint: /add_urls/get_url_info
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
     * POST Endpoint: /add_urls/add_url
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-add_urlsadd_url--idadd_urls_add_url-
     * @param {add_url_options} options
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
     * POST Endpoint: /add_urls/associate_url
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-add_urlsassociate_url--idadd_urls_associate_url-
     * @param {associate_url_options} options
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
     * GET Endpoint: /add_tags/clean_tags
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
     * GET Endpoint: /add_tags/get_favourite_tags
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
     * GET Endpoint: /add_tags/get_siblings_and_parents
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
     * GET Endpoint: /add_tags/search_tags
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-add_tagssearch_tags--idadd_tags_search_tags-
     * @param {search_tags_options} options
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
     * POST Endpoint: /add_tags/add_tags
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-add_tagsadd_tags--idadd_tags_add_tags-
     * @param {add_tags_options} options
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
     * POST Endpoint: set_favourite_tags
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
     * POST Endpoint: /edit_ratings/set_rating
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
    /**
     * Add or update notes associated with a file.
     * 
     * POST Endpoint: /add_notes/set_notes
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-add_notesset_notes--idadd_notes_set_notes-
     * @param {set_notes_options} options
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {set_notes_response}
     */
    set_notes: async(options, return_as) => {
        // region: add_notes/set_notes
        return await this.call({
            endpoint: '/add_notes/set_notes',
            json: options,
            return_as: return_as
        })
    },

    /**
     * Remove notes associated with a file.
     * 
     * This operation is idempotent.
     * 
     * POST Endpoint: /add_notes/delete_notes
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-add_notesdelete_notes--idadd_notes_delete_notes-
     * @param {delete_notes_options} options
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {boolean} Successful if true
     */
    delete_notes: async(options, return_as) => {
        // region: add_notes/delete_notes
        return await this.call({
            endpoint: '/add_notes/delete_notes',
            json: options,
            return_as: return_as ?? 'success'
        })
    },
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
     * GET Endpoint: /get_files/search_files
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
     * GET Endpoint: /get_files/file_hashes
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
     * GET Endpoint: get_files/file_metadata
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
     * GET Endpoint: /get_files/file
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
     * GET Endpoint: /get_files/thumbnail
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
     * GET Endpoint: /get_files/file_path
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
     * GET Endpoint: /get_files/thumbnail_path
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
     * GET Endpoint: /get_files/local_file_storage_locations
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
     * GET Endpoint: /get_files/render
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
    /**
     * Get the counts of pending content for each upload-capable service. This basically lets you construct the "pending" menu in the main GUI menubar.
     * 
     * GET Endpoint: /manage_services/get_pending_counts
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-manage_servicesget_pending_counts--idmanage_services_get_pending_counts-
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {get_pending_counts_response}
     */
    get_pending_counts: async(return_as) => {
        // region: manage_services/get_pending_counts
        return await this.call({
            endpoint: '/manage_services/get_pending_counts',
            return_as: return_as
        })
    },

    /**
     * Start the job to upload a service's pending content.
     * 
     * This starts the upload popup,
     * just like if you click 'commit' in the menu.
     * This upload could ultimately take one second or several minutes
     * to finish, but the response will come back immediately.
     * 
     * If the job is already running, this will return 409.
     * If it cannot start because of a difficult problem,
     * like all repositories being paused or the service account object
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
     * !!! Due to the nature of this endpoint it tested
     * 
     * POST Endpoint: /manage_services/commit_pending
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-manage_servicescommit_pending--idmanage_services_commit_pending-
     * @param {string} service_key The service to commit
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {boolean} Successful if true
     */
    commit_pending: async(service_key, return_as) => {
        // region: manage_services/commit_pending
        return await this.call({
            endpoint: '/manage_services/commit_pending',
            json: {service_key: service_key},
            return_as: return_as ?? 'success'
        })
    },

    /**
     * Forget all pending content for a service.
     * 
     * This clears all pending content for a service, just like if you click 'forget' in the menu.
     * 
     * !!! Due to the nature of this endpoint it tested
     * 
     * POST Endpoint: /manage_services/forget_pending
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-manage_servicesforget_pending--idmanage_services_forget_pending-
     * @param {string} service_key The service to forget for
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {boolean} Successful if true
     */
    forget_pending: async(service_key, return_as) => {
        // region: manage_services/forget_pending
        return await this.call({
            endpoint: '/manage_services/forget_pending',
            json: {service_key: service_key},
            return_as: return_as ?? 'success'
        })
    },

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
     * GET Endpoint: /manage_cookies/get_cookies
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
     * POST Endpoint: /manage_cookies/set_cookies
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
     * GET Endpoint: /manage_pages/get_pages
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
     * GET Endpoint: /manage_pages/get_page_info
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

    /**
     * Add files to a page.
     * 
     * POST Endpoint: /manage_pages/add_files
     * 
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#post-manage_pagesadd_files--idmanage_pages_add_files-
     * @param {add_files_options} options
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {boolean} Successful if true
     */
    add_files: async(options, return_as) => {
        // region: manage_pages/add_files
        return await this.call({
            endpoint: '/manage_pages/add_files',
            json: options,
            return_as: return_as ?? 'success'
        })
    },

    /**
     * 'Show' a page in the main GUI, making it the current page in view. If it is already the current page, no change is made.
     * 
     * POST Endpoint: /manage_pages/focus_page
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
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {boolean} Successful if true
     */
    refresh_page: async(page_key, return_as) => {
        // region: manage_pages/refresh_page
        return await this.call({
            endpoint: '/manage_pages/refresh_page',
            json: {page_key: page_key},
            return_as: return_as ?? 'success'
        })
    },

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
    /**
     * Force the database to write all pending changes to disk immediately.
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
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {boolean} Successful if true
     */
    force_commit: async(return_as) => {
        // region: manage_database/force_commit
        return await this.call({
            endpoint: '/manage_database/force_commit',
            method: 'POST',
            return_as: return_as ?? 'success'
        })
    },

    /**
     * Pause the client's database activity and disconnect the current connection.
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
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {boolean} Successful if true
     */
    lock_on: async(return_as) => {
        // region: manage_database/lock_on
        return await this.call({
            endpoint: '/manage_database/lock_on',
            method: 'POST',
            return_as: return_as ?? 'success'
        })
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
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {boolean} Successful if true
     */
    lock_off: async(return_as) => {
        // region: manage_database/lock_off
        return await this.call({
            endpoint: '/manage_database/lock_off',
            method: 'POST',
            return_as: return_as ?? 'success'
        })
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
     * @param {mr_bones_options} [options] Optional
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {mr_bones_response}
     */
    mr_bones: async(options = {}, return_as) => {
        // region: manage_database/mr_bones
        return await this.call({
            endpoint: '/manage_database/mr_bones',
            queries: optionsToURLSearchParams(options),
            return_as: return_as
        })
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
     * @param {CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {get_client_options_response}
     */
    get_client_options: async(return_as) => {
        const ver = await this.api_version()
        if (ver.hydrus_version !== this.HYDRUS_TARGET_VERSION) {
            throw new Error(`This endpoint is currently experimental. Please use a version of HydrusAPI that matches '${this.VERSION}.${this.HYDRUS_TARGET_VERSION}.*'!`)
        }
        // region: manage_database/get_client_options
        return await this.call({
            endpoint: '/manage_database/get_client_options',
            return_as: return_as
        })
    },

        }
    }
}
