import React, { useState, useEffect } from "react";
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Toolbar from '@mui/material/Toolbar';
import TextField from '@mui/material/TextField';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Stack from '@mui/joy/Stack';
import { data } from "autoprefixer";



export default function SearchPage() {
    const [ip, setIp] = useState("");
    const [mib, setMib] = useState("");
    const [ipEmpty, setIPEmpty] = useState(true);
    const [mibEmpty, setMibEmpty] = useState(true);
    const [version, setVersion] = useState("");
    const [device, setDevice] = useState([]);

    const IPInput = (value) => {
        if(value !== ""){
            setIp(value);
            setIPEmpty(false);
        }
    };

    const MibInput = (value) => {
        if(value !== ""){
            setMib(value);
            setMibEmpty(false);
        }
    };

    const handleVersion = (event) => {
        setVersion(event.target.value);
    };

    const handleSubmit = () => { };

    const getDevice = () => {
        fetch("http://localhost:5000/snmp/search/ip", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ip })
        })
            .then(res => res.json())
            .then(data => {
                console.log(data)
            })
    };

    useEffect(() => {
        getDevice();
    }, [])

    return (
        <>
            <Toolbar>
                <Typography component="h3" variant="h3">
                    SNMP Network Device Management System
                </Typography>
            </Toolbar>
            <Box component="form"
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
                onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="ipAddress"
                            name="ipAddress"
                            label="IP Address"
                            type="search"
                            onChange={(e) => IPInput(e.target.value)}
                        />
                        {ipEmpty ? <div style={{ color: 'red' }}>IP Address required!</div> : ''}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="mib"
                            name="mib"
                            label="MIB"
                            type="search"
                            onChange={(e) => MibInput(e.target.value)}
                        />
                        {mibEmpty ? <div style={{ color: 'red' }}>MIB required!</div> : ''}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Stack spacing={2}>
                            <Select
                                placeholder="Select a version"
                                name="version"
                                required
                                sx={{ maxWidth: 200 }}
                                onChange={handleVersion}
                            >
                                <Option value="V2c">V2c</Option>
                                <Option value="V3">V3</Option>
                            </Select>
                        </Stack>
                    </Grid>
                </Grid>
                {/* <TextField id="outlined-search" label="IP Address" type="search" />
                <TextField id="outlined-search" label="MIB" type="search" /> */}
                <Button type="submit" fullWidth variant="contained" sx={{ mt: 1, mb: 1 }}>
                    Search
                </Button>
                <div>
                    { }
                </div>
            </Box>
        </>
    );
}
