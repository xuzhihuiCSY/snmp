const snmp = require('net-snmp');

class SNMPManager {
    constructor(community, version) {
        this.community = community;
        this.version = version;
    }

    createSession(target) {
        return snmp.createSession(target, this.community, { version: this.version });
    }

    get(target, oid) {
        const session = this.createSession(target);
        session.get([oid], (error, varbinds) => {
            if (error) {
                console.error("SNMP GET request failed:", error.toString());
            } else {
                varbinds.forEach(varbind => {
                    if (snmp.isVarbindError(varbind)) {
                        console.error("Varbind Error:", snmp.varbindError(varbind));
                    } else {
                        console.log("OID:", varbind.oid, "Value:", varbind.value.toString());
                    }
                });
            }
        });
        session.close();
    }

    getNext(target, oid) {
        const session = this.createSession(target);
        session.getNext([oid], (error, varbinds) => {
            if (error) {
                console.error("Error:", error.toString());
            } else {
                varbinds.forEach(varbind => {
                    if (snmp.isVarbindError(varbind)) {
                        console.error("Varbind Error:", snmp.varbindError(varbind));
                    } else {
                        oid = varbind.oid;
                        console.log("OID:", varbind.oid, "Value:", varbind.value.toString());
                        if (oid.startsWith("1.3.6.1.2.1.2.2.1")) {
                            getNextOid(); // Continue walking the ifTable
                        } else {
                            session.close();
                        }
                    }
                });
            }
        });
    }

    getBulk(target, oids, nonRepeaters, maxRepetitions) {
        const session = this.createSession(target);
        session.getBulk(oids, nonRepeaters, maxRepetitions, (error, varbinds) => {
            session.close();
            callback(error, varbinds);
        });
    }

    set(target, varbind) {
        const session = this.createSession(target);
        session.set([varbind], (error, varbinds) => {
            if (error) {
                console.error("SNMP SET request failed:", error.toString());
            } else {
                varbinds.forEach(varbind => {
                    if (snmp.isVarbindError(varbind)) {
                        console.error("Varbind Error:", snmp.varbindError(varbind));
                    } else {
                        console.log("Successfully set OID " + varbind.oid + " to value " + varbind.value);
                    }
                });
            }
            session.close();
        });
    }
}

module.exports = SNMPManager;
