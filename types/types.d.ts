export = HydrusAPI;
declare namespace HydrusAPI {
    type EnumOf<T> = T[keyof T]

    type ValueOf<T> = T[keyof T]

    /** These are the permissions that the client can have */
    interface BASIC_PERMS {
        // TODO: permission documentation. Including what endpoints require the given permission. Also update the endpoint methods to mention the permission they need
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
        SEE_LOCAL_PATHS: 13
    }

    type BASIC_PERMS_VALUE = ValueOf<BASIC_PERMS>

    interface CANVAS_TYPE {
        /** The normal viewer in hydrus that is its own window */
        MEDIA_VIEWER: 0,
        /** The box in the bottom-left corner of the Main GUI window */
        PREVIEW_VIEWER: 1,
        /** Something to represent your own access, if you wish */
        API_VIEWER: 4,
    }

    type CANVAS_TYPE_VALUE = ValueOf<CANVAS_TYPE>

    interface TIMESTAMP_TYPE {
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
    }

    type TIMESTAMP_TYPE_VALUE = ValueOf<TIMESTAMP_TYPE>

    /** Any properties set here will be passed to the fetch call (with the exception of some predefined properties) */
    interface CallOptions {
        [key: string]: any
        /** The API endpoint to access */
        endpoint: string
        /** Optional; headers to use */
        headers?: Headers
        /** Optional; Object to send as JSON */
        json?: Object
        /** Optional; a search query to send */
        queries?: URLSearchParams
        /** Optional; Will default to `GET` if json is undefined, body is undefined, or queries is defined */
        method?: 'GET'|'POST'
        /** Optional; Will default to `json` if undefined */
        return_as?: 'success'|'status'|'json'|'raw'|'readable_stream'
    }

    interface SERVICE_TYPE {
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
    }

    type SERVICE_TYPE_VALUE = ValueOf<SERVICE_TYPE>

    /**
     * * 0 - a file matches search 1
     * * 1 - both files match search 1
     * * 2 - one file matches search 1, the other 2
     */
    interface POTENTIALS_SEARCH_TYPE {
        /** 0 - one file matches search 1 */
        A_FILE_MATCHES_SEARCH_ONE: 0,
        /** 1 - both files match search 1 */
        BOTH_FILES_MATCH_SEARCH_ONE: 1,
        /** 2 - one file matches search 1, the other 2 */
        EACH_FILE_MATCHES_A_SEPARATE_SEARCH: 2,
    }

    type POTENTIALS_SEARCH_TYPE_VALUE = ValueOf<POTENTIALS_SEARCH_TYPE>

    /**
     * * 0 - must be pixel duplicates
     * * 1 - can be pixel duplicates
     * * 2 - must not be pixel duplicates
     */
    interface PIXEL_DUPLICATES {
        /** 0 - must be pixel duplicates */
        MUST_BE_DUPLICATES: 0,
        /** 1 - can be pixel duplicates */
        CAN_BE_DUPLICATES: 1,
        /** 2 - must not be pixel duplicates */
        MUST_NOT_BE_DUPLICATES: 2,
    }

    type PIXEL_DUPLICATES_VALUE = ValueOf<PIXEL_DUPLICATES>

    interface DUP_PAIR_SORT_TYPE {
        FILESIZE_OF_LARGER_FILE: 0
        SIMILARITY: 1
        FILESIZE_OF_SMALLER_FILE: 2
        RANDOM: 4
    }

    type DUP_PAIR_SORT_TYPE_VALUE = ValueOf<DUP_PAIR_SORT_TYPE>

    /**
     * *   1 - File was successfully imported
     * *   2 - File already in database
     * *   3 - File previously deleted
     * *   4 - File failed to import
     * *   7 - File vetoed
     * 
     * A file 'veto' is caused by
     * the file import options (which in this case is the 'quiet' set under the client's _options->importing_)
     * stopping the file due to its resolution or minimum file size rules, etc...
     */
    type ADD_FILE_STATUSES = 1|2|3|4|7

    /**
     * name (ascending sort/descending sort)
     * * 0 - file size (smallest first/largest first)
     * * 1 - duration (shortest first/longest first)
     * * 2 - import time (oldest first/newest first)
     * * 3 - filetype (N/A)
     * * 4 - random (N/A)
     * * 5 - width (slimmest first/widest first)
     * * 6 - height (shortest first/tallest first)
     * * 7 - ratio (tallest first/widest first)
     * * 8 - number of pixels (ascending/descending)
     * * 9 - number of tags (on the current tag domain) (ascending/descending)
     * * 10 - number of media views (ascending/descending)
     * * 11 - total media viewtime (ascending/descending)
     * * 12 - approximate bitrate (smallest first/largest first)
     * * 13 - has audio (audio first/silent first)
     * * 14 - modified time (oldest first/newest first)
     * * 15 - framerate (slowest first/fastest first)
     * * 16 - number of frames (smallest first/largest first)
     * * 18 - last viewed time (oldest first/newest first)
     * * 19 - archive timestamp (oldest first/newest first)
     * * 20 - hash hex (lexicographic/reverse lexicographic)
     * * 21 - pixel hash hex (lexicographic/reverse lexicographic)
     * * 22 - blurhash (lexicographic/reverse lexicographic)
     * * 23 - average colour - lightness (darkest first/lightest first)
     * * 24 - average colour - chromatic magnitude (greys first/colours first)
     * * 25 - average colour - green/red axis (greens first/reds first)
     * * 26 - average colour - blue/yellow axis (blues first/yellows first)
     * * 27 - average colour - hue (rainbow - red first/rainbow - purple first)
     */
    type FILE_SORT_TYPE = 0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|18|19|20|21|22|23|24|25|26|27

    type RATING_TYPES = null|true|false|number

    /**
     * * 1 - Gallery downloader
     * * 2 - Simple downloader
     * * 3 - Hard drive import
     * * 5 - Petitions (used by repository janitors)
     * * 6 - File search
     * * 7 - URL downloader
     * * 8 - Duplicates
     * * 9 - Thread watcher
     * * 10 - Page of pages
     */
    type PAGE_TYPE = 1|2|3|5|6|7|8|9|10

    /**
     * * 0 - ready
     * * 1 - initialising
     * * 2 - searching/loading
     * * 3 - search cancelled
     * 
     * Most pages will be 0, normal/ready, at all times.
     * Large pages will start in an 'initialising' state for a few seconds,
     * which means their session-saved thumbnails aren't loaded yet.
     * Search pages will enter 'searching' after a refresh or search change
     * and will either return to 'ready' when the search is complete,
     * or fall to 'search cancelled' if the search was interrupted
     * (usually this means the user clicked
     * the 'stop' button that appears after some time).
     */
    type PAGE_STATE = 0|1|2|3

    interface APIOptions {
        /** 
         * If true then we will print out debugging messages;
         * Defaults to false
         */
        debug?: boolean
        /** The Client API or session key from Hydrus to use */
        access_key?: string
        /**
         * The address to attempt to connect to Hydrus on;
         * Defaults to 'http://127.0.0.1:45869'
         */
        address?: string
        /**
         * Setting this to a HydrusAPI version will allow usage
         * when the HydrusAPI API version and Hydrus API version
         * mismatches.
         * 
         * !!! This use case will not be supported
         */
        api_version_override?: number
    }

    interface api_version_response {
        /** The Hydrus API version */
        version: number
        /** The Hydrus Network's client version */
        hydrus_version: number
    }

    /** name must be defined; permissions or permits_everything must be defined */
    interface request_new_permissions_options {
        /** The name that will be displayed in Hydrus for this client */
        name: string
        /** A list of basic permissions or the string 'all'; If 'all' then all basic permissions will be added, though you probably just want to use permits_everything instead */
        permissions?: BASIC_PERMS_VALUE[]|"all"
        /** Defaults to false; if true the client gets all permissions both now and in the future */
        permits_everything?: boolean
    }

    interface request_new_permissions_response extends api_version_response {
        error?: string
        exception_type?: string
        status_code: number
        /** A 64 character hex based API key */
        access_key?: string
    }

    interface session_key_response extends api_version_response {
        /**  A 64 character hex string */
        session_key: string
    }

    interface verify_access_key_response extends api_version_response {
        name?: string
        permits_everything?: boolean
        basic_permissions?: BASIC_PERMS[]
        human_description?: string
        error?: string
        /**
         * * BadRequestException: Likely a malformed access key. See contents of error for details
         * * MissingCredentialsException: You didn't provide an access key
         * * InsufficientCredentialsException: Your access key doesn't exist in Hydrus
         * TODO: there should be one more exception type for expired session keys. It should have status code 419. Check using session key '6ccad626632e5e7433482e5a71f22498ab9dec0faadb1e9fa8079ac64b735654' on 08/04 at 1:40 PM or later
         */
        exception_type?: 'BadRequestException' | 'MissingCredentialsException' | 'InsufficientCredentialsException'
        status_code?:    400                   | 401                           | 403
    }

    interface ServiceObject {
        name: string
        type: SERVICE_TYPE_VALUE
        type_pretty: string
    }

