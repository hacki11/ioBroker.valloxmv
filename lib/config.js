const {VlxDevConstants} = require("@danielbayerlein/vallox-api/lib/constants");
const {TextMap} = require("./vallox-textmap");
const handler = require("./vallox-data-handler");

// 0: en, 3: de
const language = 0;

function profile() {
    let states = {};
    states[1] = "HOME";
    states[2] = "AWAY";
    states[3] = "BOOST";
    states[4] = "FIREPLACE";
    states[5] = "EXTRA";
    let profile = createState("ACTIVE_PROFILE",
        "indicator",
        states,
        "id_text_web_profiles",
        true);
    profile.obj["common"].min = 1;
    profile.obj["common"].max = 5;
    return profile;
}

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
        "text",
        "id_text_info_sw_version",
        handler.read_version
    );

    number_aggregate_conversion(vlxObjects,
        "A_CYC_SERIAL_NUMBER",
        [
            "A_CYC_SERIAL_NUMBER_MSW",
            "A_CYC_SERIAL_NUMBER_LSW"
        ],
        "value",
        "id_text_info_serial_no",
        handler.read_serial
    );

    state(vlxObjects,
        "A_CYC_MACHINE_TYPE",
        "value",
        Object.assign({}, TextMap.device_type_data),
        "id_text_info_type"
    );

    state(vlxObjects,
        "A_CYC_MACHINE_MODEL",
        "value",
        Object.assign({}, TextMap.device_model_data),
        "id_text_info_model"
    );


    number(vlxObjects,
        "A_CYC_FAN_SPEED",
        "value.speed",
        "id_text_value_name_fan_speed",
        "%"
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
        "level.humidity",
        "id_text_humidity_limit"
    );

    number(vlxObjects,
        "A_CYC_CO2_LEVEL",
        "level.co2",
        "id_text_co2_limit"
    );

    number(vlxObjects,
        "A_CYC_EXTR_FAN_SPEED",
        "value.speed",
        "id_text_list_extract_speed",
        "rpm"
    );

    number(vlxObjects,
        "A_CYC_SUPP_FAN_SPEED",
        "value.speed",
        "id_text_list_supply_speed",
        "rpm"
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
        "id_text_humidity_sensor",
        "RH"
    );

    let states = {};
    states[VlxDevConstants.C_CYC_MODE_NORMAL] = "NORMAL";
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
        "",
        true
    );
    
    state(vlxObjects,
        "A_CYC_DEFROSTING",
        "indicator",
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
        "value",
        ""
    );

    number(vlxObjects,
        "A_CYC_REMAINING_TIME_FOR_FILTER",
        "value",
        "id_text_info_txt_next_reminder"
    );

    number(vlxObjects,
        "A_CYC_TOTAL_FAULT_COUNT",
        "value",
        ""
    );

    states = {};
    states[0] = TextMap["id_text_automatic"][language]; 
    states[1] = TextMap["id_text_manual"][language];     
    state(vlxObjects,
        "A_CYC_RH_LEVEL_MODE",
        "state",
        states,
        "id_text_info_txt_humidity",
        true
    );

    
    states = {};
    states[VlxDevConstants.C_CYC_HEATING_SUPPLY] = TextMap["id_text_value_name_supply"][language]; // Incoming Air
    states[VlxDevConstants.C_CYC_HEATING_EXTRACT] = TextMap["id_text_value_name_exhaust"][language]; // Value 1: Exhaust air / 
    states[VlxDevConstants.C_CYC_HEATING_COOLING] = TextMap["id_text_info_txt_value_cool"][language]; // Value 2: Cooling / KRG    
    state(vlxObjects,
        "A_CYC_SUPPLY_HEATING_ADJUST_MODE",
        "state",
        states,
        "id_text_web_adjustment",
        true
    );

    // Outdoor temperature sensor control / Außentemperatur-Sensorsteuerung
    /*
    states = {};
    states[VlxDevConstants.C_CYC_OPT_NONE ] = TextMap["id_text_web_none"][language];  // Nicht verwendet
    states[VlxDevConstants.C_CYC_OPT_TEMP_OUTDOOR] = TextMap["id_text_web_opt_temp_sensor_mlv"][language]; // Geothermal heat control",
    states[VlxDevConstants.C_CYC_OPT_TEMP_EXTRACT] = TextMap["id_text_web_relay_mode_airheater"][language];// Air heating",
    state(vlxObjects,
        "A_CYC_OPT_TEMP_SENSOR_MODE",
        "state",
        states,
        "id_text_web_opt_temp_sensor_title",
        true
    );
    */

    // profiles
    createProfile(vlxObjects, "home");

    createProfile(vlxObjects, "away");

    createProfile(vlxObjects, "boost");

    createTimer(vlxObjects, "boost");

    number(vlxObjects,
        "A_CYC_FIREPLACE_SUPP_FAN",
        "level.speed",
        "id_text_list_supply_speed",
        "%",
        true,
        "profiles.fireplace"
    );

    number(vlxObjects,
        "A_CYC_FIREPLACE_EXTR_FAN",
        "level.speed",
        "id_text_list_extract_speed",
        "%",
        true,
        "profiles.fireplace"
    );

    createTimer(vlxObjects, "fireplace");

    return vlxObjects;
}

