import React, { useState } from "react";
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Dropdown from '@mui/joy/Dropdown';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';
import '@fontsource/inter';

import { Avatar, Container, createTheme, ThemeProvider } from "@mui/material";

const theme = createTheme();

export default function SearchPage() {
    const [ip, setIp] = useState("");
    const [mib, setMib] = useState("");
    const [version, setVersion] = useState("");

    const handleIP = () => { };



    return (
        <ThemeProvider theme={theme}>
            <Container component="main" maxWidth="100%">
                <CssBaseline />
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: "100%"
                    }}
                >
                    <Typography component="h3" variant="h3">
                        SNMP Network Device Management System
                    </Typography>
                    <Box component="form" noValidate onSubmit={handleIP} sx={{ mt: 3 }}>
                        <TextField id="outlined-search" label="Search field" type="search" />
                        <TextField id="outlined-search" label="Search field" type="search" />
                    </Box>
                </Box>
            </Container>
        </ThemeProvider>
    );
}
