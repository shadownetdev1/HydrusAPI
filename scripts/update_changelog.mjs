
import jetpack from 'fs-jetpack'

const u_path = 'CHANGELOG.UNCOMMITTED.MD'
let u_text = jetpack.read(u_path)
const c_path = 'CHANGELOG.MD'
let c_text = jetpack.read(c_path)
const t_path = 'CHANGELOG.TEMPLATE.MD'
let t_text = jetpack.read(t_path)

const version = process.argv[2]
const date = new Date()
const date_string = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`

u_text = u_text.replaceAll('<!-- version -->', `[${ version }](https://github.com/shadownetdev1/HyAPI/releases/tag/${version}) - ${date_string}`)

c_text = c_text.replace('<!-- insert_point -->', u_text)

jetpack.write(c_path, c_text, {
    atomic: true
})

jetpack.write(u_path, t_text, {
    atomic: true
})
