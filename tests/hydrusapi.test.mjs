
const ACCESS_KEY = '6b23b9bda9745013066fb1a09652eca47de08af4da361f1affc6658939fb6567'
// WARNING: Do not connect to a copy of Hydrus that you use for other purposes.
// WARNING: Some of these tests are destructive and will cause data loss.
// WARNING: You have been warned and I am not responsible for any damages.
const ADDRESS = 'http://localhost:45869'

import {test, expect, describe} from 'vitest'
import API from '../hydrusapi.js'
import jetpack from 'fs-jetpack'
import fs from 'fs/promises'
import { detailedDiff } from 'deep-object-diff'

const util = require('util')
const exec_async = util.promisify(require('child_process').exec)
const exec = require('child_process').exec

if (!process.platform === 'linux') {
    throw new Error('This test script currently only supports linux')
}

const api = new API({
    debug: false,
    access_key: ACCESS_KEY,
    // WARNING: Do not connect to a copy of Hydrus that you use for other purposes.
    // WARNING: Some of these tests are destructive and will cause data loss.
    // WARNING: You have been warned and I am not responsible for any damages.
    address: ADDRESS,
})

const download_dest = `tests/hydrus-v${api.HYDRUS_TARGET_VERSION}.tar.zst`
const run_path = 'tests/hydrus'

const get_hydrus = async() => {
    const link = `https://github.com/hydrusnetwork/hydrus/releases/download/v${api.HYDRUS_TARGET_VERSION}/Hydrus.Network.${api.HYDRUS_TARGET_VERSION}.-.Linux.-.Executable.tar.zst`

    // const exec = require('child_process').exec
    if (jetpack.exists(download_dest) === false) {
        console.log(`Downloading Hydrus version ${api.HYDRUS_TARGET_VERSION} (this will likely take a while)...`)
        const download_command = `curl -L -o ${download_dest} '${link}'`
        // const download_command = `wget '${link}' -O ${dest}`

        // if we are download hydrus then this is likely a git clone
        // make sure all db folders exist
        const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g']
        for (const f of digits) {
            for (const s of digits) {
                jetpack.dir(`tests/db/client_files/f${f}${s}`)
                jetpack.dir(`tests/db/client_files/t${f}${s}`)
            }
        }
        
        let { stdout, stderr } = await exec_async(download_command)
        console.log('stdout:', stdout)
        console.log('stderr:', stderr)
    }
    
    console.log(`Extracting Hydrus...`)
    jetpack.remove(run_path)
    jetpack.dir(run_path)
    const extract_command = `tar --use-compress-program=unzstd -xvf '${jetpack.cwd()}/${download_dest}' --strip-components=1 -C '${jetpack.cwd()}/tests/hydrus'`
    let { stdout2, stderr2 } = await exec_async(extract_command)
    console.log('stdout:', stdout2)
    console.log('stderr:', stderr2)
}

const hydrus_running = async() => {
    const path = `${jetpack.cwd()}/tests/hydrus/hydrus_client`.replaceAll('/', '\\/')
    let { stdout, stderr } = await exec_async(`ps ax -ww -o pid,args | sed -n '/${path}/p'`)
    if (stderr || stdout.trim().length === 0) {
        return false
    } else {
        return stdout.trim().split(` `)[0].trim()
    }
}

const exit_hydrus = async() => {
    const pid = await hydrus_running()
    if (pid) {
        console.log(`Attempting to exit hydrus`)
        process.kill(pid, 'SIGTERM')
        const start = Math.floor(Date.now() / 1000)
        while (await hydrus_running()) {
            let now = Math.floor(Date.now() / 1000)
            if ((now - start) > 30) {
                throw new Error(`Hydrus is taking too long to exit`)
            }
            await new Promise(resolve => setTimeout(resolve, 1000))
        }
        console.log(`Hydrus exited successfully`)
    }
}

const start_hydrus = async() => {
    console.log(`Starting Hydrus...`)
    exec(`${jetpack.cwd()}/tests/hydrus/hydrus_client`)
    const start = Math.floor(Date.now() / 1000)
    let api_accessible = false
    console.log(`Waiting up to 60 seconds for Hydrus to be available...`)
    while (!api_accessible) {
        let now = Math.floor(Date.now() / 1000)
        if ((now - start) > 60) {
            if (await hydrus_running()) {
                throw new Error(`Hydrus is running, but it isn't responding to it's API. Is it loaded? Is the API setup correctly?`)
            }
            throw new Error(`Hydrus is taking too long to launch`)
        }
        await new Promise(resolve => setTimeout(resolve, 1000))
        try {
            const api_version = await api.api_version()
            console.log(api_version)
            api_accessible = true
        } catch {
            // nothing to do
        }
    }
}

if (jetpack.exists(run_path) === false) {
    await get_hydrus()
}

if (jetpack.exists(download_dest) === false) {
    await exit_hydrus()
    jetpack.remove(run_path)
    await get_hydrus()
}

