import {test, expect, describe, beforeAll} from 'vitest'
import { RawAPI, API_VERSION } from '../api.js'
import jetpack from 'fs-jetpack'

const api = new RawAPI({
    debug: false,
    access_key: "8672a05b8fd4c3a51808331594dc0aa9de58b1e92c07d2b09240459550c619c5", // TODO: pull from environment
    address: "http://10.0.1.148:45869", // TODO: pull from environment
})

/**
 * The correct way to handle this would be to have multiple test,
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

describe('HyAPI', () => {

    beforeAll(async() => {
        const api_version = await api.api_version()
        console.log(api_version)
        if (api_version.version !== API_VERSION) {
            console.warn(`HyAPI is designed for API version ${API_VERSION}, but the Hydrus client we connected to is at API version ${api_version.version}`)
        }
    })

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

        console.warn(`HyAPI.request_new_permissions() requires manual testing`)
    })

    test('get_services and get_service', async() => {
        const services = await api.get_services()
        // console.log(services)
        expect(services.all_known_files.length > 0).toBe(true)
        expect(services.all_known_files[0].name).toBeTypeOf('string')
        expect(services.all_known_files[0].service_key).toBeTypeOf('string')
        expect(services.all_known_files[0].type).toBeTypeOf('number')
        expect(services.all_known_files[0].type_pretty).toBeTypeOf('string')
        expect(services.all_known_tags.length > 0).toBe(true)
        expect(services.all_local_files.length > 0).toBe(true)
        expect(services.all_local_media.length > 0).toBe(true)
        expect(services.local_files.length > 0).toBe(true)
        expect(Array.isArray(services.local_tags)).toBe(true)
        expect(Array.isArray(services.local_updates)).toBe(true)
        expect(Array.isArray(services.tag_repositories)).toBe(true)
        expect(Array.isArray(services.trash)).toBe(true)
        expect(Object.keys(services.services).length > 0).toBe(true)

        const service_by_name = await api.get_service({
            service_name: services.all_known_files[0].name
        })
        const service = await api.get_service({
            service_key: services.all_known_files[0].service_key
        })
        const service_str = JSON.stringify(services.all_known_files[0])
        expect(JSON.stringify(service_by_name.service)).toBe(service_str)
        expect(JSON.stringify(service.service)).toBe(service_str)
    })

    test('get_files.* and add_files.*', async() => {
        const f_path = 'src/tests/files/hummingbird-at-feeder-1754669486LJt.jpg'
        // const f_path = './files/tree-1332664495LMO.jpg'
        const f_hash = jetpack.inspect(f_path, {checksum: 'sha256'}).sha256

        console.log('here')

        const exists = async() => {
            try {
                const res = (await api.get_files.file_path({
                    hash: f_hash
                }))
                return !!res?.path
            } catch (e) {
                if (e.message.includes(`responded with status code '404' and status text 'Not Found'`)) {
                    return false
                } else {
                    throw e
                }
            }
            
        }

        const upload = async() => {
            // clear deletion record
            await api.add_files.clear_file_deletion_record({
                hash: f_hash
            })
            // upload
            const res = await api.add_files.add_file({
                bytes: jetpack.read(f_path, 'buffer')
            })
            // validate hash
            if (res?.hash !== f_hash) {
                throw new Error('File upload failed!')
            }
            // validate api
            if (!await exists()) {
                throw new Error(`Uploaded file doesn't exist!`)
            }
            console.log('test file uploaded')
        }

        // make sure the file exists for testing
        if (!await exists()) {
            await upload()
        }

        // delete file
        const trash_res = await api.add_files.delete_files({
            hash: f_hash,
            reason: 'HyAPI Test'
        })
        expect(trash_res).toBe(true)

        // check to see if the file is in the trash
        const is_trashed = (await api.get_files.file_metadata({
            hash: f_hash
        })).metadata[0].is_trashed
        expect(is_trashed).toBe(true)

        // get file_service_key for 'all local files'
        const file_service_key = (await api.get_service({
            service_name: 'all local files'
        })).service.service_key

        // delete the file again
        const delete_res = await api.add_files.delete_files({
            hash: f_hash,
            reason: 'HyAPI Test',
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

        // test file_path
        expect((await api.get_files.file_path({
            hash: f_hash
        }))?.path).toBeTypeOf('string')

        // test thumbnail_path
        expect((await api.get_files.thumbnail_path({
            hash: f_hash
        }))?.path).toBeTypeOf('string')

        // const file = await api.get_files.file({
        //     hash: f_hash
        // })
        // jetpack.write('test_file.jpeg', file.data)

        // const thumbnail = await api.get_files.thumbnail({
        //     hash: f_hash
        // })
        // jetpack.write('test_thumbnail.jpeg', thumbnail.data)

        // TODO: search_files, file_hashes, api.get_files.file
        // TODO: api.get_files.thumbnail
        // TODO: local_file_storage_locations, render

        // TODO: undelete_files
        // TODO: migrate_files, archive_files
        // TODO: unarchive_files, generate_hashes
    }, 60000)

    test('add_urls.*', async() => {
        // TODO
    })

    test('add_tags.*', async() => {
        // TODO
    })

    test('edit_ratings.*', async() => {
        // TODO
    })

    test('edit_times.*', async() => {
        // TODO
    })

    test('add_notes.*', async() => {
        // TODO
    })

    test('manage_file_relationships.*', async() => {
        // TODO
    })

    test('manage_services.*', async() => {
        // TODO
    })

    test('manage_cookies.*', async() => {
        // TODO
    })

    test('manage_headers.*', async() => {
        // TODO
    })

    test('manage_pages.*', async() => {
        // TODO
    })

    test('manage_popups.*', async() => {
        // TODO
    })

    test('manage_database.*', async() => {
        // TODO
    })
})