    interface ServiceObjectWithKey extends ServiceObject {
        service_key: string
    }

    interface get_service_response extends api_version_response {
        service: ServiceObjectWithKey
    }

    interface get_services_response extends api_version_response {
        /**
         * key is a service key;
         * value is a 'ServiceObject' without 'service_key'
         * 
         * You may find
         * api.tools.get_services_of_type()
         * and api.tools.get_services_of_name() helpful
         */
        services: {[key: string]: ServiceObject}
    }

    interface add_file_response extends api_version_response {
        status: ADD_FILE_STATUSES
        /** The file's SHA256 hash as computed by Hydrus */
        hash: string
        /**
         * A human readable string that may include more insight into
         * a given status
         */
        note: string
    }

    interface delete_files_options extends FilesObject, FileDomainObject {
        /** An optional reason for the file deletion */
        reason?: string
    }

    interface undelete_files_options extends FilesObject {
        /** A local file domain; Defaults to 'all my files */
        file_domain?: string
    }

    /**
     * One of file_service_key or file_service_keys must be defined.
     * One of file_id, hash, or hashes must be defined.
     */
    interface migrate_files_options extends FilesObject {
        /** The id of the file service to add to */
        file_service_key?: string
        /** The ids of the file services to add to */
        file_service_keys?: string[]
    }

    /** bytes or path must be provided. If path is provided it should be reachable by Hydrus */
    interface generate_hashes_options {
        bytes?: any
        path?: string
    }

    interface generate_hashes_response extends api_version_response {
        /** The file's SHA256 hash as computed by Hydrus */
        hash: string
        /** 
         * An array of one or more perceptual hashes for the file.
         * Can be undefined if Hydrus cannot create perceptual hashes
         * for the given file// TODO: validate the undefined statement
         */
        perceptual_hashes?: string[]
        /** 
         * A SHA256 hash of the pixel data for the given file.
         * Can be undefined if Hydrus cannot create pixel hashes
         * for the given file // TODO: validate the undefined statement
         */
        pixel_hash?: string
    }

    interface URLFileStatus {
        /**
         * status mas the same mapping as for /add_files/add_file,
         * but the possible results are different: // TODO: fix typo here and in https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-add_urlsget_url_files--idadd_urls_get_url_files-
         * * 0 - File not in database, ready for import (you will only see this very rarely--usually in this case you will just get no matches)
         * * 2 - File already in database
         * * 3 - File previously deleted
         */
        status: 0|1|2
        /** The SHA256 hash of the file */
        hash: string
        /** 
         * Human readable info that would normally be displayed
         * in the import workflow.
         */
        note: string
    }

    interface get_url_files_options {
        url: string,
        /** Optional; Defaults to false; If true Hydrus checks to make sure each file exists on the system before returning it */
        doublecheck_file_system?: boolean
    }

    interface get_url_files_response extends api_version_response {
        /** The url as it has been or would be stored by Hydrus */
        normalised_url: string
        url_file_statuses: URLFileStatus[]
    }

    interface URLInfo {
        /**
         * The `request_url` is either the lighter 'for server' normalised URL,
         * which may include ephemeral token parameters, or,
         * as in the case here, the fully converted API/redirect URL.
         * (When hydrus is asked to check an imageboard thread,
         * it usually doesn't hit the HTML, but the JSON API.)
         */
        request_url: string
        /**
         * The `normalised_url` is the fully normalised URL--what
         * is used for comparison and saving to disk.
         */
        normalised_url: string
        /**
         * The url types are currently:
         * *   0 - Post URL
         * *   2 - File URL
         * *   3 - Gallery URL
         * *   4 - Watchable URL
         * *   5 - Unknown URL (i.e. no matching URL Class)
         * 'Unknown' URLs are treated in the client as direct File URLs.
         * Even though the 'File URL' type is available,
         * most file urls do not have a URL Class,
         * so they will appear as Unknown.
         * Adding them to the client will pass them to the URL Downloader
         * as a raw file for download and import.
         */
        url_type: 0|1|2|3|4|5
        url_type_string: "post url"|"file url"|"gallery url"|"watchable url"|"unknown url" // TODO: validate
        match_name: string
        can_parse: boolean
        /** Undefined if can_parse is true; The reason Hydrus cannot parse this url */
        cannot_parse_reason?: string
    }

    interface get_url_info_response extends api_version_response, URLInfo {}

    interface add_url_options {
        /** The url to add */
        url: string,
        /** Optional page identifier for the page to receive the url */
        destination_page_key?: string
        /** Optional page name to receive the url */
        destination_page_name?: string
        /** Optional, sets where to import the file */
        file_domain?: string
        /** Optional, defaulting to false, controls whether the UI will change pages on add */
        show_destination_page?: boolean
        /**
         * Optional, selective, tags to give to any files imported from this url.
         * keys are service keys and values ar an array of tags.
         */
        service_keys_to_additional_tags?: {[key: string]: string[]}
        /** Optional tags to be filtered by any tag import options that applies to the URL */
        filterable_tags?: string[]
    }

    interface add_url_response extends api_version_response {
        human_result_text: string
        normalised_url: string
    }

    interface associate_url_options extends FilesObject {
        /** A URL to add to the file(s) */
        url_to_add?: string
        /** A list of URLs to add to the file(s) */
        urls_to_add?: string[]
        /** A URL to remove from the file(s) */
        url_to_delete?: string
        /** A list of URLs to remove from the file(s) */
        urls_to_delete?: string[]
        /** Optional; Defaults to true */
        normalise_urls?: boolean
    }

    interface clean_tags_response extends api_version_response {
        tags: string[]
    }

    interface get_favourite_tags_response extends api_version_response {
        favourite_tags: string[]
    }

    interface SiblingsAndParentsServiceObject {
        /** `ideal_tag` is how the tag appears in normal display to the user. */
        ideal_tag: string
        /**
         * `siblings` is every tag that will show as the `ideal_tag`,
         * including the `ideal_tag` itself.
         */
        siblings: string[]
        /**
         * `descendants` is every child
         * (and recursive grandchild, great-grandchild...)
         * that implies the `ideal_tag`.
         */
        descendants: string[]
        /**
         * `ancestors` is every parent
         * (and recursive grandparent, great-grandparent...)
         * that our tag implies.
         */
        ancestors: string[]
    }

    /** Each key is a service key */
    type SiblingsAndParentsTagObject = {[key: string]: SiblingsAndParentsServiceObject}

    interface get_siblings_and_parents_response extends api_version_response {
        services: ServiceObject // TODO: this may be a array of ServiceObjects. Test and find out
        /**
         * Each key is a tag
         * 
         * This data is essentially how mappings in the
         * `storage` `tag_display_type` become `display`.
         * 
         * The hex keys are the service keys, which you will have seen elsewhere,
         * like `/get_files/file_metadata`.
         * Note that there is no concept of 'all known tags' here.
         * If a tag is in 'my tags', it follows the rules of 'my tags',
         * and then all the services' display tags are merged into
         * the 'all known tags' pool for user display.
         * 
         * !!! warning "Tag Relationships Apply In A Complicated Way"
         * There are two caveats to this data:
         * 
         * 1. The siblings and parents here are not just what is in
         * `tags->manage tag siblings/parents`,
         * they are the final computed combination of rules as set in 
         * `tags->manage where tag siblings and parents apply`.
         * The data given here is not guaranteed to be useful for
         * editing siblings and parents on a particular service.
         * That data, which is currently pair-based,
         * will appear in a different API request in future.
         * 
         * 2. This is what is `actually processed, right now,`
         * for those user preferences,
         * as per `tags->sibling/parent sync->review current sync`.
         * It reflects what they currently see in the UI.
         * If the user still has pending sync work,
         * this computation will change in future,
         * perhaps radically
         * (e.g. if they just removed the whole PTR ruleset two minutes ago),
         * as will the rest of the "display" domain.
         * The results may be funky while a user is in the midst of syncing,
         * but these values are fine for most purposes.
         * In the short term, you can broadly assume that the rules
         * here very closely align with what you see in
         * a recent file metadata call that pulls storage vs display mappings.
         * If you want to decorate an autocomplete results call
         * with sibling or parent data, this data is good for that.
         * 
         * * `ideal_tag` is how the tag appears in normal display to the user.
         * * `siblings` is every tag that will show as the `ideal_tag`, including the `ideal_tag` itself.
         * * `descendants` is every child (and recursive grandchild, great-grandchild...) that implies the `ideal_tag`.
         * * `ancestors` is every parent (and recursive grandparent, great-grandparent...) that our tag implies.
         * 
         * Every descendant and ancestor is an `ideal_tag`
         * itself that may have its own siblings.
         * 
         * Most situations are simple,
         * but remember that siblings and parents in hydrus can get complex.
         * If you want to display this data,
         * I recommend you plan to support simple service-specific workflows,
         * and add hooks to recognize conflicts and other difficulty and,
         * when that happens, abandon ship (send the user back to Hydrus proper).
         * Also, if you show summaries of the data anywhere,
         * make sure you add a 'and 22 more...' overflow mechanism to your menus,
         * since if you hit up 'azur lane' or 'pokemon',
         * you are going to get hundreds of children.
         * 
         * I generally warn you off computing sibling and parent mappings
         * or counts yourself.
         * The data from this request is best used for sibling and parent decorators
         * on individual tags in a 'manage tags' presentation.
         * The code that actually computes what siblings and parents
         * look like in the 'display' context can be a pain at times,
         * and I've already done it.
         * Just run /search_tags or /file_metadata again after any changes you make
         * and you'll get updated values.
         */
        tags: {[key: string]: SiblingsAndParentsTagObject}
    }

