// Internal & 3rd party functional libraries
// Custom functional libraries
// Internal & 3rd party component libraries
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { Box, Slide, Snackbar, ThemeProvider, Alert, Checkbox, FormControl, FormControlLabel } from "@mui/material";
// Custom component libraries
import { theme } from "./overall-theme";
import { ThingClient } from './builtins/client/index';
import React, { createContext, useContext, useState } from "react";
import { AppSettingsType, defaultAppSettings } from "./builtins/app-settings";
import { useLocalStorage } from "./builtins/hooks";



export type PageProps = {
    settings : AppSettingsType
    updateSettings : React.Dispatch<React.SetStateAction<AppSettingsType>>
    showSettings : boolean
    setShowSettings : React.Dispatch<React.SetStateAction<boolean>> | Function
    showSidebar : boolean
    setShowSidebar : React.Dispatch<React.SetStateAction<boolean>> | Function
    updateLocalStorage : (value : AppSettingsType) => void
}

export const PageContext = createContext<any>({
    settings : defaultAppSettings,
    updateSettings : () => {},
    showSettings : false,
    setShowSettings : () => {},
    showSidebar : false,
    setShowSidebar : () => {},  
    updateLocalStorage : (_ : AppSettingsType) => {},
})

const App = () => {

    const [showSettings, setShowSettings] = useState<boolean>(false)
    const [showSidebar, setShowSidebar] = useState(false)

    const [_existingSettings, updateLocalStorage] = useLocalStorage('app-settings', defaultAppSettings)
    const [settings, updateSettings] = useState<AppSettingsType>(_existingSettings)
    
    const pageState = { settings, updateSettings, showSettings, setShowSettings, 
                    showSidebar, setShowSidebar, updateLocalStorage }

    return (   
        <ThemeProvider theme={theme}>      
            <PageContext.Provider value={pageState}>
                <ThingClient />
                <OnLoadMessage />
            </PageContext.Provider>
        </ThemeProvider>
    )
}


const OnLoadMessage = () => {

    const { settings, updateLocalStorage } = useContext(PageContext) as PageProps
    const [showWarningAgain, setShowWarningAgain] = useState(settings.showWebsiteWarningAgain);
    const [open, setOpen] = useState(showWarningAgain);

    const handleClose = (event?: React.SyntheticEvent, reason?: string) => {
        if (reason === 'clickaway') 
            return
        if (settings.useLocalStorage)             
            updateLocalStorage({ ...settings, showWebsiteWarningAgain: showWarningAgain })
        setOpen(false);
    };

    if (!settings.showWebsiteWarningAgain) 
        return null

    return (
        <Snackbar
            open={open}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
            <Alert onClose={handleClose} severity="warning" sx={{ width: '100%' }}>
                This website makes cross domain requests, therefore:
                <ul>
                    <li>credentials are not supported</li>
                    <li>check your server configuration for CORS headers and allow CORS on the browser</li>
                    <li>please do report security issues at the GitHub Repository</li>
                </ul>
                Please use it at your own risk. This website does not use cookies. <br />
                See sidebar for examples.
                {settings.useLocalStorage ?
                    <FormControlLabel 
                        label="Dont show this message again"
                        control={
                            <Checkbox size="small" 
                                onChange={(event) => setShowWarningAgain(!event.target.checked)}
                                />
                            }                
                        checked={!showWarningAgain}
                    /> : null
                }
            </Alert>
        </Snackbar>
    )
}



export default App



