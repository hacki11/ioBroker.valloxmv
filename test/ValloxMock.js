class Vallox {
    constructor() {}

    async getProfile() {
        return 1;
    }

    async fetchMetric(key) {
        return 0;
    }

    async fetchMetrics(keys) {
        let result = [];
        for(let key in keys) {
            result[key] = 0;
        }
        return result;
    }
}

module.exports = {
    Vallox
};