    interface search_tags_options {
        /** The query to search for */
        search: string
        /** Optional; Defaults to "all my files" */
        file_domain?: string
        /** Optional */
        tag_service_key?: string
        /** Optional; Defaults to "storage" */
        tag_display_type?: "storage" | "display"
    }

    interface search_tags_response extends api_version_response {
        tags: {value: string, count:number}[]
    }

    /** One of file_id, file_ids, hash, or hashes must be defined */
    interface FilesObject {
        /** The id of the file to be acted upon */
        file_id?: number
        /** The ids of the files to be acted upon */
        file_ids?: number[]
        /** The SHA256 hash of the file to be acted upon */
        hash?: string
        /** The SHA256 hashes of the files to be acted upon */
        hashes?: string[]
    }

    /** either service_keys_to_tags or service_keys_to_actions_to_tags must be defined */
    interface add_tags_options extends FilesObject{
        /**
         * An object where the keys are service keys
         * and the values are arrays of tags to add
         */
        service_keys_to_tags?: {[key: string]: string[]}
        /** 
         * An object of objects where the first objects keys
         * are service keys and its values are objects.
         * The second objects keys are actions (defined below)
         * and its values are arrays of tags to act on
         * 
         * Permitted Actions:
         * * '0' - Add to a local tag service.
         * * '1' - Delete from a local tag service.
         * * '2' - Pend to a tag repository.
         * * '3' - Rescind a pend from a tag repository.
         * * '4' - Petition from a tag repository. (This is special)
         * * '5' - Rescind a petition from a tag repository.
         */
        service_keys_to_actions_to_tags?: {[key: string]: {[key: string]: string[]}}
        /** Optional; Defaults to true */
        override_previously_deleted_mappings?: boolean
        /** Optional; Defaults to true */
        create_new_deleted_mappings?: boolean

    }

    interface set_favourite_tags_options {
        /** (selective A, optional, a list of tags) If set then the existing favourite tags will be overwritten with these */
        set?: string[]
        /** (selective B, optional, a list of tags) A list of tags to add to the existing list */
        add?: string[]
        /** (selective B, optional, a list of tags) A list of tags to remove from the existing list */
        remove?: string[]
    }

    interface set_rating_options extends FilesObject {
        /** hexadecimal, the rating service you want to edit */
        rating_service_key: string
        /**
         * mixed datatype, the rating value you want to set
         * * Like/Dislike Ratings: Send true for 'like', false for 'dislike', or null for 'unset'.
         * * Numerical Ratings: Send an int for the number of stars to set, or null for 'unset'.
         * * Inc/Dec Ratings: Send an int for the number to set. 0 is your minimum.
         *
         * As with GET /get_files/file_metadata, check The Services Object
         * for the min/max stars on a numerical rating service.
         */
        rating: RATING_TYPES
    }

    /** timestamp or timestamp_ms must be defined */
    interface increment_and_set_file_viewtime_options extends FilesObject {
        canvas_type: CANVAS_TYPE_VALUE
        /** Optional; Float or int of the "last viewed time" in seconds */
        timestamp?: number
        /** Optional; Int of the "last viewed time" in milliseconds */
        timestamp_ms?: number
        /** Optional; How many views you are adding, defaults to 1 */
        views?: number
        /** Optional; Float; How long the user viewed the file for */
        viewtime?: number
    }

    /** timestamp or timestamp_ms must be defined */
    interface set_time_options extends FilesObject {
        /**
         * Optional; Float or int of the time in seconds,
         * or `null` for deleting web domain times
         */
        timestamp?: number | null
        /**
         * Optional; Int of the time in milliseconds,
         * or `null` for deleting web domain times
         */
        timestamp_ms?: number | null
        /** The type of timestamp you are editing */
        timestamp_type: TIMESTAMP_TYPE_VALUE
        /**
         * Dependant; 
         * If you set `timestamp_type` to
         * `TIMESTAMP_TYPE.IMPORTED_TIME` (3),
         * `TIMESTAMP_TYPE.DELETED_TIME` (4),
         * or `TIMESTAMP_TYPE.ORIGINAL_IMPORT_TIME` (7)
         * then this must be set to the service key that you want
         * to modify
         */
        file_service_key?: string
        /** 
         * Dependant;
         * If you set `timestamp_type`
         * to `TIMESTAMP_TYPE.LAST_VIEWED` (6)
         * then this must be set to a `CANVAS_TYPE`
         */
        canvas_type?: CANVAS_TYPE_VALUE
        /**
         * Dependant;
         * If you set `timestamp_type`
         * to `TIMESTAMP_TYPE.MODIFIED_TIME_WEB_DOMAIN` (0)
         * then this must be set to the domain you are editing
         */
        domain?: string
    }

    /**
     * hash or file_id must be defined.
     * 
     * With `merge_cleverly` left `false`, then this is a simple update operation.
     * Existing notes will be overwritten exactly as you specify.
     * Any other notes the file has will be untouched.
     * 
     * If you turn on `merge_cleverly`, then the client will merge your new notes
     * into the file's existing notes using the same logic you have seen
     * in Note Import Options and the Duplicate Metadata Merge Options.
     * This navigates conflict resolution, and you should use it if you are
     * adding potential duplicate content from an 'automatic' source like a parser
     * and do not want to wade into the logic.
     * Do not use it for a user-editing experience (a user expects a strict
     * overwrite/replace experience and will be confused by this mode).
     * 
     * To start off, in this mode, if your note text exists under
     * a different name for the file, your dupe note will not be added
     * to your new name. `extend_existing_note_if_possible` makes it so
     * your existing note text will overwrite an existing name
     * (or a '... (1)' rename of that name) if the existing text is
     * inside your given text.
     * `conflict_resolution` is an enum governing what to do in all other conflicts
     */
    interface set_notes_options {
        /**
         * An object where the keys are note names
         * and the values are the contents of the notes
         */
        notes: {[key: string]: string}
        /** The hash of the file to add notes to */
        hash?: string
        /** The file id of the file to add notes to */
        file_id?: number
        /**
         * Optional; Defaults to false
         */
        merge_cleverly?: boolean
        /**
         * Optional; Defaults to true.
         */
        extend_existing_note_if_possible?: boolean
        /**
         * Optional; Defaults to 3.
         * 
         * If a new note name already exists and its new text differs from what already exists
         * * 0 - replace - Overwrite the existing conflicting note.
         * * 1 - ignore - Make no changes.
         * * 2 - append - Append the new text to the existing text.
         * * 3 - rename (default) - Add the new text under a 'name (x)'-style rename.
         */
        conflict_resolution?: 0 | 1 | 2 | 3
    }

    interface set_notes_response extends api_version_response {
        /**
         * The note changes actually sent through.
         *
         * If `merge_cleverly=false`, this is exactly what you gave,
         * and this operation is idempotent.
         * 
         * If `merge_cleverly=true`, then this may differ, even be empty,
         * and this operation might not be idempotent.
         */
        notes: {[key: string]: string}
    }

    /** hash or file_id must be defined. */
    interface delete_notes_options {
        /** A list of note names to be deleted */
        note_names: string[]
        /** The hash of the file to add notes to */
        hash?: string
        /** The file id of the file to add notes to */
        file_id?: number
    }

    type RecursiveTagList = string|RecursiveTagList[]

    interface FileDomainObject {
        /** optional, selective A, hexadecimal, the file domain on which to search */
        file_service_key?: string
        /** optional, selective A, list of hexadecimals, the union of file domains on which to act upon */
        file_service_keys?: string[]
        /** optional, selective B, hexadecimal, the 'deleted from this file domain' on which to act upon */
        deleted_file_service_key?: string
        /** optional, selective B, list of hexadecimals, the union of 'deleted from this file domain' on which to act upon */
        deleted_file_service_keys?: string[]
    }

    interface search_files_options extends FileDomainObject {
        /**
         * a list of tags you wish to search for.
         * OR predicates are supported! Just nest within the tag list, and it'll be treated like an OR.
         * Example: `[ "skirt", [ "samus aran", "lara croft" ], "system:height > 1000" ]`
         */
        tags: RecursiveTagList[]
        /** optional, hexadecimal, the tag domain on which to search, defaults to all my files */
        tag_service_key?: string
        /** optional, bool, whether to search 'current' tags, defaults to `true` */
        include_current_tags?: boolean
        /** optional, bool, whether to search 'pending' tags, defaults to `true` */
        include_pending_tags?: boolean
        /** optional, integer, the results sort method, defaults to `2` for `import time` */
        file_sort_type?: FILE_SORT_TYPE
        /** optional, default `true`, the results sort order */
        file_sort_asc?: boolean
        /** optional, default `true`, returns file id results */
        return_file_ids?: boolean
        /** optional, default `false`, returns hex hash results */
        return_hashes?: boolean
    }

