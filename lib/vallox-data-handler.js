function read_serial(values) {
    let s = "0x" + parseInt(values[0]).toString(16).padStart(4, "0") + parseInt(values[1]).toString(16).padStart(4, "0");
    return parseInt(s, 16);
}

function read_version(values) {
    var s = [];
    var n = 0;
    var allFF = true;
    var firstNonZero = 0;
    for (var i = 0; i < values.length; i++) {
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
    let part1 = parseInt(values[0]).toString(16).padStart(4, "0");
    let part2 = parseInt(values[1]).toString(16).padStart(4, "0");

    return parseInt("0x" + part1.substr(0, 2)) + "." +
        parseInt("0x" + part1.substr(2, 2)) + "." +
        parseInt("0x" + part2.substr(0, 2)) + "." +
        parseInt("0x" + part2.substr(2, 2));
}

function read_float(value) {
    return parseFloat(value)
}

function swap16(val) {
    return ((val & 0xFF) << 8)
        | ((val >> 8) & 0xFF);
}

module.exports = {
    read_serial,
    read_version,
    read_ipaddress,
    read_float
};