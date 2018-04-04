const xml2js = require('xml2js')

exports.buildXML = function (json) {
    const builder = new xml2js.Builder()
    return builder.buildObject(json)
}

exports.parseXML = function (xml, fn) {
    const parser = new xml2js.Parser({ trim: true, explicitArray: false, explicitRoot: false })
    parser.parseString(xml, fn || ((err, result) => {}))
}