    interface search_files_response extends api_version_response {
        /** The full list of numerical file ids that match the search. Omitted if `return_file_ids` is `false` */
        file_ids?: number[]
        /** The full list of file hashes that match the search. Omitted if `return_hashes` is `false` (default) */
        hashes?: string[]
    }

    /** hash or hashes must be defined */
    interface file_hashes_options {
        hash?: string
        hashes?: string[]
        /** optional; defaults to sha256 */
        source_hash_type?: "sha256"|"md5"|"sha1"|"sha512"
        desired_hash_type: "sha256"|"md5"|"sha1"|"sha512"
    }

    interface file_hashes_response extends api_version_response {
        /** Each key is a provided hash and each value is the desired hash. Entries will be missing for hashes that Hydrus has never seen before */
        hashes: {[key: string]: string}
    }

    interface get_file_metadata_options extends FilesObject {
        /** optional if asking with hash(es), defaulting to false */
        create_new_file_ids?: boolean
        /** optional, defaulting to false */
        only_return_identifiers?: boolean
        /** 
         * optional, defaulting to false.
         * If you set only_return_basic_information=true,
         * this will be much faster for first-time requests
         * than the full metadata result,
         * but it will be slower for repeat requests.
         * The full metadata object is cached after first fetch,
         * the limited file info object is not.
         * You can optionally set include_blurhash when using this option
         * to fetch blurhash strings for the files.
         */
        only_return_basic_information?: boolean
        /** 
         * optional, defaulting to false.
         * If you add detailed_url_information=true, a new entry,
         * detailed_known_urls, will be added for each file,
         * with a list of the same structure as /add_urls/get_url_info.
         * This may be an expensive request if you are querying
         * thousands of files at once.
         */
        detailed_url_information?: boolean
        /** optional, defaulting to `false`. Only applies when `only_return_basic_information` is `true` */
        include_blurhash?: boolean
        /**
         * optional, defaulting to false.
         * will determine if timestamps are integers (1641044491),
         * which is the default,
         * or floats with three significant figures (1641044491.485).
         * As of v559, all file timestamps across the program
         * are internally tracked with milliseconds.
         */
        include_milliseconds?: boolean
        /**
         * optional, defaulting to false.
         * Will decide whether to show a file's notes, in a simple names->texts Object
         */
        include_notes?: boolean
        /** optional, defaulting to true */
        include_services_object?: boolean
        /** @deprecated Deprecated, will be deleted soon! optional, defaulting to true */
        hide_service_keys_tags?: boolean
    }

    interface FileViewingStatistics {
        canvas_type: CANVAS_TYPE_VALUE
        canvas_type_pretty: 'media viewer' | 'preview viewer' | 'client api viewer'
        /** Number of times this file has been viewed on this canvas */
        views: number
        /** Total amount of time spend viewing this file on this canvas */
        viewtime: number
        /** a float if `include_milliseconds` is `true`, otherwise an int */
        last_viewed_timestamp: number
    }

    interface FileMetadata {
        /**
         * The file ID.
         * Potential null if the request was made using hashes
         * and `create_new_file_ids` is `false` (default)
         */
        file_id: number|null
        hash: string
        /** file size in bytes */
        size?: number
        mime?: string
        /**
         * If the file's filetype is forced by the user,
         * filetype_forced becomes true and a second mime string,
         * original_mime is added.
         */
        filetype_forced?: boolean
        /**
         * Only exists if `filetype_forced` is `true`
         */
        original_mime?: string
        filetype_human?: string
        filetype_enum?: "FILETYPE_ENUM"  // TODO: create this type
        ext?: string
        width?: number
        height?: number
        /**
         * The thumbnail_width and thumbnail_height are a generally
         * reliable prediction but aren't a promise.
         * The actual thumbnail you get from /get_files/thumbnail will be different
         * if the user hasn't looked at it since changing their thumbnail options.
         * You only get these rows for files that hydrus actually generates an
         * actual thumbnail for.
         * Things like pdf won't have it.
         * You can use your own thumb,
         * or ask the api and it'll give you a fixed fallback;
         * those are mostly 200x200,
         * but you can and should size them to whatever you want.
         */
        thumbnail_width?: number
        /** @see FileMetadata.thumbnail_width */
        thumbnail_height?: number
        /** Duration is in milliseconds. Can be an int or a float */
        duration?: number
        /** float if `include_milliseconds` is `true`, otherwise an int */
        time_modified: number
        /**
         * key is a domain or "local"
         * value is a float if `include_milliseconds` is `true`, otherwise an int
         */
        time_modified_details?: {[key: string|"local"]: number}
        /**
         * stores which file services the file is currently in and deleted from.
         * The entries are by the service key, same as for tags later on.
         * In rare cases, the timestamps may be null,if they are unknown
         * (e.g. a time_deleted for the file deleted before this information was tracked).
         * The time_modified can also be null.
         * Time modified is just the filesystem modified time for now,
         * but it will evolve into more complicated storage in future with
         * multiple locations (website post times)
         * that'll be aggregated to a sensible value in UI.
         */
        file_services?: {
            /** each key is a file service key */
            current: {[key: string]: {
                /** a float if `include_milliseconds` is `true`, otherwise an int */
                time_imported: number|null
            }}
            /** each key is a file service key */
            deleted: {[key: string]: {
                /** a float if `include_milliseconds` is `true`, otherwise an int */
                time_deleted: number|null
                /** a float if `include_milliseconds` is `true`, otherwise an int */
                time_imported: number|null
            }}
        }
        /**
         * stores the ipfs service key to any known multihash for the file.
         * 
         * Example: {
         *   "55af93e0deabd08ce15ffb2b164b06d1254daab5a18d145e56fa98f71ddb6f11" : "QmReHtaET3dsgh7ho5NVyHb5U13UgJoGipSWbZsnuuM8tb"
         * }
         */
        ipfs_multihashes?: {[key: string]: string}
        has_audio?: boolean
        /**
         * If the file has a thumbnail, blurhash gives
         * a base 83 encoded string of its [blurhash](https://blurha.sh/).
         *
         * will be undefined if
         * `only_return_basic_information` is `true` (not default)
         * and `include_blurhash` is `false` (default)
         * or if the file doesn't have a thumbnail
         */
        blurhash?: string
        /**
         * A SHA256 of the image's pixel data
         * and should exactly match for pixel-identical files
         * (it is used in the duplicate system for 'must be pixel duplicates').
         * 
         * Will be undefined if Hydrus couldn't detect pixel data for the given file
         */
        pixel_hash?: string
        num_frames?: number
        num_words?: number // TODO: validate type
        is_inbox?: boolean
        is_local?: boolean
        /** the file is currently in the trash but available on the hard disk */
        is_trashed?: boolean
        /** either in the trash or completely deleted from disk. */
        is_deleted?: boolean
        has_exif?: boolean
        has_human_readable_embedded_metadata?: boolean
        has_icc_profile?: boolean
        has_transparency?: boolean
        known_urls?: string[]
        /** each key is a rating service key */
        ratings?: {[key: string]: RATING_TYPES}
        /**
         * each key is a file service key
         * 
         * While the 'storage_tags' represent the actual tags stored
         * on the database for a file,
         * 'display_tags' reflect how tags appear in the UI,
         * after siblings are collapsed and parents are added.
         * If you want to edit a file's tags, refer to the storage tags.
         * If you want to render to the user, use the display tags.
         * The display tag calculation logic is very complicated;
         * if the storage tags change,
         * do not try to guess the new display tags yourself--just ask the API again.
         */
        tags?: {[key: string]: {
            /**
             * keys are "0", "1", "2", or "3" where:
             * * "0" - current
             * * "1" - pending
             * * "2" - deleted
             * * "3" - petitioned
             * 
             * values are a list of tags
             */
            storage_tags: {"0": string[], "1": string[], "2": string[], "3": string[]}
            /**
             * keys are "0", "1", "2", or "3" where:
             * * "0" - current
             * * "1" - pending
             * * "2" - deleted
             * * "3" - petitioned
             * 
             * values are a list of tags
             */
            display_tags: {"0": string[], "1": string[], "2": string[], "3": string[]}
        }}
        file_viewing_statistics?: FileViewingStatistics[]
        /** Only exists if `detailed_url_information` is `true` */
        detailed_known_urls?: URLInfo[]
    }

