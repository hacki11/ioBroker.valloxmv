const path = require("path");
const {tests} = require("@iobroker/testing");
const { Vallox } = require("./ValloxMock");

// Run integration tests - See https://github.com/ioBroker/testing for a detailed explanation and further options
tests.integration(path.join(__dirname, ".."), {
    allowedExitCodes: [0],
    additionalMockedModules: {
        "@danielbayerlein/vallox-api": Vallox
    }
});
