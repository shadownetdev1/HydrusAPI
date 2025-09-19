import type HydrusAPI from "./types.d.ts";
export = API;
declare class API {
    /**
     * We highly suggest wrapping this class' methods
     * in functions over using them directly.
     * @param {HydrusAPI.APIOptions} [options={}] Extra options
     */
    constructor(options?: HydrusAPI.APIOptions);
    /** @type {boolean} */
    debug: boolean;
    /** @type {string} */
    access_key: string;
    /** @type {string} */
    address: string;
    /** What API version do we support */
    VERSION: number;
    /** What version of Hydrus are we testing against */
    HYDRUS_TARGET_VERSION: number;
    /**
     * These are the permissions that the client can have
     * @type {HydrusAPI.BASIC_PERMS}
     */
    BASIC_PERM: HydrusAPI.BASIC_PERMS;
    /** @type {HydrusAPI.CANVAS_TYPE} */
    CANVAS_TYPE: HydrusAPI.CANVAS_TYPE;
    /** @type {HydrusAPI.TIMESTAMP_TYPE} */
    TIMESTAMP_TYPE: HydrusAPI.TIMESTAMP_TYPE;
    /** @type {HydrusAPI.SERVICE_TYPE} */
    SERVICE_TYPE: HydrusAPI.SERVICE_TYPE;
    /** @type {HydrusAPI.POTENTIALS_SEARCH_TYPE} */
    POTENTIALS_SEARCH_TYPE: HydrusAPI.POTENTIALS_SEARCH_TYPE;
    /** @type {HydrusAPI.PIXEL_DUPLICATES} */
    PIXEL_DUPLICATES: HydrusAPI.PIXEL_DUPLICATES;
    /**
     * @type {number|undefined}
     * Setting this to a HydrusAPI version will allow usage
     * when the HydrusAPI API version and Hydrus API version
     * mismatches.
     *
     * !!! This use case will not be supported
     */
    api_version_override: number | undefined;
    _first_successful_versioning: boolean;
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
    call(o: HydrusAPI.CallOptions): Promise<Object | boolean | number | ReadableStream>;
    /**
     * Gets the current API version.
     *
     * GET Endpoint: /api_version
     *
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-api_version--idapi_version-
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<HydrusAPI.api_version_response>}
     */
    api_version(return_as?: HydrusAPI.CallOptions["return_as"]): Promise<HydrusAPI.api_version_response>;
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
    request_new_permissions(options: HydrusAPI.request_new_permissions_options, return_as?: HydrusAPI.CallOptions["return_as"]): Promise<HydrusAPI.request_new_permissions_response>;
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
    session_key(return_as?: HydrusAPI.CallOptions["return_as"]): Promise<HydrusAPI.session_key_response>;
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
    verify_access_key(return_as?: HydrusAPI.CallOptions["return_as"]): Promise<HydrusAPI.verify_access_key_response>;
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
    get_service(service: {
        service_name?: string;
        service_key?: string;
    }, return_as?: HydrusAPI.CallOptions["return_as"]): Promise<HydrusAPI.get_service_response>;
    /**
     * Returns info for all services
     *
     * GET Endpoint: /get_services
     *
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-get_services--idget_services-
     * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
     * @returns {Promise<HydrusAPI.get_services_response>}
     */
    get_services(return_as?: HydrusAPI.CallOptions["return_as"]): Promise<HydrusAPI.get_services_response>;
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
    get add_files(): {
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
        add_file: (options: {
            bytes: any;
        } | {
            path: string;
            delete_after_successful_import?: boolean;
        }, return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<HydrusAPI.add_file_response>;
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
        delete_files: (options: HydrusAPI.delete_files_options, return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<boolean>;
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
        undelete_files: (options: HydrusAPI.undelete_files_options, return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<boolean>;
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
        clear_file_deletion_record: (options: HydrusAPI.FilesObject, return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<boolean>;
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
        migrate_files: (options: HydrusAPI.migrate_files_options, return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<boolean>;
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
        archive_files: (options: HydrusAPI.FilesObject, return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<boolean>;
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
        unarchive_files: (options: HydrusAPI.FilesObject, return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<boolean>;
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
        generate_hashes: (options: HydrusAPI.generate_hashes_options, return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<HydrusAPI.generate_hashes_response>;
    };
    /**
     * Features:
     * * Get files associated with a url
     * * Associate and dissociate files with a url
     * * Get info about a url
     * * Import a url
     *
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#importing-and-editing-urls
     */
    get add_urls(): {
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
        get_url_files: (options: HydrusAPI.get_url_files_options, return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<HydrusAPI.get_url_files_response>;
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
        get_url_info: (url: string, return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<HydrusAPI.get_url_info_response>;
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
        add_url: (options: HydrusAPI.add_url_options, return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<HydrusAPI.add_url_response>;
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
        associate_url: (options: HydrusAPI.associate_url_options, return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<boolean>;
    };
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
    get add_tags(): {
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
        clean_tags: (tags: string[], return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<HydrusAPI.clean_tags_response>;
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
        get_favourite_tags: (return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<HydrusAPI.get_favourite_tags_response>;
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
        get_siblings_and_parents: (tags: string[], return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<HydrusAPI.get_siblings_and_parents_response>;
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
        search_tags: (options: HydrusAPI.search_tags_options, return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<HydrusAPI.search_tags_response>;
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
        add_tags: (options: HydrusAPI.add_tags_options, return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<boolean>;
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
        set_favourite_tags: (options: HydrusAPI.set_favourite_tags_options, return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<HydrusAPI.get_favourite_tags_response>;
    };
    /**
     * Add or remove ratings associated with a file.
     *
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#editing-file-ratings
     */
    get edit_ratings(): {
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
        set_rating: (options: HydrusAPI.set_rating_options, return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<boolean>;
    };
    /**
     * Set or modify viewtime
     *
     * Set modified at, imported at,
     * deleted at, archived at, last viewed,
     * and original import times
     *
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#editing-file-times
     */
    get edit_times(): {
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
        increment_file_viewtime: (options: HydrusAPI.increment_and_set_file_viewtime_options, return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<boolean>;
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
        set_file_viewtime: (options: HydrusAPI.increment_and_set_file_viewtime_options, return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<boolean>;
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
        set_time: (options: HydrusAPI.set_time_options, return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<boolean>;
    };
    /**
     * Add, modify, and remove notes from files
     *
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#editing-file-notes
     */
    get add_notes(): {
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
        set_notes: (options: HydrusAPI.set_notes_options, return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<HydrusAPI.set_notes_response>;
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
        delete_notes: (options: HydrusAPI.delete_notes_options, return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<boolean>;
    };
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
    get get_files(): {
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
        search_files: (options: HydrusAPI.search_files_options, return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<HydrusAPI.search_files_response>;
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
        file_hashes: (options: HydrusAPI.file_hashes_options, return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<HydrusAPI.file_hashes_response>;
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
        file_metadata: (options: HydrusAPI.get_file_metadata_options, return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<HydrusAPI.get_file_metadata_response>;
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
        file: (options: HydrusAPI.file_options, return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<ReadableStream<Uint8Array<ArrayBufferLike>> | Object | number>;
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
        thumbnail: (options: HydrusAPI.thumbnail_options, return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<ReadableStream<Uint8Array<ArrayBufferLike>> | Object | number>;
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
        file_path: (options: HydrusAPI.file_path_options, return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<HydrusAPI.file_path_response>;
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
        thumbnail_path: (options: HydrusAPI.thumbnail_path_options, return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<HydrusAPI.thumbnail_path_response>;
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
        local_file_storage_locations: (return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<HydrusAPI.local_file_storage_locations_response>;
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
        render: (options: HydrusAPI.render_options, return_as?: "readable_stream" | "raw") => Promise<ReadableStream | Response>;
    };
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
    get manage_file_relationships(): {
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
        get_file_relationships: (options: HydrusAPI.get_file_relationships_options, return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<HydrusAPI.get_file_relationships_response>;
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
        get_potentials_count: (options?: HydrusAPI.get_potentials_count_options, return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<HydrusAPI.get_potentials_count_response>;
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
        get_potential_pairs: (options?: HydrusAPI.get_potential_pairs_options, return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<HydrusAPI.get_potential_pairs_response>;
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
        get_random_potentials: (options?: HydrusAPI.get_random_potentials_options, return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<HydrusAPI.get_random_potentials_response>;
    };
    /**
     * Features:
     * * Get the counts of pending content for each
     * upload-capable service
     * * Commit or forget pending content
     *
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#managing-services
     */
    get manage_services(): {
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
        get_pending_counts: (return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<HydrusAPI.get_pending_counts_response>;
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
        commit_pending: (service_key: string, return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<boolean>;
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
        forget_pending: (service_key: string, return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<boolean>;
    };
    /**
     * Get and modify cookies for a given domain (website)
     *
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#managing-cookies
     */
    get manage_cookies(): {
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
        get_cookies: (domain: string, return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<HydrusAPI.get_cookies_response>;
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
        set_cookies: (options: HydrusAPI.set_cookies_options, return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<boolean>;
    };
    /**
     * Get and modify HTTP Headers for a given domain (website)
     *
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#managing-http-headers
     */
    get manage_headers(): {};
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
    get manage_pages(): {
        /**
         * Get the page structure of the current UI session.
         *
         * GET Endpoint: /manage_pages/get_pages
         *
         * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-manage_pagesget_pages--idmanage_pages_get_pages-
         * @param {HydrusAPI.CallOptions['return_as']} [return_as] Optional; Sane default; How do you want the result returned?
         * @returns {Promise<HydrusAPI.get_pages_response>}
         */
        get_pages: (return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<HydrusAPI.get_pages_response>;
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
        get_page_info: (options: {
            page_key: string;
            simple?: boolean;
        }, return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<HydrusAPI.get_page_info_response>;
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
        add_files: (options: HydrusAPI.add_files_options, return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<boolean>;
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
        focus_page: (page_key: string, return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<boolean>;
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
        refresh_page: (page_key: string, return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<boolean>;
    };
    /**
     * Create, trigger, and remove Hydrus popups
     *
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#managing-popups
     */
    get manage_popups(): {};
    /**
     * Features:
     * * Lock and unlock the database
     * * Force a commit
     * * Get statistics from Mr. Bones
     * * Get all of Hydrus Network's client settings
     *
     * https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#managing-the-database
     */
    get manage_database(): {
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
        force_commit: (return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<boolean>;
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
        lock_on: (return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<boolean>;
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
        lock_off: (return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<boolean>;
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
        mr_bones: (options?: HydrusAPI.mr_bones_options, return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<HydrusAPI.mr_bones_response>;
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
        get_client_options: (return_as?: HydrusAPI.CallOptions["return_as"]) => Promise<HydrusAPI.get_client_options_response>;
    };
    /**
     * These are functions that add useful features that don't exist
     * on any endpoint. This allows us to add functionality while
     * keeping the usage for the endpoint methods close to the same
     * as the raw api.
     */
    get tools(): {
        /**
         * calls the `api.get_services()` endpoint,
         * checks each entry for ones with a matching
         * SERVICE_TYPE, and then returns a new array
         * with the results
         *
         * @param {HydrusAPI.SERVICE_TYPE_VALUE} [service_type=11] Optional; defaults to `all known files`; The service type to get
         * @returns {Promise<HydrusAPI.ServiceObjectWithKey[]>}
         */
        get_services_of_type: (service_type?: HydrusAPI.SERVICE_TYPE_VALUE) => Promise<HydrusAPI.ServiceObjectWithKey[]>;
        /**
         * calls the `api.get_services()` endpoint,
         * checks each entry for ones with a matching
         * name, and then returns a new array
         * with the results
         *
         * @param {string} name The name of the service to get
         * @returns {Promise<HydrusAPI.ServiceObjectWithKey[]>}
         */
        get_services_of_name: (name: string) => Promise<HydrusAPI.ServiceObjectWithKey[]>;
    };
}
