const {VlxDevConstants} = require("@danielbayerlein/vallox-api/lib/constants");
const {TextMap} = require("./vallox-textmap");
const handler = require("./vallox-data-handler");

// 0: en, 3: de
const language = 0;
function init() {

    let vlxObjects = new Map();

    text_conversion(vlxObjects,
        "A_CYC_APPL_SW_VERSION",
        [
            "A_CYC_APPL_SW_VERSION",
            "A_CYC_APPL_SW_VERSION_1",
            "A_CYC_APPL_SW_VERSION_2",
            "A_CYC_APPL_SW_VERSION_3",
            "A_CYC_APPL_SW_VERSION_4",
            "A_CYC_APPL_SW_VERSION_5",
            "A_CYC_APPL_SW_VERSION_6",
            "A_CYC_APPL_SW_VERSION_7",
            "A_CYC_APPL_SW_VERSION_8",
            "A_CYC_APPL_SW_VERSION_9"
        ],
        "indicator.version",
        "id_text_info_sw_version",
        handler.read_version
    );

    number_aggregate_conversion(vlxObjects,
        "A_CYC_SERIAL_NUMBER",
        [
            "A_CYC_SERIAL_NUMBER_MSW",
            "A_CYC_SERIAL_NUMBER_LSW"
        ],
        "indicator.serial",
        "id_text_info_serial_no",
        handler.read_serial
    );

    number(vlxObjects,
        "A_CYC_MACHINE_TYPE",
        "indicator.type",
        "id_text_info_type"
    );

    state(vlxObjects,
        "A_CYC_MACHINE_MODEL",
        "indicator",
        Object.assign({}, TextMap.device_model_data),
        "id_text_info_model"
    );


    number(vlxObjects,
        "A_CYC_FAN_SPEED",
        "value.speed",
        "id_text_value_name_fan_speed"
    );
    number(vlxObjects,
        "A_CYC_TEMP_EXTRACT_AIR",
        "value.temperature",
        "id_text_extract_air_degrees"
    );
    number(vlxObjects,
        "A_CYC_TEMP_EXHAUST_AIR",
        "value.temperature",
        "id_text_exhaust_air_degrees"
    );
    number(vlxObjects,
        "A_CYC_TEMP_OUTDOOR_AIR",
        "value.temperature",
        "id_text_outdoor_air_degrees"
    );

    number(vlxObjects,
        "A_CYC_TEMP_OUTDOOR_AIR",
        "value.temperature",
        "id_text_outdoor_air_degrees"
    );

    number(vlxObjects,
        "A_CYC_TEMP_SUPPLY_CELL_AIR",
        "value.temperature",
        "id_text_info_supply_cell"
    );

    number(vlxObjects,
        "A_CYC_TEMP_SUPPLY_AIR",
        "value.temperature",
        "id_text_supply_air_degrees"
    );

    number(vlxObjects,
        "A_CYC_RH_LEVEL",
        "value.humidity",
        "id_text_humidity_limit"
    );

    number(vlxObjects,
        "A_CYC_CO2_LEVEL",
        "value.co2",
        "id_text_co2_limit"
    );

    number(vlxObjects,
        "A_CYC_EXTR_FAN_SPEED",
        "value.speed",
        "id_text_list_extract_speed"
    );

    number(vlxObjects,
        "A_CYC_SUPP_FAN_SPEED",
        "value.speed",
        "id_text_list_supply_speed"
    );

    number(vlxObjects,
        "A_CYC_RH_VALUE",
        "value.humidity",
        "id_text_list_item_humidity"
    );

    number(vlxObjects,
        "A_CYC_CO2_VALUE",
        "value.co2",
        "id_text_list_tem_CO2"
    );

    number(vlxObjects,
        "A_CYC_ANALOG_SENSOR_INPUT",
        "value.humidity",
        "id_text_humidity_sensor"
    );

    let states = {};
    states[VlxDevConstants.C_CYC_STATE_HOME] = "HOME";
    states[VlxDevConstants.C_CYC_STATE_AWAY] = "AWAY";
    states[VlxDevConstants.C_CYC_STATE_BOOST] = "BOOST";
    state(vlxObjects,
        "A_CYC_STATE",
        "state",
        states,
        "id_text_status");

    states = {};
    states[VlxDevConstants.C_CYC_MODE_TESTING] = "TESTING";
    states[VlxDevConstants.C_CYC_MODE_MANUAL] = "MANUAL";
    states[VlxDevConstants.C_CYC_MODE_DEFROST] = "DEFROST";
    states[VlxDevConstants.C_CYC_MODE_SELF_TEST] = "SELF_TEST";
    states[VlxDevConstants.C_CYC_MODE_OFF] = "OFF";
    states[VlxDevConstants.C_CYC_MODE_EMC_TEST] = "EMC_TEST";
    state(vlxObjects,
        "A_CYC_MODE",
        "state",
        states,
        "id_text_web_profiles"
    );

    state(vlxObjects,
        "A_CYC_DEFROSTING",
        "state",
        {
            0: "INACTIVE",
            1: "ACTIVE"
        },
        "id_text_melting",
        true
    );

    states = {};
    states[VlxDevConstants.C_CYC_CELL_STATE_HEATRECO] = TextMap["id_text_info_txt_value_heat"][language];
    states[VlxDevConstants.C_CYC_CELL_STATE_COOLRECO] = TextMap["id_text_info_txt_value_cool"][language];
    states[VlxDevConstants.C_CYC_CELL_STATE_BYPASS] = TextMap["id_text_info_txt_value_bypass"][language];
    states[VlxDevConstants.C_CYC_CELL_STATE_DEFROST] = TextMap["id_text_menu_cell_defrost"][language];
    state(vlxObjects,
        "A_CYC_CELL_STATE",
        "state",
        states,
        "id_text_info_txt_cell_status",
        true
    );

    number(vlxObjects,
        "A_CYC_TOTAL_UP_TIME_HOURS",
        "indicator.uptime",
        ""
    );

    number(vlxObjects,
        "A_CYC_REMAINING_TIME_FOR_FILTER",
        "",
        "id_text_info_txt_next_reminder"
    );

    number(vlxObjects,
        "A_CYC_TOTAL_FAULT_COUNT",
        "indicator.fault",
        ""
    );

    return vlxObjects;
};