try {
    const api_version = await api.api_version()
    console.log(api_version)
    if (
        api_version.version !== api.VERSION | 
        api_version.hydrus_version !== api.HYDRUS_TARGET_VERSION
    ) {
        await exit_hydrus()
        await get_hydrus()
    }
} catch (e) {
    if (await hydrus_running()) {
        throw e
    }
    if (jetpack.exists(run_path) !== 'dir') {throw new Error('Hydrus was not installed correctly')}
    console.log(`Copying test database to hydrus`)
    jetpack.remove(`${run_path}/db`)
    jetpack.copy('tests/db', `${run_path}/db`)
    await start_hydrus()
}

const exists = async(hash) => {
    try {
        const res = (await api.get_files.file_path({
            hash: hash
        }))
        return !!res?.path
    } catch (e) {
        if (e.message.includes(`responded with status code '404' and text 'Not Found'`)) {
            return false
        } else {
            throw e
        }
    }
    
}

const upload = async(path, hash) => {
    // clear deletion record
    await api.add_files.clear_file_deletion_record({
        hash: hash
    })
    // upload
    const res = await api.add_files.add_file({
        bytes: jetpack.read(path, 'buffer')
    })
    // validate hash
    if (res?.hash !== hash) {
        throw new Error('File upload failed!')
    }
    // validate api
    if (!await exists(hash)) {
        throw new Error(`Uploaded file doesn't exist!`)
    }
    console.log(`test file '${path}' uploaded`)
}

/**
 * The correct way to handle this would be to have multiple tests,
 * but vitest runs multiple tests at the same time with no way to
 * decide which tests run first (as far as I can tell).
 * 
 * Even if we could decide what tests run first we still don't
 * want to slam Hydrus with a lot of API calls.
 * 
 * So instead we do it in one big test per section.
 * This still means that we are stressing Hydrus a little,
 * but it should be fine.
 */
