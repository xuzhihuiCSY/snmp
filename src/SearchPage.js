import React, {useState} from "react";

export default function SeerchPage(){
    const [ip, setIp] = useState("");
    const [mib, setMib] = useState("");

    const IPhandleer = () => {};

    return (
        <>
            <h1>SWNMP Network Device Management System</h1>
            <div>
                <input type="text" />
                <button>search</button>
            </div>
        </>
    );
}