class VlxObjectConfig {
    constructor(id, keys, processingFunc, obj) {
        this.id = id;
        this.keys = keys;
        this.obj = obj;
        this.processingFunc = processingFunc;
    }
}

function number(objects, key, role, textId, writable = false) {
    objects.set(key, new VlxObjectConfig(key, [key], nothing, create_iobroker_object(key, role, "state", "number", [], writable, textId)));
}

function state(objects, key, role, states, textId = "", writable = false) {
    objects.set(key, new VlxObjectConfig(key, [key], nothing, create_iobroker_object(key, role, "state", "number", states, writable, textId)));
}

function number_aggregate_conversion(objects, key, keys, role, textId, processingFunc) {
    objects.set(key, new VlxObjectConfig(key, keys, processingFunc, create_iobroker_object(key, role, "state", "number", [], false, textId)));
}

function number_conversion(objects, key, role, textId, processingFunc) {
    objects.set(key,  new VlxObjectConfig(key, [key], processingFunc, create_iobroker_object(key, role, "state", "number", [], false, textId)));
}

function text_conversion(objects, key, keys, role, textId, processingFunc) {
    objects.set(key, new VlxObjectConfig(key, keys, processingFunc, create_iobroker_object(key, role, "state", "string", [], false, textId)));
}

function nothing(values) {
    return values[0];
}

function create_iobroker_object(id, role, type, dataType, states, writable, textId) {
    return {
        type: type,
        common: {
            name: TextMap.hasOwnProperty(textId) ? TextMap[textId][language] : id,
            type: dataType,
            role: role,
            read: true,
            write: writable,
            unit: determine_unit(id),
            states: states
        },
        native: {}
    };
}

function determine_unit(key) {
    if (key.indexOf("_TEMP_") > 0)
        return "°C";
    else if (key.indexOf("_SPEED") > 0)
        return "%";
    else if (key.indexOf("_RH_") > 0)
        return "%";
    else
        return "";
}


const VlxConfigs = init();
module.exports = {
    VlxConfigs
};