function createTimer(vlxObjects, profile) {

    number(vlxObjects,
        "A_CYC_" + profile.toUpperCase() + "_TIMER",
        "value",
        "Time left",
        "min",
        false,
        "profiles." + profile.toLowerCase()
    );
    number(vlxObjects,
        "A_CYC_" + profile.toUpperCase() + "_TIME",
        "level.timer",
        "id_text_value_name_duration",
        "min",
        true,
        "profiles." + profile.toLowerCase()
    );
    bool(vlxObjects,
        "A_CYC_" + profile.toUpperCase() + "_TIMER_ENABLED",
        "state.enabled",
        "id_text_enabled",
        true,
        "profiles." + profile.toLowerCase()
    );
}

function createProfile(vlxObjects, profile) {
    bool(vlxObjects,
        "A_CYC_" + profile.toUpperCase() + "_RH_CTRL_ENABLED",
        "state.enabled",
        "Humidity control enabled",
        true,
        "profiles." + profile.toLowerCase()
    );

    bool(vlxObjects,
        "A_CYC_" + profile.toUpperCase() + "_CO2_CTRL_ENABLED",
        "state.enabled",
        "CO2 control enabled",
        true,
        "profiles." + profile.toLowerCase()
    );

    number(vlxObjects,
        "A_CYC_" + profile.toUpperCase() + "_SPEED_SETTING",
        "level.speed",
        "id_text_value_name_fan_speed",
        "%",
        true,
        "profiles." + profile.toLowerCase()
    );

    number(vlxObjects,
        "A_CYC_" + profile.toUpperCase() + "_AIR_TEMP_TARGET",
        "level.temperature",
        "id_text_supply_air_degrees",
        "°C",
        true,
        "profiles." + profile.toLowerCase()
    );
}

class VlxObjectConfig {
    constructor(id, keys, processingFunc, obj, channel = "") {
        this.id = id;
        this.keys = keys;
        this.obj = obj;
        this.processingFunc = processingFunc;
        this.channel = channel;
    }
}

function bool(objects, key, role, textId, writable = false, channel = null) {
    objects.set(channel ? channel + "." + key : key, new VlxObjectConfig(key, [key], nothing, create_iobroker_object(key, role, "state", "boolean", [], writable, textId, ""), channel));
}

function number(objects, key, role, textId, unit, writable = false, channel = null) {
    objects.set(channel ? channel + "." + key : key, new VlxObjectConfig(key, [key], nothing, create_iobroker_object(key, role, "state", "number", [], writable, textId, unit), channel));
}

function state(objects, key, role, states, textId = "", writable = false, channel = null) {
    objects.set(channel ? channel + "." + key : key, createState(key, role, states, textId, writable));
}

function createState(key, role, states, textId = "", writable = false) {
    return new VlxObjectConfig(key, [key], nothing, create_iobroker_object(key, role, "state", "number", states, writable, textId));
}

function number_aggregate_conversion(objects, key, keys, role, textId, processingFunc) {
    objects.set(key, new VlxObjectConfig(key, keys, processingFunc, create_iobroker_object(key, role, "state", "number", [], false, textId)));
}

function number_conversion(objects, key, role, textId, processingFunc) {
    objects.set(key, new VlxObjectConfig(key, [key], processingFunc, create_iobroker_object(key, role, "state", "number", [], false, textId)));
}

function text_conversion(objects, key, keys, role, textId, processingFunc) {
    objects.set(key, new VlxObjectConfig(key, keys, processingFunc, create_iobroker_object(key, role, "state", "string", [], false, textId)));
}

function nothing(values) {
    return values[0];
}

function create_iobroker_object(id, role, type, dataType, states, writable, textId, unit) {
    let name = id;
    if (textId) {
        if (TextMap.hasOwnProperty(textId)) {
            name = TextMap[textId][language];
        } else {
            name = textId;
        }
    }
    return {
        type: type,
        common: {
            name: name,
            type: dataType,
            role: role,
            read: true,
            write: writable,
            unit: unit !== null ? unit : determine_unit(id),
            states: states
        },
        native: {}
    };
}

function determine_unit(key) {
    if (key.indexOf("_TEMP_") > 0 && key.indexOf("_MODE") < 0)
        return "°C";
    else if (key.indexOf("_RH_") > 0)
        return "%RH";
    else
        return "";
}


const VlxConfigs = init();
const ProfileConfig = profile();

module.exports = {
    VlxConfigs,
    ProfileConfig,
};
