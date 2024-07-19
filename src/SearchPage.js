import React, { useState } from "react";
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Toolbar from '@mui/material/Toolbar';
import TextField from '@mui/material/TextField';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Stack from '@mui/joy/Stack';



import { Avatar, Container, createTheme, ThemeProvider } from "@mui/material";

const theme = createTheme();


export default function SearchPage() {
    const [ip, setIp] = useState("");
    const [mib, setMib] = useState("");
    const [version, setVersion] = useState("");

    const handleIP = () => { };



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
             onSubmit={handleIP}>
                <TextField id="outlined-search" label="IP Address" type="search" />
                <TextField id="outlined-search" label="MIB" type="search" />
                <Stack spacing={2}>
                    <Select
                        placeholder="Select a version"
                        name="version"
                        required
                        sx={{ maxWidth: 200 }}
                    >
                        <Option value="V2c">V2c</Option>
                        <Option value="V3">V3</Option>
                    </Select>
                </Stack>
                <Button type="submit" fullWidth variant="contained" sx={{ mt: 1, mb: 1 }}>
                    Search
                </Button>
            </Box>
        </>
    );
}
