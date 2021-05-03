function read_serial(values) {
    const s = "0x" + parseInt(values[0]).toString(16).padStart(4, "0") + parseInt(values[1]).toString(16).padStart(4, "0");
    return parseInt(s, 16);
}

function read_version(values) {
    const s = [];
    let n = 0;
    let allFF = true;
    let firstNonZero = 0;
    for (let i = 0; i < values.length; i++) {
        n = swap16(parseInt(values[i], 10));
        if (n !== 0xffff) {
            allFF = false;
        }
        if (n !== 0 && firstNonZero === 0) {
            firstNonZero = i;
        }
        s.push(n.toString(10));
    }
    let versionString;
    if (allFF) {
        versionString = "--";
    } else {
        versionString = s.slice(firstNonZero).join(".");
    }
    return versionString;
}

function read_ipaddress(values) {
    const part1 = parseInt(values[0]).toString(16).padStart(4, "0");
    const part2 = parseInt(values[1]).toString(16).padStart(4, "0");

    return parseInt("0x" + part1.substr(0, 2)) + "." +
        parseInt("0x" + part1.substr(2, 2)) + "." +
        parseInt("0x" + part2.substr(0, 2)) + "." +
        parseInt("0x" + part2.substr(2, 2));
}

function read_float(value) {
    return parseFloat(value);
}

function read_bool(values) {
    if(values.length !== 1) {
        throw Error(`Expected array with length 1 but got ${values.length}.`);
    }
    switch (values[0]) {
        case 0:
            return false;
        case 1:
            return true;
        default:
            throw Error(`Could not parse ${values[0]} to boolean`);
    }
}

function swap16(val) {
    return ((val & 0xFF) << 8)
        | ((val >> 8) & 0xFF);
}

module.exports = {
    read_serial,
    read_version,
    read_ipaddress,
    read_float,
    read_bool
};