    interface get_file_metadata_response extends api_version_response {
        /**
         * key is a service key;
         * value is a 'ServiceObject' without 'service_key'
         * 
         * You may find
         * api.tools.get_services_of_type()
         * and api.tools.get_services_of_name() helpful
         */
        services?: {[key: string]: ServiceObject}
        /**
         * The metadata list should come back in the same sort order you asked,
         * whether that is in file_ids or hashes!
         * 
         * If you ask with hashes rather than file_ids, hydrus will, by default,
         * only return results when it has seen those hashes before.
         * This is to stop the client making thousands of new file_id records
         * in its database if you perform a scanning operation.
         * If you ask about a hash the client has never encountered
         * before--for which there is no file_id--you will get this style of result:
         * 
         * {
         *   "metadata" : [
         *     {
         *       "file_id" : null,
         *       "hash" : "766da61f81323629f982bc1b71b5c1f9bba3f3ed61caf99906f7f26881c3ae93"
         *     }
         *   ]
         * }
         *
         * You can change this behaviour with create_new_file_ids=true,
         * but bear in mind you will get a fairly 'empty' metadata result
         * with lots of 'null' lines,
         * so this is only useful for gathering the numerical ids
         * for later Client API work.
         */
        metadata: FileMetadata[]
    }

    interface file_options {
        file_id?: number
        hash?: string
        /** optional, boolean, defaults to `false` */
        download?: boolean
    }

    interface thumbnail_options {
        file_id?: number
        hash?: string
    }

    interface file_path_options {
        file_id?: number
        hash?: string
    }

    interface file_path_response extends api_version_response {
        /** The file's path on the system that Hydrus is running on */
        path: string
        /** The file's mime */
        filetype: string
        /** The file's size in bytes */
        size: number
    }

    interface thumbnail_path_options extends file_path_options {
        /** optional, boolean, defaults to `false` */
        include_thumbnail_filetype?: boolean
    }

    interface thumbnail_path_response extends api_version_response {
        /** The thumbnail's path on the system that Hydrus is running on */
        path: string
        /** The thumbnail's mime. Only exists if `include_thumbnail_filetype` is `true` */
        filetype?: string
    }

    interface StorageLocation {
        path: string
        ideal_weight: number
        max_num_bytes: null | number
        prefixes: string[]
    }

    interface local_file_storage_locations_response extends api_version_response {
        locations: StorageLocation[]
    }

    /** file_id or hash must be defined */
    interface render_options {
        file_id?: number
        hash?: string
        /**
         * defaults to false.
         * If true, the `Content-Disposition` header will be set to `attachment`, which triggers the browser to automatically download it (or open the 'save as' dialog) instead.
         */
        download?: boolean
        /**
         * Optional; defaults to 2 for still images and 23 for Ugoiras.
         * 
         * Currently the accepted values for `render_format` for image files are:
         *
         * *   `1` for JPEG (`quality` sets JPEG quality 0 to 100, always progressive 4:2:0 encoding)
         * *   `2` for PNG (`quality` sets the compression level from 0 to 9. A higher value means a smaller size and longer compression time)
         * *   `33` for WEBP (`quality` sets WEBP quality 1 to 100, for values over 100 lossless compression is used)
         *
         * The accepted values for Ugoiras are:
         *
         * *   `23` for APNG (`quality` does nothing for this format)
         * *   `83` for animated WEBP (`quality` sets WEBP quality 1 to 100, for values over 100 lossless compression is used)
         */
        render_format?: 1|2|33 | 23|83
        /**
         * Optional; defaults to 1 for PNG and 80 for JPEG and WEBP, has no effect for Ugoiras using APNG.
         * See {@link render_options.render_format} for more details
         */
        render_quality?: number
        /** Optional; if provided height must also be provided. The width to scale the image to. Doesn't apply to Ugoiras */
        width?: number
        /** Optional; if provided width must also be provided. The height to scale the image to. Doesn't apply to Ugoiras */
        height?: number
    }

    interface get_file_relationships_options extends FilesObject, FileDomainObject {

    }

    interface FileRelationship {
        /**
         * `is_king` is a convenience bool for when a file is king
         * of its own group.
         */
        is_king: boolean
        /**
         * `king` refers to which file is set as the best of a duplicate group.
         * If you are doing potential duplicate comparisons,
         * the kings of your two groups are usually the
         * ideal representatives, and the 'get some pairs to filter'-style
         * commands will always select the kings of the various
         * to-be-compared duplicate groups.
         *
         * **It is possible for the king to not be available.**
         * 
         * Every group has a king, but if that file has been deleted,
         * or if the file domain here is limited and the king
         * is on a different file service, then it may not be available.
         */
        king: string
        /**
         * `king_is_on_file_domain` lets you know if the king
         * is on the file domain you set
         */
        king_is_on_file_domain: boolean
        /**
         * `king_is_local` lets you know if it is on the
         * hard disk--if `king_is_local=true`,
         * you can do a `get_files.file()` request on it.
         * It is generally rare, but you have to deal with the king
         * being unavailable--in this situation,
         * your best bet is to just use the file itself as its
         * own representative.
         */
        king_is_local: boolean
        /** Potential duplicates; An array of 0 or more hashes */
        "0": string[]
        /** False positives; An array of 0 or more hashes */
        "1": string[]
        /** Alternates; An array of 0 or more hashes */
        "3": string[]
        /** Duplicates; An array of 0 or more hashes */
        "8": string[]
    }

    interface get_file_relationships_response extends api_version_response {
        /** key is the a file hash */
        file_relationships: {[key: string]: FileRelationship}
    }

    interface get_potentials_options extends FileDomainObject {
        /**
         * Optional; A service key;
         * Defaults to the `all known tags` service
         */
        tag_service_key_1?: string
        /**
         * Optional; A list of tags to search for;
         * Defaults to `system:everything`
         */
        tags_1?: RecursiveTagList[]
        /**
         * Optional; A service key;
         * Defaults to the `all known tags` service
         */
        tag_service_key_2?: string
        /**
         * Optional; A list of tags to search for;
         * Defaults to `system:everything`
         */
        tags_2?: RecursiveTagList[]
        /**
         * Optional; Defaults to 0
         * * 0 - one file matches search 1
         * * 1 - both files match search 1
         * * 2 - one file matches search 1, the other 2
         */
        potentials_search_type?: POTENTIALS_SEARCH_TYPE_VALUE
        /**
         * Optional; Defaults to 1
         * * 0 - must be pixel duplicates
         * * 1 - can be pixel duplicates
         * * 2 - must not be pixel duplicates
         */
        pixel_duplicates?: PIXEL_DUPLICATES_VALUE
        /**
         * Optional;
         * The max 'search distance' of the pairs; Defaults to 4
         */
        max_hamming_distance?: number
    }

    interface get_potentials_count_options extends get_potentials_options {
        
    }

    interface get_potentials_count_response extends api_version_response {
        potential_duplicates_count: number
    }

    interface get_potential_pairs_options extends get_potentials_options {
        /**
         * Optional; How many pairs to get in a batch;
         * Defaults to whatever is set in Hydrus' settings
         */
        max_num_pairs?: number
        /**
         * Optional; When `group_mode=true`,
         * the pairs will all be related to each other,
         * just like setting 'group mode' in the client.
         * `max_num_pairs` is ignored in this
         * mode--you get the whole group.
         * 
         * !! In some fun situations, this can be a group of size 2,700!
         * 
         * Defaults to false
         */
        group_mode?: boolean
        /**
         * Optional; Defaults to `0`
         * 
         *  `duplicate_pair_sort_type` and `duplicate_pair_sort_asc`
         * control the order of the pairs given.
         * This is still somewhat experimental,
         * and I may add new ones or rework the "similarity"
         * one because it doesn't work too well,
         * but they are currently
         * (with True/False 'asc' values after):
         * 
         * * 0 - (Default) "filesize of larger file"
         * (smallest first/largest first)
         * * 1 - "similarity (distance/filesize ratio)"
         * (most similar first/least similar first)
         * * 2 - "filesize of smaller file"
         * (smallest first/largest first)
         * * 4 - "random" (N/A)
         */
        duplicate_pair_sort_type?: DUP_PAIR_SORT_TYPE_VALUE
        /**
         * Optional; Sort direction;
         * See `duplicate_pair_sort_type` for more details;
         * Defaults to false
         */
        duplicate_pair_sort_asc?: boolean
    }

    interface get_potential_pairs_response extends api_version_response {
        /**
         * A list of file hash pairs.
         * 
         * These file hashes are all kings that are available in
         * the given file domain.
         * Treat it as the client filter does,
         * where you fetch batches to process one after another.
         * I expect to add grouping/sorting options in the near future.
         * 
         */
        potential_duplicate_pairs: [[string, string]]
    }

    interface get_random_potentials_options extends get_potentials_options {

    }

    interface get_random_potentials_response extends api_version_response {
        /** A list of zero or more hashes */
        random_potential_duplicate_hashes: string[]
    }

    interface get_pending_counts_response extends api_version_response {
        /**
         * key is a service key;
         * value is a 'ServiceObject' without 'service_key'
         * 
         * You may find
         * api.tools.get_services_of_type()
         * and api.tools.get_services_of_name() helpful
         */
        services: {[key: string]: ServiceObject}
        /** key is a service key */
        pending_counts: {[key: string]: {
            pending_tag_mappings: number
            petitioned_tag_mappings: number
            pending_tag_siblings: number
            petitioned_tag_siblings: number
            pending_tag_parents: number
            petitioned_tag_parents: number
        }}
    }

