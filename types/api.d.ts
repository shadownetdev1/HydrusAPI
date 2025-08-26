
// cSpell: ignore booru, IPFS, viewtime, blurhash, colours, imageboard
// cSpell: ignore favourite, azur lane, multihash, multihashes, exif

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

/**
 * 
 * * 0 - tag repository
 * * 1 - file repository
 * * 2 - a local file domain like 'my files'
 * * 5 - a local tag domain like 'my tags'
 * * 6 - a 'numerical' rating service with several stars
 * * 7 - a 'like/dislike' rating service with on/off status
 * * 10 - all known tags -- a union of all the tag services
 * * 11 - all known files -- a union of all the file services and files that appear in tag services
 * * 12 - the local booru -- you can ignore this
 * * 13 - IPFS
 * * 14 - trash
 * * 15 - all local files -- all files on hard disk ('all my files' + updates + trash)
 * * 17 - file notes
 * * 18 - Client API
 * * 19 - deleted from anywhere -- you can ignore this
 * * 20 - local updates -- a file domain to store repository update files in
 * * 21 - all my files -- union of all local file domains
 * * 22 - a 'inc/dec' rating service with positive integer rating
 * * 99 - server administration
 */
type SERVICE_TYPES = 0|1|2|5|6|7|10|11|12|13|14|15|17|18|19|20|21|22|99

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

interface RawAPIOptions {
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
}

interface api_version_response {
    /** The Hydrus API version */
    version: number
    /** The Hydrus client/server's version */
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
    service_key: string
    type: SERVICE_TYPES
    type_pretty: string
}

interface ServicesObject {
    local_tags: ServiceObject[]
    tag_repositories: ServiceObject[]
    local_files: ServiceObject[]
    local_updates: ServiceObject[]
    file_repositories: any[]  // TODO: this seems to be unused. figure out if it is used and if so what its type is
    all_local_files: ServiceObject[]
    all_local_media: ServiceObject[]
    all_known_files: ServiceObject[]
    all_known_tags: ServiceObject[]
    trash: ServiceObject[]
    /**
     * key is a 'ServiceObject.service_key';
     * value is a 'ServiceObject' without 'service_key'
     */
    services: {[key: string]: Omit<ServiceObject, "service_key">}
}

interface get_service_response extends api_version_response {
    service: ServiceObject
}

interface get_services_response extends api_version_response, ServicesObject {}

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

interface add_url_response extends api_version_response {
    human_result_text: string
    normalised_url: string
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

interface search_tags_response extends api_version_response {
    tags: {value: string, count:number}[]
}

interface set_favourite_tags_options {
    /** (selective A, optional, a list of tags) If set then the existing favourite tags will be overwritten with these */
    set?: string[]
    /** (selective B, optional, a list of tags) A list of tags to add to the existing list */
    add?: string[]
    /** (selective B, optional, a list of tags) A list of tags to remove from the existing list */
    remove?: string[]
}

/** At least one of file_id, hash, or hashes must be defined */
interface FilesObject {
    /** The id of the file to be deleted */
    file_id?: number
    /** The SHA256 hash of the file to be deleted */
    hash?: string
    /** The SHA256 hashes of the files to be deleted */
    hashes?: string[]
}

interface set_rating_options extends FilesObject {
    /** hexadecimal, the rating service you want to edit */
    rating_service_key: string
    /**
     * mixed datatype, the rating value you want to set
     * * Like/Dislike Ratings: Send true for 'like', false for 'dislike', or null for 'unset'.
     * * Numerical Ratings: Send an int for the number of stars to set, or null for 'unset'.
     * * Inc/Dec Ratings: Send an int for the number to set. 0 is your minimum.
     * As with GET /get_files/file_metadata, check The Services Object for the min/max stars on a numerical rating service.
     */
    rating: RATING_TYPES
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
    tags: [RecursiveTagList]
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
    filetype_enum?: FILETYPE_ENUM  // TODO: create this type
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
    time_modified?: number
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
        storage_tags: {[key: "0"|"1"|"2"|"3"]: string[]}
        /**
         * keys are "0", "1", "2", or "3" where:
         * * "0" - current
         * * "1" - pending
         * * "2" - deleted
         * * "3" - petitioned
         * 
         * values are a list of tags
         */
        display_tags: {[key: "0"|"1"|"2"|"3"]: string[]}
    }}
    file_viewing_statistics?: {
        canvas_type: CAnVAS_TYPE
        canvas_type_pretty: string
        views: number
        viewtime: number
        /** a float if `include_milliseconds` is `true`, otherwise an int */
        last_viewed_timestamp: number
    }[]
    /** Only exists if `detailed_url_information` is `true` */
    detailed_known_urls?: URLInfo[]
}

interface get_file_metadata_response extends api_version_response {
    services?: ServicesObject
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
