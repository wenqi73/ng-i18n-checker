module.exports = class NullReporter {
    report () {
        return Promise.resolve();
    }
}
