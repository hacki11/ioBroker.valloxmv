"use strict";

/*
 * Created with @iobroker/create-adapter v1.11.0
 */
const Vallox = require("@danielbayerlein/vallox-api");
const utils = require("@iobroker/adapter-core");
const {VlxConfigs} = require("./lib/config");

class Valloxmv extends utils.Adapter {

    /**
     * @param {Partial<ioBroker.AdapterOptions>} [options={}]
     */
    constructor(options) {
        super({
            ...options,
            name: "valloxmv",
        });

        this.keys = [];
        for (let [key, val] of VlxConfigs) {
            this.keys = this.keys.concat(val.keys);
        }

        this.on("ready", this.onReady.bind(this));
        this.on("objectChange", this.onObjectChange.bind(this));
        this.on("stateChange", this.onStateChange.bind(this));
        // this.on("message", this.onMessage.bind(this));
        this.on("unload", this.onUnload.bind(this));
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    async onReady() {

        this.log.info(`Establish connection to ValloxMV (${this.config.host}:${this.config.port})`);

        this.client = new Vallox({ip: this.config.host, port: this.config.port});
        // fetch a metric to check connection
        this.client.fetchMetric('A_CYC_APPL_SW_VERSION');

        this.log.info("Connected successfully");
        this.setState("info.connection", true);

        for (let [key, val] of VlxConfigs) {
            await this.setObjectAsync(key, val.obj);
        }

        // in this template all states changes inside the adapters namespace are subscribed
        this.subscribeStates("*");

        // setup polltimer
        this.pollInterval = this.config.interval || 60;
        this.pollInterval *= 1000;
        if (this.pollInterval < 10000)
            this.pollInterval = 10000;

        this.polltimer = setInterval(() => this.update(), this.pollInterval);

        this.update();
    }

    update() {
        this.client.fetchMetrics(this.keys)
            .then((result) => this.setStates(result))
            .catch((error) => this.errorHandler(error));
    }

    setStates(result) {
        for (let [key, vlxConfig] of VlxConfigs) {

            let values = Object.keys(result)
                .filter((key) => vlxConfig.keys.includes(key))
                .map((key) => result[key]);

            let value = vlxConfig.processingFunc(values);

            this.setStateAsync(key, {val: value, ack: true})
                .catch((error) => this.errorHandler(error));
        }
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     * @param {() => void} callback
     */
    onUnload(callback) {
        try {
            clearInterval(this.polltimer);
            this.log.info("cleaned everything up...");
            callback();
        } catch (e) {
            callback();
        }
    }


    /**
     * Is called if a subscribed object changes
     * @param {string} id
     * @param {ioBroker.Object | null | undefined} obj
     */
    onObjectChange(id, obj) {
        if (obj) {
            // The object was changed
            this.log.debug(`object ${id} changed: ${JSON.stringify(obj)}`);
        } else {
            // The object was deleted
            this.log.info(`object ${id} deleted`);
        }
    }

    /**
     * Is called if a subscribed state changes
     * @param {string} id
     * @param {ioBroker.State | null | undefined} state
     */
    onStateChange(id, state) {
        if (state) {
            // The state was changed
            this.log.debug(`state ${id} changed: ${state.val} (ack = ${state.ack})`);

            if (this.client && state && !state.ack) {
                let arr = id.split(".");
                id = arr[arr.length - 1];
                if (VlxConfigs.hasOwnProperty(id)) {

                    let obj = {};
                    obj[VlxConfigs[id].keys[0]] = state.val;
                    this.client.setValues(obj)
                        .catch((error) => this.errorHandler(error));
                }
            }
        } else {
            // The state was deleted
            this.log.info(`state ${id} deleted`);
        }
    }

    errorHandler(error) {
        this.log.error(error.message);
        this.log.error(error.stack);
        this.setState("info.connection", false);
    }

    // /**
    //  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
    //  * Using this method requires "common.message" property to be set to true in io-package.json
    //  * @param {ioBroker.Message} obj
    //  */
    // onMessage(obj) {
    // 	if (typeof obj === "object" && obj.message) {
    // 		if (obj.command === "send") {
    // 			// e.g. send email or pushover or whatever
    // 			this.log.info("send command");

    // 			// Send response in callback if required
    // 			if (obj.callback) this.sendTo(obj.from, obj.command, "Message received", obj.callback);
    // 		}
    // 	}
    // }

}

if (module.parent) {
    // Export the constructor in compact mode
    /**
     * @param {Partial<ioBroker.AdapterOptions>} [options={}]
     */
    module.exports = (options) => new Valloxmv(options);
} else {
    // otherwise start the instance directly
    new Valloxmv();
}