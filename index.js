const yargs = require('yargs');
const { StrKey } = require('stellar-sdk')

const argv = yargs
    .option('unamed-fields', {
        alias: 'u',
        description: 'Struct (Unamed fields)',
        type: 'json'
    })
    .option('named-fields', {
        alias: 'n',
        description: 'Struct (Named fields)',
        type: 'json'
    })
    .option('string', {
        alias: 's',
        description: 'String as bytes',
        type: 'strins'
    })
    .option('bytes', {
        alias: 'b',
        description: 'Bytes',
        type: 'number'
    })
    .option('account', {
        alias: 'a',
        description: 'Account public key',
        type: 'string'
    })
    .help()
    .alias('help', 'h').argv;


if (argv.u) {
    let tuple = JSON.parse(argv.u)
    display(handle("unamed", tuple))
} else if (argv.n) {
    let obj = JSON.parse(argv.n)
    display(handle(Object.keys(obj)[0], obj))
} else if (argv.e) {
    let obj = JSON.parse(argv.e)
    display(handle("enum", obj))
} else if (argv.s) {
    let obj = argv.s
    display(handle("string", obj))
} else if (argv.b) {
    let obj = argv.b
    display(handle("bytes", obj))
} else if (argv.a) {
    display(handle("accountId", argv.a))
}

function display(json) {
    console.log(JSON.stringify(json))
}

function handle(key, value) {

    switch (key) {
        case "enum":
            let symbol = Object.keys(value)[0];
            let v = [{ symbol: symbol }]
            if (value[symbol] && Object.keys(value[symbol]) != 0) {
                v.push(handle(Object.keys(value[symbol])[0], value[symbol] ))
            }
            return { object: { vec: v } }
        case "unamed":
            let vec = []
            for (let e of value) {
                vec.push(handle(e))
            }
            return { "object": { "vec": vec } }
        case "u32":
            return { u32: value }
        case "u64":
            return { u64: value }
        case "i32":
            return { i32: value }
        case "i64":
            return { i64: value }
        case "bool":
            return { bool: value }
        case "bytes":
            return { object: { bytes: value } }
        case "string":
            return handle("bytes", Buffer.from(value).toString('hex'))
        case "accountId":
            return { "object": { "accountId": { "publicKeyTypeEd25519": `${StrKey.decodeEd25519PublicKey(value).toString('hex')}` } } }
        case "bigInt":
            if (value > 0) {
                return { bigInt: { "positive": value.toString('hex') } }
            }
            if (value < 0) {
                return { bigInt: { "negative": value.toString('hex') } }
            }
            return { bigInt: "zero" }
        default:
            // {"key":{"symbol":"count"},"val":{"u32":0}}
            let map = []
            let obj = value[key]
            for (let o of Object.keys(obj)) {
                let p = Object.keys(obj[o])[0]
                map.push(
                    { "key": { "symbol": o }, "val": handle(p, obj[o][p]) }
                )
            }
            return { object: { map: map } }

    }
}