describe('HydrusAPI', () => {
    test('api_version, session_key, and verify_access_key', async() => {
        const api_version = await api.api_version()
        expect(api_version?.version).toBeTypeOf('number')
        expect(api_version?.hydrus_version).toBeTypeOf('number')
        console.log(`Connected to Hydrus v${api_version.hydrus_version} with api version ${api_version.version}`)

        const api_version_raw = await api.api_version('raw')
        expect(api_version_raw.status).toBe(200)

        const session_key = await api.session_key()
        expect(session_key?.session_key).toBeTypeOf('string')
        expect(session_key.session_key.length).toBe(64)

        const verify_access_key = await api.verify_access_key()
        expect(verify_access_key.permits_everything).toBeTypeOf('boolean')
        expect(Array.isArray(verify_access_key.basic_permissions)).toBe(true)
        expect(verify_access_key.human_description).toBeTypeOf('string')

        console.warn(`HydrusAPI.request_new_permissions() requires manual testing`)
    })

    test('get_services and get_service', async() => {
        const services = (await api.get_services()).services
        expect(Object.keys(services).length > 0).toBe(true)

        const service_by_name = await api.get_service({
            service_name: Object.values(services)[0].name
        })
        const service = await api.get_service({
            service_key: Object.keys(services)[0]
        })
        Object.values(services)[0].service_key = Object.keys(services)[0]
        const service_str = JSON.stringify(Object.values(services)[0])
        expect(JSON.stringify(service_by_name.service)).toBe(service_str)
        expect(JSON.stringify(service.service)).toBe(service_str)
    })

    test('get_files.* and add_files.*', async() => {
        const f_path = 'tests/files/hummingbird-at-feeder-1754669486LJt.jpg'
        const f_hash = jetpack.inspect(f_path, {checksum: 'sha256'}).sha256

        // make sure the file exists for testing
        if (!await exists(f_hash)) {
            await upload(f_path, f_hash)
        }

        // trash the file
        const trash_res = await api.add_files.delete_files({
            hash: f_hash,
            reason: 'HydrusAPI Test'
        })
        expect(trash_res).toBe(true)

        // check to see if the file is in the trash
        const is_trashed = (await api.get_files.file_metadata({
            hash: f_hash
        })).metadata[0].is_trashed
        expect(is_trashed).toBe(true)

        // un trash the file
        const untrash_res = await api.add_files.undelete_files({
            hash: f_hash
        })
        expect(untrash_res).toBe(true)

        // trash the file again
        const trash_res2 = await api.add_files.delete_files({
            hash: f_hash,
            reason: 'HydrusAPI Test'
        })
        expect(trash_res2).toBe(true)

        // get file_service_key for 'all local files'
        const file_service_key = (await api.get_service({
            service_name: 'all local files'
        })).service.service_key

        // delete the file
        const delete_res = await api.add_files.delete_files({
            hash: f_hash,
            reason: 'HydrusAPI Test',
            file_service_key: file_service_key,
        })
        expect(delete_res).toBe(true)

        // make sure the file is deleted from the Hydrus filesystem
        const meta = (await api.get_files.file_metadata({
            hash: f_hash
        })).metadata[0]
        const is_deleted = meta.is_trashed === false && meta.is_deleted === true
        expect(is_deleted).toBe(true)

        // attempt to import file (should fail)
        const import_fail = (await api.add_files.add_file({
            bytes: jetpack.read(f_path, 'buffer')
        }))
        expect(import_fail.status).toBe(3)

        // clear deletion record
        const clear = await api.add_files.clear_file_deletion_record({
            hash: f_hash
        })
        expect(clear).toBe(true)

        // attempt to import file (should succeed)
        const import_success = (await api.add_files.add_file({
            bytes: jetpack.read(f_path, 'buffer')
        }))
        expect(import_success.status).toBe(1)

        // TODO: test path method of api.add_files.add_file

        // test file_path
        expect((await api.get_files.file_path({
            hash: f_hash
        }))?.path).toBeTypeOf('string')

        // test thumbnail_path
        expect((await api.get_files.thumbnail_path({
            hash: f_hash
        }))?.path).toBeTypeOf('string')

        // prep before testing file and thumbnail
        jetpack.remove('./hydrusapi_test_file.jpeg')
        jetpack.remove('./hydrusapi_test_thumb.jpeg')

        // test file
        const file = await api.get_files.file({
            hash: f_hash
        })
        await fs.writeFile('./hydrusapi_test_file.jpeg', file)
        expect(jetpack.inspect(f_path, {checksum: 'sha256'}).sha256).toBe(f_hash)

        // test thumbnail
        const thumbnail = await api.get_files.thumbnail({
            hash: f_hash
        })
        await fs.writeFile('./hydrusapi_test_thumb.jpeg', thumbnail)
        // TODO: validate that test_thumb.jpeg is a thumbnail of the image (PHash?)
        // cleanup from file and thumbnail testing
        jetpack.remove('./hydrusapi_test_file.jpeg')
        jetpack.remove('./hydrusapi_test_thumb.jpeg')


        // test search_files
        const results = await api.get_files.search_files({
            tags: [`system:hash is ${f_hash}`],
            return_hashes: true,
        })
        expect(results.file_ids.length).toBe(1)
        expect(results.file_ids[0]).toBe(meta.file_id)
        expect(results.hashes.length).toBe(1)
        expect(results.hashes[0]).toBe(f_hash)

        // test file_hashes
        const hashes = await api.get_files.file_hashes({
            // hash: f_hash,
            hashes: [f_hash],
            desired_hash_type: 'md5',
        })
        expect(Object.keys(hashes.hashes).includes(f_hash)).toBe(true)
        expect(hashes.hashes[f_hash]).toBe(jetpack.inspect(f_path, {checksum: 'md5'}).md5)

        // test local_file_storage_locations
        const locs = await api.get_files.local_file_storage_locations()
        expect(locs.locations.length === 0).toBe(false)
        expect(typeof locs.locations[0].ideal_weight).toBe('number')
        expect(typeof locs.locations[0].path).toBe('string')
        expect(locs.locations[0].prefixes.length === 0).toBe(false)

        // test: render
        jetpack.remove('./hydrusapi_test_render.png')
        const render = await api.get_files.render({hash: f_hash})
        await fs.writeFile('./hydrusapi_test_render.png', render)
        // TODO: validate that hydrusapi_test_render.png is a render of the image (PHash?)
        jetpack.remove('./hydrusapi_test_render.png')

        // test: archive_files
        const arced = await api.add_files.archive_files({
            hash: f_hash
        })
        expect(arced).toBe(true)

        // test: unarchive_files
        const unArced = await api.add_files.unarchive_files({
            hash: f_hash
        })
        expect(unArced).toBe(true)

        // test: generate_hashes
        const gen_hashes = await api.add_files.generate_hashes({
            bytes: jetpack.read(f_path, 'buffer')
            // path: `${jetpack.cwd()}/${f_path}`
        })
        expect(gen_hashes.hash).toBe(f_hash)
        expect(gen_hashes.pixel_hash).toBe('46bd14e11cb1cef52248a36a3998887a5ca70cab397bed5d925a66a678f43231')

        // test migrate_files (add)
        const other_service_key = (await api.get_service({service_name: 'my other files'})).service.service_key
        // add to `my other files`
        const migrate = await api.add_files.migrate_files({
            hash: f_hash,
            file_service_keys: [other_service_key]
        })
        expect(migrate).toBe(true)
        // validate
        const meta2 = await api.get_files.file_metadata({hash: f_hash})
        expect(Object.keys(meta2.metadata[0].file_services.current).includes(other_service_key)).toBe(true)
        // remove from `my other files`
        const un_migrate = await api.add_files.delete_files({
            hash: f_hash,
            file_domain: other_service_key,
        })
        expect(un_migrate).toBe(true)
        // validate
        const meta3 = await api.get_files.file_metadata({hash: f_hash})
        expect(Object.keys(meta3.metadata[0].file_services.current).includes(other_service_key)).toBe(false)
        expect(Object.keys(meta3.metadata[0].file_services.deleted).includes(other_service_key)).toBe(true)
    }, 120000)

    test('add_urls.*', async() => {
        const f_path = 'tests/files/tree-1332664495LMO.jpg'
        const f_hash = jetpack.inspect(f_path, {checksum: 'sha256'}).sha256

        // make sure the file exists for testing
        if (!await exists(f_hash)) {
            await upload(f_path, f_hash)
        }

        // test: associate_url (cleanup in case it already has the url)
        const cleanup = await api.add_urls.associate_url({
            hash: f_hash,
            url_to_delete: 'https://raw.githubusercontent.com/shadownetdev1/HydrusAPI/refs/heads/main/tests/files/tree-1332664495LMO.jpg'
        })
        expect(cleanup).toBe(true)

        // test: associate_url (addition)
        const addition = await api.add_urls.associate_url({
            hash: f_hash,
            urls_to_add: ['https://raw.githubusercontent.com/shadownetdev1/HydrusAPI/refs/heads/main/tests/files/tree-1332664495LMO.jpg']
        })
        expect(addition).toBe(true)

        // test: get_url_files (expect 1)
        const files = await api.add_urls.get_url_files({
            url: 'https://raw.githubusercontent.com/shadownetdev1/HydrusAPI/refs/heads/main/tests/files/tree-1332664495LMO.jpg',
            doublecheck_file_system: true
        })
        expect(files.normalised_url).toBe('https://raw.githubusercontent.com/shadownetdev1/HydrusAPI/refs/heads/main/tests/files/tree-1332664495LMO.jpg')
        expect(files.url_file_statuses.length).toBe(1)
        expect(files.url_file_statuses[0].status).toBe(2)
        expect(files.url_file_statuses[0].hash).toBe(f_hash)
        expect(files.url_file_statuses[0].note.startsWith('url recognised')).toBe(true)

        // test: associate_url (removal)
        const removal = await api.add_urls.associate_url({
            hash: f_hash,
            urls_to_delete: ['https://raw.githubusercontent.com/shadownetdev1/HydrusAPI/refs/heads/main/tests/files/tree-1332664495LMO.jpg']
        })
        expect(removal).toBe(true)

        // test: get_url_files (expect 0)
        const files2 = await api.add_urls.get_url_files({
            url: 'https://raw.githubusercontent.com/shadownetdev1/HydrusAPI/refs/heads/main/tests/files/tree-1332664495LMO.jpg'
        })
        expect(files2.normalised_url).toBe('https://raw.githubusercontent.com/shadownetdev1/HydrusAPI/refs/heads/main/tests/files/tree-1332664495LMO.jpg')
        expect(files2.url_file_statuses.length).toBe(0)

        // test: get_url_info
        const info = await api.add_urls.get_url_info('https://raw.githubusercontent.com/shadownetdev1/HydrusAPI/refs/heads/main/tests/files/tree-1332664495LMO.jpg')
        expect(info.normalised_url).toBe('https://raw.githubusercontent.com/shadownetdev1/HydrusAPI/refs/heads/main/tests/files/tree-1332664495LMO.jpg')
        expect(info.url_type).toBe(5)
        expect(info.url_type_string).toBe('unknown url')
        expect(info.match_name).toBe('unknown url')
        expect(info.can_parse).toBe(false)
        expect(info.cannot_parse_reason).toBe('unknown url class')
        expect(info.request_url).toBe('https://raw.githubusercontent.com/shadownetdev1/HydrusAPI/refs/heads/main/tests/files/tree-1332664495LMO.jpg')

        // test: add_url
        const add = await api.add_urls.add_url({
            url: 'https://raw.githubusercontent.com/shadownetdev1/HydrusAPI/refs/heads/main/tests/files/japan-travel-poster-vintage-1590660773y1R.jpg'
        })
        expect(add.human_result_text).toBe('"unknown url" URL added successfully.')
        expect(add.normalised_url).toBe('https://raw.githubusercontent.com/shadownetdev1/HydrusAPI/refs/heads/main/tests/files/japan-travel-poster-vintage-1590660773y1R.jpg')
    })

    test('add_tags.*', async() => {
        const f_path = 'tests/files/venice-italy-travel-poster-15626778587Sq.jpg'
        const f_hash = jetpack.inspect(f_path, {checksum: 'sha256'}).sha256

        // make sure the file exists for testing
        if (!await exists(f_hash)) {
            await upload(f_path, f_hash)
        }

        // test clean_tags
        const clean = await api.add_tags.clean_tags([ " bikini ", "blue    eyes", " character : samus aran ", " :)", "   ", "", "10", "11", "9", "system:wew", "-flower" ])
        expect(JSON.stringify(clean.tags)).toBe(JSON.stringify(
            ['9','10','11',')','bikini','blue eyes','character:samus aran','flower','wew']
        ))

        // test set_favourite_tags
        const fav_options = ['hi', 'happy', 'cat', 'dog']
        // cSpell: ignore favs
        const favs = [...new Set([
            fav_options[Math.floor(Math.random() * fav_options.length)],
            fav_options[Math.floor(Math.random() * fav_options.length)],
        ])]
        favs.sort()
        const set_fav = await api.add_tags.set_favourite_tags({set: favs})
        expect(JSON.stringify(set_fav.favourite_tags)).toBe(JSON.stringify(favs))

        // test get_favourite_tags
        const get_fav = await api.add_tags.get_favourite_tags()
        expect(JSON.stringify(get_fav.favourite_tags)).toBe(JSON.stringify(set_fav.favourite_tags))

        // get the my files service
        const tags_service_key = (await api.get_service({service_name: 'my tags'})).service.service_key

        // test get_siblings_and_parents
        const sib_parent_data = await api.add_tags.get_siblings_and_parents(['stream'])
        expect(Object.keys(sib_parent_data.tags).includes('stream')).toBe(true)
        expect(Object.keys(sib_parent_data.tags.stream).includes(tags_service_key)).toBe(true)
        sib_parent_data.tags.stream[tags_service_key].siblings.sort()
        const tags = ['river', 'stream']
        tags.sort()
        expect(JSON.stringify(sib_parent_data.tags.stream[tags_service_key].siblings)).toBe(JSON.stringify(tags))
        expect(sib_parent_data.tags.stream[tags_service_key].ideal_tag).toBe('river')
        expect(sib_parent_data.tags.stream[tags_service_key].descendants.length).toBe(0)
        expect(JSON.stringify(sib_parent_data.tags.stream[tags_service_key].ancestors)).toBe(JSON.stringify(['water']))

        // test: add_tags (add)
        const service_keys_to_tags = {}
        service_keys_to_tags[tags_service_key] = ['boat', 'bridge', 'stream', 'tower']
        const add_tags = await api.add_tags.add_tags({
            hash: f_hash,
            service_keys_to_tags: service_keys_to_tags
        })
        expect(add_tags).toBe(true)

        // validate
        const meta = await api.get_files.file_metadata({hash: f_hash})
        expect(JSON.stringify(meta.metadata[0].tags[tags_service_key].storage_tags['0'])).toBe(JSON.stringify(
            ['boat', 'bridge', 'stream', 'tower']
        ))
        expect(JSON.stringify(meta.metadata[0].tags[tags_service_key].display_tags['0'])).toBe(JSON.stringify(
            ['boat', 'bridge', 'river', 'tower', 'water']
        ))

        // test: search_tags
        const search = await api.add_tags.search_tags({
            search: 'stream'
        })
        expect(search.tags.length).toBe(1)
        expect(search.tags[0].value).toBe('stream')
        expect(search.tags[0].count).toBe(1)

        // test: add_tags (remove)
        const service_keys_to_actions_to_tags = {}
        service_keys_to_actions_to_tags[tags_service_key] = {
            '1': ['boat', 'bridge', 'stream', 'tower']
        }
        const remove_tags = await api.add_tags.add_tags({
            hash: f_hash,
            service_keys_to_actions_to_tags: service_keys_to_actions_to_tags
        })
        expect(remove_tags).toBe(true)

        // validate
        const meta2 = await api.get_files.file_metadata({hash: f_hash})
        expect(JSON.stringify(meta2.metadata[0].tags[tags_service_key].storage_tags['2'])).toBe(JSON.stringify(
            ['boat', 'bridge', 'stream', 'tower']
        ))
        expect(JSON.stringify(meta2.metadata[0].tags[tags_service_key].display_tags['2'])).toBe(JSON.stringify(
            ['boat', 'bridge', 'stream', 'tower']
        ))
    })

    test('edit_ratings.*', async() => {
        const f_path = 'tests/files/venice-italy-travel-poster-15626778587Sq.jpg'
        const f_hash = jetpack.inspect(f_path, {checksum: 'sha256'}).sha256

        // make sure the file exists for testing
        if (!await exists(f_hash)) {
            await upload(f_path, f_hash)
        }

        // get rating service
        const service_key = (await api.get_service({service_name: 'favourites'})).service.service_key

        // test set_rating (false)
        const rating_false = await api.edit_ratings.set_rating({
            hash: f_hash,
            rating_service_key: service_key,
            rating: false
        })
        expect(rating_false).toBe(true)

        const meta = await api.get_files.file_metadata({hash: f_hash})
        expect(meta.metadata[0].ratings[service_key]).toBe(false)

        // test set_rating (true)
        const rating_true = await api.edit_ratings.set_rating({
            hash: f_hash,
            rating_service_key: service_key,
            rating: true
        })
        expect(rating_true).toBe(true)

        const meta2 = await api.get_files.file_metadata({hash: f_hash})
        expect(meta2.metadata[0].ratings[service_key]).toBe(true)
    })

    test('edit_times.*', async() => {
        const f_path = 'tests/files/seascape-sunset-1500478633cRS.jpg'
        const f_hash = jetpack.inspect(f_path, {checksum: 'sha256'}).sha256

        // make sure the file exists for testing
        if (!await exists(f_hash)) {
            await upload(f_path, f_hash)
        }

        // test: increment_file_viewtime
        /**
         * @returns {[FileViewingStatistics, FileViewingStatistics, FileViewingStatistics]}
         */
        const assign = async() => {
            const time = (
                await api.get_files.file_metadata({hash: f_hash})
            ).metadata[0].file_viewing_statistics
            let media_viewer, preview_viewer, api_viewer
            for (const viewer of time) {
                switch (viewer.canvas_type) {
                    case api.CANVAS_TYPE.MEDIA_VIEWER:
                        media_viewer = viewer
                        break;
                    case api.CANVAS_TYPE.PREVIEW_VIEWER:
                        preview_viewer = viewer
                        break;
                    case api.CANVAS_TYPE.API_VIEWER:
                        api_viewer = viewer
                        break;
                    default:
                        throw new Error(`Unknown canvas type of '${viewer.canvas_type}' with name '${viewer.canvas_type_pretty}'`)
                }
            }
            if (!media_viewer | !preview_viewer | !api_viewer) {
                throw new Error(`Failed to get a canvas! media: ${!!media_viewer}, preview: ${!!preview_viewer}, api: ${!!api_viewer}`)
            }
            return [media_viewer, preview_viewer, api_viewer]
        }
        /** @type {FileViewingStatistics} */
        let old_media_viewer, old_preview_viewer, old_api_viewer
        [old_media_viewer, old_preview_viewer, old_api_viewer] = await assign()
        const inc_media_viewer = await api.edit_times.increment_file_viewtime({
            hash: f_hash,
            canvas_type: api.CANVAS_TYPE.MEDIA_VIEWER,
            timestamp: old_media_viewer.last_viewed_timestamp + 100,
            views: 2,
            viewtime: 77.2
        })
        expect(inc_media_viewer).toBe(true)
        const inc_preview_viewer = await api.edit_times.increment_file_viewtime({
            hash: f_hash,
            canvas_type: api.CANVAS_TYPE.PREVIEW_VIEWER,
            timestamp: old_preview_viewer.last_viewed_timestamp + 100,
            views: 2,
            viewtime: 77.2
        })
        expect(inc_preview_viewer).toBe(true)
        const inc_api_viewer = await api.edit_times.increment_file_viewtime({
            hash: f_hash,
            canvas_type: api.CANVAS_TYPE.API_VIEWER,
            timestamp: old_api_viewer.last_viewed_timestamp + 100,
            views: 2,
            viewtime: 77.2
        })
        expect(inc_api_viewer).toBe(true)
        /** @type {FileViewingStatistics} */
        let media_viewer, preview_viewer, api_viewer
        [media_viewer, preview_viewer, api_viewer] = await assign()
        for (const viewers of [
            [old_media_viewer, media_viewer],
            [old_preview_viewer, preview_viewer],
            [old_api_viewer, api_viewer]
        ]) {
            viewers[0].views += 2
            viewers[0].viewtime += 77.2
            viewers[0].viewtime = Number(viewers[0].viewtime.toFixed(3))
            viewers[0].last_viewed_timestamp += 100
            expect(viewers[0].canvas_type).toBe(viewers[1].canvas_type)
            expect(viewers[0].canvas_type_pretty).toBe(viewers[1].canvas_type_pretty)
            expect(viewers[0].views).toBe(viewers[1].views)
            expect(viewers[0].last_viewed_timestamp).toBe(viewers[1].last_viewed_timestamp)
            expect(viewers[0].viewtime).toBe(viewers[1].viewtime)
        }

        // test set_file_viewtime
        const set_media_viewer = await api.edit_times.set_file_viewtime({
            hash: f_hash,
            canvas_type: old_media_viewer.canvas_type,
            timestamp: old_media_viewer.last_viewed_timestamp,
            views: old_media_viewer.views,
            viewtime: old_media_viewer.viewtime
        })
        expect(set_media_viewer).toBe(true)
        const set_preview_viewer = await api.edit_times.set_file_viewtime({
            hash: f_hash,
            canvas_type: old_preview_viewer.canvas_type,
            timestamp: old_preview_viewer.last_viewed_timestamp,
            views: old_preview_viewer.views,
            viewtime: old_preview_viewer.viewtime
        })
        expect(set_preview_viewer).toBe(true)
        const set_api_viewer = await api.edit_times.set_file_viewtime({
            hash: f_hash,
            canvas_type: old_api_viewer.canvas_type,
            timestamp: old_api_viewer.last_viewed_timestamp,
            views: old_api_viewer.views,
            viewtime: old_api_viewer.viewtime
        })
        expect(set_api_viewer).toBe(true)

        let new_media_viewer, new_preview_viewer, new_api_viewer
        [new_media_viewer, new_preview_viewer, new_api_viewer] = await assign()

        for (const viewers of [
            [old_media_viewer, new_media_viewer],
            [old_preview_viewer, new_preview_viewer],
            [old_api_viewer, new_api_viewer]
        ]) {
            expect(viewers[0].canvas_type).toBe(viewers[1].canvas_type)
            expect(viewers[0].canvas_type_pretty).toBe(viewers[1].canvas_type_pretty)
            expect(viewers[0].views).toBe(viewers[1].views)
            expect(viewers[0].last_viewed_timestamp).toBe(viewers[1].last_viewed_timestamp)
            expect(viewers[0].viewtime).toBe(viewers[1].viewtime)
        }
        
        // test set_time
        const key = (
            await api.tools.get_services_of_type(
                api.SERVICE_TYPE.ALL_LOCAL_FILES
            )
        )[0].service_key
        const meta1 = (await api.get_files.file_metadata({
            hash: f_hash
        })).metadata[0]
        const set = await api.edit_times.set_time({
            hash: f_hash,
            timestamp: meta1.time_modified + 500,
            timestamp_type: api.TIMESTAMP_TYPE.MODIFIED_TIME_DISK,
            file_service_key: key
        })
        expect(set).toBe(true)
        const meta2 = (await api.get_files.file_metadata({
            hash: f_hash
        })).metadata[0]
        expect(meta1.time_modified + 500).toBe(meta2.time_modified)
    })

    test('add_notes.*', async() => {
        const f_path = 'tests/files/seascape-sunset-1500478633cRS.jpg'
        const f_hash = jetpack.inspect(f_path, {checksum: 'sha256'}).sha256

        // make sure the file exists for testing
        if (!await exists(f_hash)) {
            await upload(f_path, f_hash)
        }

        // test delete_notes
        const ensure_clean = await api.add_notes.delete_notes({
            note_names: ['test_note'],
            hash: f_hash,
        })
        expect(ensure_clean).toBe(true)

        // test set_notes
        const notes = {
            'test_note': 'This is a test note that should have multiple lines\nline 2\nline 3\nBye :)'
        }
        const res = await api.add_notes.set_notes({
            notes: notes,
            hash: f_hash
        })
        expect(JSON.stringify(res.notes)).toBe(JSON.stringify(notes))

        // test delete_notes again
        const clean = await api.add_notes.delete_notes({
            note_names: ['test_note'],
            hash: f_hash,
        })
        expect(clean).toBe(true)
    })

    test('manage_file_relationships.*', async() => {
        const f_path = 'tests/files/seascape-sunset-1500478633cRS.jpg'
        const f_hash = jetpack.inspect(f_path, {checksum: 'sha256'}).sha256

        // make sure the file exists for testing
        if (!await exists(f_hash)) {
            await upload(f_path, f_hash)
        }

        // test get_file_relationships (no relations)
        const no_rel = (await api.manage_file_relationships.get_file_relationships({
            hash: f_hash
        })).file_relationships
        expect(Object.keys(no_rel).length).toBe(1)
        expect(Object.keys(no_rel)[0]).toBe(f_hash)
        const no_rel_rec = Object.values(no_rel)[0]
        expect(no_rel_rec["0"]).toStrictEqual([])
        expect(no_rel_rec["1"]).toStrictEqual([])
        expect(no_rel_rec["3"]).toStrictEqual([])
        expect(no_rel_rec["8"]).toStrictEqual([])
        expect(no_rel_rec.is_king).toBe(true)
        expect(no_rel_rec.king).toBe(f_hash)
        expect(no_rel_rec.king_is_on_file_domain).toBe(true)
        expect(no_rel_rec.king_is_local).toBe(true)

        // test: get_potentials_count (no relations)
        const no_count = (
            await api.manage_file_relationships.get_potentials_count()
        ).potential_duplicates_count
        expect(no_count).toBe(0)

        // TODO: test get_file_relationships (relations exist)

        // TODO: test: get_potentials_count (relations exist)
    })

    test('manage_services.*', async() => {
        // test: get_pending_counts
        const pending = await api.manage_services.get_pending_counts()
        expect(pending.pending_counts).toBeTypeOf('object')
        expect(pending.pending_counts === null).toBe(false)
        expect(pending.services).toBeTypeOf('object')
        expect(pending.services === null).toBe(false)

        // test: commit_pending
        // !!! Due to the nature of this endpoint it isn't tested
        // const commit = await api.manage_services.commit_pending()
        // console.log(commit)

        // test: forget_pending
        // !!! Due to the nature of this endpoint it isn't tested
        // const commit = await api.manage_services.forget_pending()
        // console.log(commit)
    })

    test('manage_cookies.*', async() => {
        // test set_cookies
        const expires = Math.floor(Date.now() / 1000) + 2592000 // current time plus 30 days
        const set = await api.manage_cookies.set_cookies({
            cookies: [
                ["name", "value", ".example.com", "/", expires],
            ]
        })
        expect(set).toBe(true)

        // test get_cookies
        const get = await api.manage_cookies.get_cookies('example.com')
        expect(get.cookies.length).toBe(1)
        expect(get.cookies[0][0]).toBe('name')
        expect(get.cookies[0][1]).toBe('value')
        expect(get.cookies[0][2]).toBe('.example.com')
        expect(get.cookies[0][3]).toBe('/')
        expect(get.cookies[0][4]).toBe(expires)
    })

    test('manage_headers.*', async() => {
        // TODO
    })

    test('manage_pages.*', async() => {
        // test get_pages
        let pages = (await api.manage_pages.get_pages()).pages

        // test focus_page
        const focus1 = await api.manage_pages.focus_page(pages.pages[1].page_key)
        expect(focus1).toBe(true)

        const focus2 = await api.manage_pages.focus_page(pages.pages[0].page_key)
        expect(focus2).toBe(true)

        // test get_pages
        pages = (await api.manage_pages.get_pages()).pages
        expect(pages.name).toBe('top page notebook')
        expect(pages.page_state).toBe(0)
        expect(pages.page_type).toBe(10)
        expect(pages.is_media_page).toBe(false)
        expect(pages.selected).toBe(true)
        const page = pages.pages[0]
        expect(page.name).toBe('files')
        expect(page.page_state).toBe(0)
        expect(page.page_type).toBe(6)
        expect(page.is_media_page).toBe(true)
        expect(page.selected).toBe(true)

        // test get_page_info
        const info = (await api.manage_pages.get_page_info({
            page_key: page.page_key,
            // simple: false,
        })).page_info
        expect(info.name).toBe(page.name)
        expect(info.page_key).toBe(page.page_key)
        expect(info.page_state).toBe(page.page_state)
        expect(info.page_type).toBe(page.page_type)
        expect(info.is_media_page).toBe(page.is_media_page)
        expect(typeof info.media.num_files).toBe('number')
        expect(Array.isArray(info.media.hash_ids)).toBe(true)
        if (info.media.hash_ids.length !== 0) {
            expect(typeof info.media.hash_ids[0]).toBe('number')
        }

        // test add_files
        const added = await api.manage_pages.add_files({
            page_key: page.page_key,
            file_id: 3
        })
        expect(added).toBe(true)

        // validate that the page has file 3
        const update = (await api.manage_pages.get_page_info({
            page_key: page.page_key,
            // simple: false,
        })).page_info
        expect(Array.isArray(update.media.hash_ids)).toBe(true)
        expect(update.media.hash_ids.includes(3)).toBe(true)
        expect(update.media.num_files > 3).toBe(true)

        // test refresh_page
        const refreshed = await api.manage_pages.refresh_page(page.page_key)
        expect(refreshed).toBe(true)

        // The /manage_pages/refresh_page endpoint returns before
        // the page has finished refreshing. Because of this we need
        // to add a short wait to ensure the page has refreshed.
        // One second should be more than enough time.
        await new Promise(resolve => setTimeout(resolve, 1000))

        // validate that the page was refreshed
        const fresh = (await api.manage_pages.get_page_info({
            page_key: page.page_key,
            // simple: false,
        })).page_info
        expect(fresh.media.num_files).toBe(3)
    })

    test('manage_popups.*', async() => {
        // TODO
    })

    test('manage_database.*', async() => {
        // test force_commit
        const commit = await api.manage_database.force_commit()
        expect(commit).toBe(true)

        // test lock_on
        const lock = await api.manage_database.lock_on()
        expect(lock).toBe(true)

        // test lock_off
        const unlock = await api.manage_database.lock_off()
        expect(unlock).toBe(true)

        // test mr_bones
        const bones = (await api.manage_database.mr_bones()).boned_stats
        expect(bones.num_inbox).toBeTypeOf('number')
        expect(bones.num_archive).toBeTypeOf('number')
        expect(bones.size_inbox).toBeTypeOf('number')
        expect(bones.size_archive).toBeTypeOf('number')
        expect(bones.num_deleted).toBeTypeOf('number')
        expect(bones.size_deleted).toBeTypeOf('number')
        expect(bones.earliest_import_time).toBeTypeOf('number')
        expect(Array.isArray(bones.total_viewtime)).toBe(true)
        expect(bones.total_viewtime.length).toBe(4)
        expect(bones.total_alternate_groups).toBeTypeOf('number')
        expect(bones.total_alternate_files).toBeTypeOf('number')
        expect(bones.total_duplicate_files).toBeTypeOf('number')

        // test get_client_options
        // !!! While this endpoint's response will be type defined it will not be documented or tested due to its unstable nature
        // !!! Expect the results of this endpoint to change with each Hydrus client version
        const options = await api.manage_database.get_client_options()
        expect(options).toBeTypeOf('object')
        expect(options === null).toBe(false)
        const old_schema_path = `tests/files/get_client_options_schema_${api.HYDRUS_TARGET_VERSION-1}.json`
        const schema_path = `tests/files/get_client_options_schema_${api.HYDRUS_TARGET_VERSION}.json`
        // save schema to be checked against in newer versions
        if (jetpack.exists(schema_path) === false) {
            jetpack.write(schema_path, options)
        }
        // compare new and old schemas. Throw error with difference
        const prep = (data) => {
            if (typeof data === 'object' && data !== null) {
                for (const [key, value] of Object.entries(data)) {
                    data[key] = prep(value)
                }
                return data
            } else if (Array.isArray(data)) {
                data.forEach((value, index, array) => {
                    array[index] = prep(value)
                })
                return data
            } else if (data === null) {
                return "null"
            }
            return typeof data
        }
        if (jetpack.exists(old_schema_path) === 'file') {
            const old_schema = jetpack.read(old_schema_path, 'json')
            // prep the schema's replacing all values with strings for their types
            // and then diff it
            const diff = detailedDiff(prep(options), prep(old_schema))
            if (JSON.stringify(diff) !== JSON.stringify({"added": {},"deleted": {},"updated": {}})) {
                diff["original"] = options
                jetpack.write(`comparison.tmp.json`, diff, {atomic: true})
                throw new Error(`The output of 'manage_database.get_client_options()' has changed! See 'comparison.tmp.json' for the differences!`)
            }
        }
    })

    test('tools', async() => {
        // test: get_services_of_type
        const service_type = (await api.tools.get_services_of_type(
            api.SERVICE_TYPE.ALL_KNOWN_FILES
        ))
        expect(service_type.length).toBe(1)
        expect(service_type[0].name).toBe('all known files')
        expect(service_type[0].type).toBe(
            api.SERVICE_TYPE.ALL_KNOWN_FILES
        )
        expect(service_type[0].type_pretty).toBe(
            'virtual combined file service'
        )
        expect(service_type[0].service_key).toBeTypeOf('string')
        // test: get_services_of_name
        const service_name = (await api.tools.get_services_of_name(
            service_type[0].name
        ))
        expect(service_name.length).toBe(1)
        expect(service_name[0].name).toBe('all known files')
        expect(service_name[0].type).toBe(
            api.SERVICE_TYPE.ALL_KNOWN_FILES
        )
        expect(service_name[0].type_pretty).toBe(
            'virtual combined file service'
        )
        expect(service_name[0].service_key).toBeTypeOf('string')
        expect(service_name[0].service_key).toBe(service_type[0].service_key)
    })
})