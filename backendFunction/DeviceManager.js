const SNMPManager = require('./SNMPManager');

class DeviceManager {
    constructor(community, version) {
        this.snmpManager = new SNMPManager(community, version);
    }

    getDeviceInfo(target, oid) {
        this.snmpManager.get(target, oid, (error, varbinds) => {
            if (error) {
                console.error("Get device information failed:", error.toString());
            }
            const info = {
                description: varbinds[0].value.toString()
            };
            callback(null, info);
        });
    }

    getNextDeviceInfo(target, oid) {
        this.snmpManager.getNext(target, oid, (error, varbinds) => {
            if (error) {
                console.error("Get next device information failed:", error.toString());
            }
            const info = {
                description: varbinds[0].value.toString()
            };
            callback(null, info);
        });
    }

    getBulkDeviceInfo(target, oids, nonRepeaters, maxRepetitions) {
        this.snmpManager.getBulk(target, oids, nonRepeaters, maxRepetitions, (error, varbinds) => {
            if (error) {
                return callback(error);
            }
            const info = varbinds.map(vb => vb.value.toString());
            callback(null, info);
        });
    }

    setDeviceInfo(target, oid, type, value) {
        const varbind = {
            oid: oid,
            type: type,
            value: value
        };
        this.snmpManager.set(target, varbind, (error, varbinds) => {
            if (error) {
                console.error("Set device information failed:", error.toString());
            }
            callback(null, varbinds);
        });
    }
}

module.exports = DeviceManager;