    interface get_cookies_response extends api_version_response {
        /**
         * list of all the cookies for a domain in the format of [ name, value, domain, path, expires ]
         * 
         * Note that these variables are all strings except 'expires',
         * which is either an integer timestamp or null for session cookies.
         */
        cookies: [string, string, string, string, number|null][]
    }

    interface set_cookies_options {
        /**
         * list of all the cookies for a domain in the format of [ name, value, domain, path, expires ]
         * 
         * Note that these variables are all strings except 'expires',
         * which is either an integer timestamp or null for session cookies.
         *
         * Expires can be null,
         * but session cookies will time-out in hydrus after 60 minutes of non-use.
         * 
         * You can set 'value' to be null,
         * which will clear any existing cookie with the corresponding name,
         * domain, and path (acting essentially as a delete).
         */
        cookies: [string, string|null, string, string, number|null][]
    }

    interface PageObject {
        name: string
        /**
         * `page_key` is a unique identifier for the page.
         * It will stay the same for a particular page throughout the session,
         * but new ones are generated on a session reload.
         */
        page_key: string
        page_state: PAGE_STATE
        page_type: PAGE_TYPE
        /**
         * `is_media_page` is simply a shorthand for whether the page is
         * a normal page that holds thumbnails or a 'page of pages'.
         * Only media pages can have files (and accept /manage_files/add_files commands).
         */
        is_media_page: boolean
        /**
         * selected means which page is currently in view.
         * It will propagate down the page of pages until it terminates.
         * It may terminate in an empty page of pages,
         * so do not assume it will end on a media page.
         */
        selected: boolean
        pages?: PageObject[]
    }

    interface get_pages_response extends api_version_response {
        pages: {
            name: "top pages notebook"
            /**
             * `page_key` is a unique identifier for the page.
             * It will stay the same for a particular page throughout the session,
             * but new ones are generated on a session reload.
             */
            page_key: string
            page_state: PAGE_STATE
            page_type: PAGE_TYPE
            /**
             * `is_media_page` is simply a shorthand for whether the page is
             * a normal page that holds thumbnails or a 'page of pages'.
             * Only media pages can have files (and accept /manage_files/add_files commands).
             */
            is_media_page: false
            /**
             * selected means which page is currently in view.
             * It will propagate down the page of pages until it terminates.
             * It may terminate in an empty page of pages,
             * so do not assume it will end on a media page.
             */
            selected: true
            pages: PageObject[]
        }
    }

    interface PageInfoObject {
        name: string
        /**
         * `page_key` is a unique identifier for the page.
         * It will stay the same for a particular page throughout the session,
         * but new ones are generated on a session reload.
         */
        page_key: string
        page_state: PAGE_STATE
        page_type: PAGE_TYPE
        /**
         * `is_media_page` is simply a shorthand for whether the page is
         * a normal page that holds thumbnails or a 'page of pages'.
         * Only media pages can have files (and accept /manage_files/add_files commands).
         */
        is_media_page: boolean
        /** TODO: type def; See https://github.com/hydrusnetwork/hydrus/blob/master/docs/developer_api.md#get-manage_pagesget_page_info--idmanage_pages_get_page_info- */
        management: {}
        media: {
            num_files: number
            hash_ids: number[]
        }
    }

    interface get_page_info_response extends api_version_response {
        page_info: PageInfoObject
    }


    /** One of hash, hashes, */
    interface add_files_options extends FilesObject {
        /** The page key for the page you wish to add files to */
        page_key: string
    }

    interface mr_bones_options extends FileDomainObject {
        /** Optional; A list of tags you wish to search for */
        tags?: string[]
        /** Optional; The tag domain on which to search, defaults to `all my files` */
        tag_service_key?: string
    }

    interface mr_bones_response extends api_version_response {
        boned_stats: {
            /** Number of inboxed files */
            num_inbox: number
            /** Number of archived files */
            num_archive: number
            /** Size of all inboxed files in bytes */
            size_inbox: number
            /** Size of all archived files in bytes */
            size_archive: number
            /** Number of deleted files */
            num_deleted: number
            /** Size of all deleted files in bytes */
            size_deleted: number
            /** Earliest file import timestamp in seconds since Epoch */
            earliest_import_time: number
            /**
             * number of media views, seconds viewing media,
             * number of preview views, seconds previewing media
             */
            total_viewtime: [number, number, number, number]
            /** Number of alternative duplicate groups available */
            total_alternate_groups: number
            /** Number of files in alternative duplicate groups */
            total_alternate_files: number
            /** 
             * The number of files that have/had at least one duplicate
             */
            total_duplicate_files: number
        }
    }

