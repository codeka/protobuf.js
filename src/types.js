var Long = require("long");

/**
 * Basic type wire types.
 * @type {!Object.<string,number>}
 */
exports.wireTypes = {

    double   : 1,
    float    : 5,
    int32    : 0,
    uint32   : 0,
    sint32   : 0,
    int64    : 0,
    uint64   : 0,
    sint64   : 0,
    fixed32  : 5,
    sfixed32 : 5,
    fixed64  : 1,
    sfixed64 : 1,
    bool     : 0,
    string   : 2,
    bytes    : 2
    
};

/**
 * Basic type defaults.
 * @type {!Object.<string,*>}
 */
exports.defaults = {

    double   : 0,
    float    : 0,
    int32    : 0,
    uint32   : 0,
    sint32   : 0,
    int64    : Long.ZERO,
    uint64   : Long.UZERO,
    sint64   : Long.ZERO,
    fixed32  : 0,
    sfixed32 : 0,
    fixed64  : Long.ZERO,
    sfixed64 : Long.ZERO,
    bool     : false,
    string   : "",
    bytes    : null

};

/**
 * Allowed types for map keys with their associated wire type.
 * @type {!Object.<string,number>}
 */
exports.mapKeyWireTypes = {

    int32    : 0,
    uint32   : 0,
    sint32   : 0,
    int64    : 0,
    uint64   : 0,
    sint64   : 0,
    fixed32  : 5,
    sfixed32 : 5,
    fixed64  : 1,
    sfixed64 : 1,
    bool     : 0,
    string   : 2

};

/**
 * Allowed types for packed repeated fields.
 * @type {!Object.<string,boolean>}
 */
exports.packable = {

    int32    : true,
    uint32   : true,
    sint32   : true,
    int64    : true,
    uint64   : true,
    sint64   : true,
    fixed32  : true,
    sfixed32 : true,
    fixed64  : true,
    sfixed64 : true,
    bool     : true

};
