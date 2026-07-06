'use strict';

/*
 * Created with @iobroker/create-adapter v2.6.5
 */
const Vallox = require('@danielbayerlein/vallox-api');
const utils = require('@iobroker/adapter-core');
const { VlxConfigs, ProfileConfig } = require('./lib/config');
const { URL } = require('node:url');

class Valloxmv extends utils.Adapter {
    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    constructor(options) {
        super({
            ...options,
            name: 'valloxmv',
        });

        this.keys = [];
        for (const [key, val] of VlxConfigs) {
            this.keys = this.keys.concat(val.keys);
        }

        this.on('ready', this.onReady.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    async onReady() {
        this.log.info(`Establish connection to ValloxMV (${this.config.host}:${this.config.port})`);

        this.client = new Vallox({ ip: this.config.host, port: this.config.port });

        await this.setObjectNotExistsAsync(ProfileConfig.id, ProfileConfig.obj);
        for (const [key, val] of VlxConfigs) {
            await this.setObjectNotExistsAsync(key, val.obj);
        }

        // Add AUTO state for vallox firmware 3.1.4
        await this.addAutoState();

        this.subscribeStates('*');

        // setup timer
        this.interval = Number(this.config.interval);
        if (!Number.isFinite(this.interval) || this.interval <= 0) {
            this.interval = 60;
        }
        this.interval = Math.floor(this.interval) * 1000;
        if (this.interval < 10000) {
            this.interval = 10000;
        }

        Valloxmv.validateConfig(this.config)
            .then(() => this.update())
            .catch(error => this.errorHandler(error));
    }

    async addAutoState() {
        const obj = await this.getObjectAsync(ProfileConfig.id);
        const autoState = ProfileConfig.obj.common.states?.[0];

        if (!obj?.common || autoState === undefined) {
            return;
        }

        const states = obj.common.states;
        if (!states || Object.prototype.hasOwnProperty.call(states, '0')) {
            return;
        }

        obj.common.states = {
            0: autoState,
            ...states,
        };

        obj.common.min = 0;

        await this.setObject(ProfileConfig.id, obj);
    }

    update() {
        this.client
            .getProfile()
            .then(result => this.setProfile(result))
            .catch(error => this.errorHandler(error));

        this.client
            .fetchMetrics(this.keys)
            .then(result => this.setStates(result))
            .then(() => this.connectionHandler(true))
            .catch(error => this.errorHandler(error));

        this.timer = setTimeout(() => this.update(), this.interval);
    }

    setProfile(result) {
        this.currentProfile = result;
        this.setState(ProfileConfig.id, { val: result, ack: true }).catch(error => this.errorHandler(error));
    }

    setStates(result) {
        for (const [key, vlxConfig] of VlxConfigs) {
            const values = Object.keys(result)
                .filter(key => vlxConfig.keys.includes(key))
                .map(key => result[key]);

            const value = vlxConfig.processingFunc(values);

            this.setState(key, { val: value, ack: true }).catch(error => this.errorHandler(error));
        }
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     * @param {() => void} callback
     */
    onUnload(callback) {
        try {
            clearTimeout(this.timer);
            this.log.info('cleaned everything up...');
            callback();
        } catch (e) {
            callback();
        }
    }

    /**
     * Is called if a subscribed state changes
     * @param {string} id
     * @param {ioBroker.State | null | undefined} state
     */
    async onStateChange(id, state) {
        if (state) {
            // The state was changed
            this.log.debug(`state ${id} changed: ${state.val} (ack = ${state.ack})`);

            if (this.client && state && !state.ack) {
                const adapter = id.indexOf('.');
                const instance = id.indexOf('.', adapter + 1);
                id = id.substr(instance + 1);
                if (id === ProfileConfig.id) {
                    if (Number(state.val) === 0 && !(await this.isAutoProfileSupported())) {
                        this.log.warn(
                            'AUTO profile requires firmware version 3.1.4 or newer. Reverting requested profile change.',
                        );
                        await this.undoProfileChange();
                        return;
                    }

                    this.client.setProfile(state.val).catch(error => this.errorHandler(error));
                } else {
                    if (VlxConfigs.has(id)) {
                        const obj = {};
                        obj[VlxConfigs.get(id).keys[0]] = state.val;
                        this.client.setValues(obj).catch(error => this.errorHandler(error));
                    }
                }
            }
        } else {
            // The state was deleted
            this.log.info(`state ${id} deleted`);
        }
    }

    errorHandler(error) {
        this.log.error(error.message);
        if (error.stack) {
            this.log.error(error.stack);
        }
        this.connectionHandler(false);
    }

    async isAutoProfileSupported() {
        const firmware = await this.getStateAsync('A_CYC_APPL_SW_VERSION');
        return Valloxmv.compareVersions(firmware?.val, '3.1.4') >= 0;
    }

    async undoProfileChange() {
        const profile = await this.client.getProfile();
        this.currentProfile = profile;
        await this.setState(ProfileConfig.id, { val: profile, ack: true });
    }

    connectionHandler(connected) {
        if (this.connection !== connected) {
            this.connection = connected;
            if (connected) {
                this.log.info('Connection established successfully');
            } else {
                this.log.error('Connection failed');
            }

            this.setState('info.connection', { val: this.connection, ack: true });
        }
    }

    static async validateConfig(config) {
        new URL(`ws://${config.host}:${config.port}`);
    }

    static compareVersions(left, right) {
        const leftParts = String(left)
            .split('.')
            .map(part => Number.parseInt(part, 10));
        const rightParts = String(right)
            .split('.')
            .map(part => Number.parseInt(part, 10));
        const length = Math.max(leftParts.length, rightParts.length);

        for (let i = 0; i < length; i++) {
            const leftPart = Number.isFinite(leftParts[i]) ? leftParts[i] : -1;
            const rightPart = Number.isFinite(rightParts[i]) ? rightParts[i] : -1;

            if (leftPart !== rightPart) {
                return leftPart - rightPart;
            }
        }

        return 0;
    }
}

if (require.main !== module) {
    // Export the constructor in compact mode
    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    module.exports = options => new Valloxmv(options);
} else {
    // otherwise start the instance directly
    new Valloxmv();
}