    /**
    * A JSON dump of nearly all options set in the client.
    * The format of this is based on internal hydrus structures
    * and is subject to change without warning with new hydrus versions.
    * Do not rely on anything you find here to continue to exist
    * and don't rely on the structure to be the same.
    * 
    * !!! While these values will be type defined they will not be documented or tested due to their unstable nature
    * 
    * !!! Type defs are a best attempt and should be taken with a grain of salt
    */
    interface get_client_options_response extends api_version_response {
        old_options: {
            animation_start_position: number,
            confirm_archive: boolean,
            confirm_client_exit: boolean,
            confirm_trash: boolean,
            default_gui_session: 'last session' | string,
            delete_to_recycle_bin: boolean,
            export_path: null | any,
            gallery_file_limit: number,
            hide_preview: boolean,
            hpos: number,
            idle_mouse_period: number,
            idle_normal: boolean,
            idle_period: number,
            idle_shutdown: number,
            idle_shutdown_max_minutes: number,
            namespace_colours: {
                character: [number, number, number],
                creator: [number, number, number],
                meta: [number, number, number],
                person: [number, number, number],
                series: [number, number, number],
                studio: [number, number, number],
                system: [number, number, number],
                null: [number, number, number],
                '': [number, number, number]
            },
            password: null | any,
            proxy: null | any,
            regex_favourites: string[][],
            remove_filtered_files: boolean,
            remove_trashed_files: boolean,
            thumbnail_dimensions: [ number, number ],
            trash_max_age: number,
            trash_max_size: number,
            vpos: number
        },
        options: {
            booleans: {
                advanced_mode: boolean,
                remove_filtered_files_even_when_skipped: boolean,
                discord_dnd_fix: boolean,
                secret_discord_dnd_fix: boolean,
                show_unmatched_urls_in_media_viewer: boolean,
                set_search_focus_on_page_change: boolean,
                allow_remove_on_manage_tags_input: boolean,
                yes_no_on_remove_on_manage_tags: boolean,
                activate_window_on_tag_search_page_activation: boolean,
                show_related_tags: boolean,
                show_file_lookup_script_tags: boolean,
                use_native_menubar: boolean,
                shortcuts_merge_non_number_numpad: boolean,
                disable_get_safe_position_test: boolean,
                save_window_size_and_position_on_close: boolean,
                freeze_message_manager_when_mouse_on_other_monitor: boolean,
                freeze_message_manager_when_main_gui_minimised: boolean,
                load_images_with_pil: boolean,
                only_show_delete_from_all_local_domains_when_filtering: boolean,
                use_system_ffmpeg: boolean,
                elide_page_tab_names: boolean,
                maintain_similar_files_duplicate_pairs_during_active: boolean,
                maintain_similar_files_duplicate_pairs_during_idle: boolean,
                show_namespaces: boolean,
                show_number_namespaces: boolean,
                show_subtag_number_namespaces: boolean,
                replace_tag_underscores_with_spaces: boolean,
                replace_tag_emojis_with_boxes: boolean,
                verify_regular_https: boolean,
                page_drop_chase_normally: boolean,
                page_drop_chase_with_shift: boolean,
                page_drag_change_tab_normally: boolean,
                page_drag_change_tab_with_shift: boolean,
                wheel_scrolls_tab_bar: boolean,
                remove_local_domain_moved_files: boolean,
                anchor_and_hide_canvas_drags: boolean,
                touchscreen_canvas_drags_unanchor: boolean,
                import_page_progress_display: boolean,
                rename_page_of_pages_on_pick_new: boolean,
                rename_page_of_pages_on_send: boolean,
                process_subs_in_random_order: boolean,
                ac_select_first_with_count: boolean,
                saving_sash_positions_on_exit: boolean,
                database_deferred_delete_maintenance_during_idle: boolean,
                database_deferred_delete_maintenance_during_active: boolean,
                duplicates_auto_resolution_during_idle: boolean,
                duplicates_auto_resolution_during_active: boolean,
                file_maintenance_during_idle: boolean,
                file_maintenance_during_active: boolean,
                tag_display_maintenance_during_idle: boolean,
                tag_display_maintenance_during_active: boolean,
                save_page_sort_on_change: boolean,
                disable_page_tab_dnd: boolean,
                force_hide_page_signal_on_new_page: boolean,
                pause_export_folders_sync: boolean,
                pause_import_folders_sync: boolean,
                pause_repo_sync: boolean,
                pause_subs_sync: boolean,
                pause_all_new_network_traffic: boolean,
                boot_with_network_traffic_paused: boolean,
                pause_all_file_queues: boolean,
                pause_all_watcher_checkers: boolean,
                pause_all_gallery_searches: boolean,
                popup_message_force_min_width: boolean,
                always_show_iso_time: boolean,
                confirm_multiple_local_file_services_move: boolean,
                confirm_multiple_local_file_services_copy: boolean,
                use_advanced_file_deletion_dialog: boolean,
                show_new_on_file_seed_short_summary: boolean,
                show_deleted_on_file_seed_short_summary: boolean,
                only_save_last_session_during_idle: boolean,
                do_human_sort_on_hdd_file_import_paths: boolean,
                highlight_new_watcher: boolean,
                highlight_new_query: boolean,
                delete_files_after_export: boolean,
                file_viewing_statistics_active: boolean,
                file_viewing_statistics_active_on_archive_delete_filter: boolean,
                file_viewing_statistics_active_on_dupe_filter: boolean,
                prefix_hash_when_copying: boolean,
                file_system_waits_on_wakeup: boolean,
                show_system_everything: boolean,
                watch_clipboard_for_watcher_urls: boolean,
                watch_clipboard_for_other_recognised_urls: boolean,
                default_search_synchronised: boolean,
                autocomplete_float_main_gui: boolean,
                global_audio_mute: boolean,
                media_viewer_audio_mute: boolean,
                media_viewer_uses_its_own_audio_volume: boolean,
                preview_audio_mute: boolean,
                preview_uses_its_own_audio_volume: boolean,
                always_loop_gifs: boolean,
                always_show_system_tray_icon: boolean,
                minimise_client_to_system_tray: boolean,
                close_client_to_system_tray: boolean,
                start_client_in_system_tray: boolean,
                use_qt_file_dialogs: boolean,
                notify_client_api_cookies: boolean,
                expand_parents_on_storage_taglists: boolean,
                expand_parents_on_storage_autocomplete_taglists: boolean,
                show_parent_decorators_on_storage_taglists: boolean,
                show_parent_decorators_on_storage_autocomplete_taglists: boolean,
                show_sibling_decorators_on_storage_taglists: boolean,
                show_sibling_decorators_on_storage_autocomplete_taglists: boolean,
                show_session_size_warnings: boolean,
                delete_lock_for_archived_files: boolean,
                delete_lock_reinbox_deletees_after_archive_delete: boolean,
                delete_lock_reinbox_deletees_after_duplicate_filter: boolean,
                delete_lock_reinbox_deletees_in_auto_resolution: boolean,
                remember_last_advanced_file_deletion_reason: boolean,
                remember_last_advanced_file_deletion_special_action: boolean,
                do_macos_debug_dialog_menus: boolean,
                save_default_tag_service_tab_on_change: boolean,
                force_animation_scanbar_show: boolean,
                call_mouse_buttons_primary_secondary: boolean,
                start_note_editing_at_end: boolean,
                draw_transparency_checkerboard_media_canvas: boolean,
                draw_transparency_checkerboard_media_canvas_duplicates: boolean,
                menu_choice_buttons_can_mouse_scroll: boolean,
                remember_options_window_panel: boolean,
                focus_preview_on_ctrl_click: boolean,
                focus_preview_on_ctrl_click_only_static: boolean,
                focus_preview_on_shift_click: boolean,
                focus_preview_on_shift_click_only_static: boolean,
                focus_media_tab_on_viewer_close_if_possible: boolean,
                fade_sibling_connector: boolean,
                use_custom_sibling_connector_colour: boolean,
                hide_uninteresting_modified_time: boolean,
                draw_tags_hover_in_media_viewer_background: boolean,
                draw_top_hover_in_media_viewer_background: boolean,
                draw_top_right_hover_in_media_viewer_background: boolean,
                draw_top_right_hover_in_preview_window_background: boolean,
                preview_window_hover_top_right_shows_popup: boolean,
                draw_notes_hover_in_media_viewer_background: boolean,
                draw_bottom_right_index_in_media_viewer_background: boolean,
                disable_tags_hover_in_media_viewer: boolean,
                disable_top_right_hover_in_media_viewer: boolean,
                media_viewer_window_always_on_top: boolean,
                media_viewer_lock_current_zoom_type: boolean,
                media_viewer_lock_current_zoom: boolean,
                media_viewer_lock_current_pan: boolean,
                allow_blurhash_fallback: boolean,
                fade_thumbnails: boolean,
                slideshow_always_play_duration_media_once_through: boolean,
                enable_truncated_images_pil: boolean,
                do_icc_profile_normalisation: boolean,
                mpv_available_at_start: boolean,
                do_sleep_check: boolean,
                override_stylesheet_colours: boolean,
                command_palette_show_page_of_pages: boolean,
                command_palette_show_main_menu: boolean,
                command_palette_show_media_menu: boolean,
                disallow_media_drags_on_duration_media: boolean,
                show_all_my_files_on_page_chooser: boolean,
                show_all_my_files_on_page_chooser_at_top: boolean,
                show_local_files_on_page_chooser: boolean,
                show_local_files_on_page_chooser_at_top: boolean,
                use_nice_resolution_strings: boolean,
                use_listbook_for_tag_service_panels: boolean,
                open_files_to_duplicate_filter_uses_all_my_files: boolean,
                show_extended_single_file_info_in_status_bar: boolean,
                hide_duplicates_needs_work_message_when_reasonably_caught_up: boolean,
                file_info_line_consider_archived_interesting: boolean,
                file_info_line_consider_archived_time_interesting: boolean,
                file_info_line_consider_file_services_interesting: boolean,
                file_info_line_consider_file_services_import_times_interesting: boolean,
                file_info_line_consider_trash_time_interesting: boolean,
                file_info_line_consider_trash_reason_interesting: boolean,
                set_requests_ca_bundle_env: boolean,
                mpv_loop_playlist_instead_of_file: boolean,
                draw_thumbnail_rating_background: boolean,
                draw_thumbnail_numerical_ratings_collapsed_always: boolean,
                show_destination_page_when_dnd_url: boolean,
                confirm_non_empty_downloader_page_close: boolean,
                confirm_all_page_closes: boolean,
                refresh_search_page_on_system_limited_sort_changed: boolean,
                do_not_setgeometry_on_an_mpv: boolean,
                focus_media_thumb_on_viewer_close: boolean,
                skip_yesno_on_write_autocomplete_multiline_paste: boolean,
                activate_main_gui_on_viewer_close: boolean,
                activate_main_gui_on_focusing_viewer_close: boolean,
                override_bandwidth_on_file_urls_from_post_urls: boolean,
                remove_leading_url_double_slashes: boolean,
                always_apply_ntfs_export_filename_rules: boolean,
                replace_percent_twenty_with_space_in_gug_input: boolean
            },
            strings: {
                app_display_name: string,
                namespace_connector: string,
                sibling_connector: string,
                or_connector: string,
                export_phrase: string,
                current_colourset: string,
                favourite_simple_downloader_formula: string,
                thumbnail_scroll_rate: string,
                pause_character: string,
                stop_character: string,
                default_gug_name: string,
                has_audio_label: string,
                has_duration_label: string,
                discord_dnd_filename_pattern: string,
                default_suggested_tags_notebook_page: string,
                last_incremental_tagging_namespace: string,
                last_incremental_tagging_prefix: string,
                last_incremental_tagging_suffix: string,
                last_options_window_panel: string
            },
            noneable_strings: {
                favourite_file_lookup_script: string | null,
                suggested_tags_layout: string | null,
                backup_path: string | null,
                web_browser_path: string | null,
                last_png_export_dir: string | null,
                media_background_bmp_path: string | null,
                http_proxy: string | null,
                https_proxy: string | null,
                no_proxy: string | null,
                qt_style_name: string | null,
                qt_stylesheet_name: string | null,
                last_advanced_file_deletion_reason: string | null,
                last_advanced_file_deletion_special_action: string | null,
                sibling_connector_custom_namespace_colour: string | null,
                or_connector_custom_namespace_colour: string | null
            },
            integers: {
                notebook_tab_alignment: number,
                video_buffer_size: number,
                related_tags_search_1_duration_ms: number,
                related_tags_search_2_duration_ms: number,
                related_tags_search_3_duration_ms: number,
                related_tags_concurrence_threshold_percent: number,
                suggested_tags_width: number,
                similar_files_duplicate_pairs_search_distance: number,
                default_new_page_goes: number,
                close_page_focus_goes: number,
                num_recent_petition_reasons: number,
                max_page_name_chars: number,
                page_file_count_display: number,
                network_timeout: number,
                connection_error_wait_time: number,
                serverside_bandwidth_wait_time: number,
                thumbnail_visibility_scroll_percent: number,
                ideal_tile_dimension: number,
                wake_delay_period: number,
                media_viewer_zoom_center: number,
                last_session_save_period_minutes: number,
                shutdown_work_period: number,
                max_network_jobs: number,
                max_network_jobs_per_domain: number,
                max_connection_attempts_allowed: number,
                max_request_attempts_allowed_get: number,
                thumbnail_scale_type: number,
                max_simultaneous_subscriptions: number,
                gallery_page_wait_period_pages: number,
                gallery_page_wait_period_subscriptions: number,
                watcher_page_wait_period: number,
                popup_message_character_width: number,
                duplicate_filter_max_batch_size: number,
                video_thumbnail_percentage_in: number,
                global_audio_volume: number,
                media_viewer_audio_volume: number,
                preview_audio_volume: number,
                duplicate_comparison_score_higher_jpeg_quality: number,
                duplicate_comparison_score_much_higher_jpeg_quality: number,
                duplicate_comparison_score_higher_filesize: number,
                duplicate_comparison_score_much_higher_filesize: number,
                duplicate_comparison_score_higher_resolution: number,
                duplicate_comparison_score_much_higher_resolution: number,
                duplicate_comparison_score_more_tags: number,
                duplicate_comparison_score_older: number,
                duplicate_comparison_score_nicer_ratio: number,
                duplicate_comparison_score_has_audio: number,
                thumbnail_cache_size: number,
                image_cache_size: number,
                image_tile_cache_size: number,
                thumbnail_cache_timeout: number,
                image_cache_timeout: number,
                image_tile_cache_timeout: number,
                image_cache_storage_limit_percentage: number,
                image_cache_prefetch_limit_percentage: number,
                media_viewer_prefetch_delay_base_ms: number,
                media_viewer_prefetch_num_previous: number,
                media_viewer_prefetch_num_next: number,
                duplicate_filter_prefetch_num_pairs: number,
                thumbnail_border: number,
                thumbnail_margin: number,
                thumbnail_dpr_percent: number,
                file_maintenance_idle_throttle_files: number,
                file_maintenance_idle_throttle_time_delta: number,
                file_maintenance_active_throttle_files: number,
                file_maintenance_active_throttle_time_delta: number,
                subscription_network_error_delay: number,
                subscription_other_error_delay: number,
                downloader_network_error_delay: number,
                file_viewing_stats_menu_display: number,
                number_of_gui_session_backups: number,
                animated_scanbar_height: number,
                animated_scanbar_nub_width: number,
                domain_network_infrastructure_error_number: number,
                domain_network_infrastructure_error_time_delta: number,
                ac_read_list_height_num_chars: number,
                ac_write_list_height_num_chars: number,
                system_busy_cpu_percent: number,
                human_bytes_sig_figs: number,
                ms_to_wait_between_physical_file_deletes: number,
                potential_duplicates_search_work_time_ms_active: number,
                potential_duplicates_search_work_time_ms_idle: number,
                potential_duplicates_search_rest_percentage_active: number,
                potential_duplicates_search_rest_percentage_idle: number,
                repository_processing_work_time_ms_very_idle: number,
                repository_processing_rest_percentage_very_idle: number,
                repository_processing_work_time_ms_idle: number,
                repository_processing_rest_percentage_idle: number,
                repository_processing_work_time_ms_normal: number,
                repository_processing_rest_percentage_normal: number,
                tag_display_processing_work_time_ms_idle: number,
                tag_display_processing_rest_percentage_idle: number,
                tag_display_processing_work_time_ms_normal: number,
                tag_display_processing_rest_percentage_normal: number,
                tag_display_processing_work_time_ms_work_hard: number,
                tag_display_processing_rest_percentage_work_hard: number,
                deferred_table_delete_work_time_ms_idle: number,
                deferred_table_delete_rest_percentage_idle: number,
                deferred_table_delete_work_time_ms_normal: number,
                deferred_table_delete_rest_percentage_normal: number,
                deferred_table_delete_work_time_ms_work_hard: number,
                deferred_table_delete_rest_percentage_work_hard: number,
                gallery_page_status_update_time_minimum_ms: number,
                gallery_page_status_update_time_ratio_denominator: number,
                watcher_page_status_update_time_minimum_ms: number,
                watcher_page_status_update_time_ratio_denominator: number,
                media_viewer_default_zoom_type_override: number,
                preview_default_zoom_type_override: number,
                export_filename_character_limit: number,
                potential_duplicates_search_work_time_ms: number,
                potential_duplicates_search_rest_percentage: number,
                duplicates_auto_resolution_work_time_ms_active: number,
                duplicates_auto_resolution_work_time_ms_idle: number,
                duplicates_auto_resolution_rest_percentage_active: number,
                duplicates_auto_resolution_rest_percentage_idle: number,
            },
            noneable_integers: {
                forced_search_limit: number| null,
                num_recent_tags: number| null,
                duplicate_background_switch_intensity_a: number| null,
                duplicate_background_switch_intensity_b: number| null,
                last_review_bandwidth_search_distance: number| null,
                file_viewing_statistics_media_min_time_ms: number| null,
                file_viewing_statistics_media_max_time_ms: number| null,
                file_viewing_statistics_preview_min_time_ms: number| null,
                file_viewing_statistics_preview_max_time_ms: number| null,
                subscription_file_error_cancel_threshold: number| null,
                media_viewer_cursor_autohide_time_ms: number| null,
                idle_mode_client_api_timeout: number| null,
                system_busy_cpu_count: number| null,
                animated_scanbar_hide_height: number| null,
                last_backup_time: number| null,
                slideshow_short_duration_loop_percentage: number| null,
                slideshow_short_duration_loop_seconds: number| null,
                slideshow_short_duration_cutoff_percentage: number| null,
                slideshow_long_duration_overspill_percentage: number| null,
                num_to_show_in_ac_dropdown_children_tab: number| null,
                number_of_unselected_medias_to_present_tags_for: number| null,
                export_path_character_limit: number| null,
                export_dirname_character_limit: number| null,
                duplicate_filter_auto_commit_batch_size: number | null,
            },
            keys: {
                default_tag_service_tab: string,
                default_tag_service_search_page: string,
                default_gug_key: string
            },
            colors: {
                default: {
                    '0': [ number, number, number ],
                    '1': [ number, number, number ],
                    '2': [ number, number, number ],
                    '3': [ number, number, number ],
                    '4': [ number, number, number ],
                    '5': [ number, number, number ],
                    '6': [ number, number, number ],
                    '7': [ number, number, number ],
                    '8': [ number, number, number ],
                    '9': [ number, number, number ],
                    '10': [ number, number, number ],
                    '11': [ number, number, number ],
                    '12': [ number, number, number ],
                },
                darkmode: {
                    '0': [ number, number, number ],
                    '1': [ number, number, number ],
                    '2': [ number, number, number ],
                    '3': [ number, number, number ],
                    '4': [ number, number, number ],
                    '5': [ number, number, number ],
                    '6': [ number, number, number ],
                    '7': [ number, number, number ],
                    '8': [ number, number, number ],
                    '9': [ number, number, number ],
                    '10': [ number, number, number ],
                    '11': [ number, number, number ],
                    '12': [ number, number, number ],
                }
            },
            media_zooms: number[],
            slideshow_durations: number[],
            default_file_import_options: {
                loud: string,
                quiet: string
            },
            default_namespace_sorts: {
                sort_metatype: 'namespaces' | string,
                sort_order: number,
                tag_context: {
                    service_key: string,
                    include_current_tags: boolean,
                    include_pending_tags: boolean,
                    display_service_key: string
                },
                namespaces: string[],
                tag_display_type: number
            }[],
            default_sort: {
                sort_metatype: 'system' | string,
                sort_order: number,
                tag_context: {
                    service_key: string,
                    include_current_tags: boolean,
                    include_pending_tags: boolean,
                    display_service_key: string
                },
                sort_type: number
            },
            default_tag_sort: {
                sort_type: number,
                sort_order: number,
                use_siblings: boolean,
                group_by: number
            },
            default_tag_sort_search_page: {
                sort_type: number,
                sort_order: number,
                use_siblings: boolean,
                group_by: number
            },
            default_tag_sort_search_page_manage_tags: {
                sort_type: number,
                sort_order: number,
                use_siblings: boolean,
                group_by: number
            },
            default_tag_sort_media_viewer: {
                sort_type: number,
                sort_order: number,
                use_siblings: boolean,
                group_by: number
            },
            // cSpell: ignore vewier
            default_tag_sort_media_vewier_manage_tags: {
                sort_type: number,
                sort_order: number,
                use_siblings: boolean,
                group_by: number
            },
            fallback_sort: {
                sort_metatype: 'system' | string,
                sort_order: number,
                tag_context: {
                    service_key: string,
                    include_current_tags: boolean,
                    include_pending_tags: boolean,
                    display_service_key: string
                },
                sort_type: number
            },
            suggested_tags_favourites: {[key: string]: any[]},
            default_local_location_context: {
                current_service_keys: string[],
                deleted_service_keys: string[]
            }
        },
        services: {[key: string]: Omit<ServiceObject, "service_key">}
    }
}
