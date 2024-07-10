const SNMPManager = require('./SNMPManager');

class DeviceManager {
    constructor(community, version) {
        this.snmpManager = new SNMPManager(community, version);
    }

    getDeviceInfo(target, oid, callback) {
        this.snmpManager.get(target, oid, (error, varbinds) => {
            if (error) {
                return callback(error);
            }
            const info = {
                description: varbinds[0].value.toString()
            };
            callback(null, info);
        });
    }

    getNextDeviceInfo(target, oid, callback) {
        this.snmpManager.getNext(target, oid, (error, varbinds) => {
            if (error) {
                return callback(error);
            }
            const info = {
                description: varbinds[0].value.toString()
            };
            callback(null, info);
        });
    }

    getBulkDeviceInfo(target, oids, nonRepeaters, maxRepetitions, callback) {
        this.snmpManager.getBulk(target, oids, nonRepeaters, maxRepetitions, (error, varbinds) => {
            if (error) {
                return callback(error);
            }
            const info = varbinds.map(vb => vb.value.toString());
            callback(null, info);
        });
    }

    setDeviceInfo(target, oid, type, value, callback) {
        const varbind = {
            oid: oid,
            type: type,
            value: value
        };
        this.snmpManager.set(target, varbind, (error, varbinds) => {
            if (error) {
                return callback(error);
            }
            callback(null, varbinds);
        });
    }
}

module.exports = DeviceManager;
