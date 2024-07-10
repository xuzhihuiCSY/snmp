const snmp = require('net-snmp');

class SNMPManager {
    constructor(community, version) {
        this.community = community;
        this.version = version;
    }

    createSession(target) {
        return snmp.createSession(target, this.community, { version: this.version });
    }

    get(target, oid, callback) {
        const session = this.createSession(target);
        session.get([oid], (error, varbinds) => {
            session.close();
            callback(error, varbinds);
        });
    }

    getNext(target, oid, callback) {
        const session = this.createSession(target);
        session.getNext([oid], (error, varbinds) => {
            session.close();
            callback(error, varbinds);
        });
    }

    getBulk(target, oids, nonRepeaters, maxRepetitions, callback) {
        const session = this.createSession(target);
        session.getBulk(oids, nonRepeaters, maxRepetitions, (error, varbinds) => {
            session.close();
            callback(error, varbinds);
        });
    }

    set(target, varbind, callback) {
        const session = this.createSession(target);
        session.set([varbind], (error, varbinds) => {
            session.close();
            callback(error, varbinds);
        });
    }
}

module.exports = SNMPManager;
