// Internal & 3rd party functional libraries
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import axios from "axios";
// Custom functional libraries
// Internal & 3rd party component libraries
import { Grid, Typography, FormControlLabel, Switch, Divider, Box, InputLabel, FormControl, SelectChangeEvent, 
    OutlinedInput, InputAdornment, IconButton, Stack, Checkbox, Select, MenuItem, 
    Button, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText } from "@mui/material"
import * as IconsMaterial from '@mui/icons-material';
// Custom component libraries 
import { stringToObject } from "./utils";
import { toJS } from "mobx";
import { allowedConsoleFontSizes, allowedConsoleMaxEntries, allowedConsoleWindowSizes, 
        allowedLogIntervals } from "./client/output-components";
import { PageContext, PageProps } from "../App";
import { clear } from "console";
import { clearLocalStorage } from "./hooks";



type SettingsProps = {
    updateSettingsInStorage : (URL : string, settingName : string, value : any, event : React.BaseSyntheticEvent | any) => Promise<void>
}

const SettingsUpdateContext = createContext<SettingsProps | null>(null)


type SettingRowProps = {
    title : string 
    description? : string
    children : JSX.Element[] | JSX.Element
}

export const SettingRow = ( {title, description, children} : SettingRowProps) => {

    return (
        <Box sx={{ pl: 3, pb : 0, pt :0 }}>
            <Grid container direction='row' columns = {12}>
                <Grid item xs={0.5} >
                    <div id="left-to-title-desc-spacer"></div>
                </Grid>
                <Grid item xs={2.5}>
                    <Box sx={{ pl: 3, pr :3, pt: 0, pb : 0 }} >
                        <Stack>
                            <Typography fontSize={20} variant='overline'>{title}</Typography>
                            <Typography fontSize={14} variant='caption'>{description}</Typography>
                        </Stack>
                    </Box>
                </Grid>
                <Grid item xs={1} >
                    <div id="right-to-title-desc-spacer"></div>
                </Grid>
                <Grid item xs={5} >
                    {children}
                </Grid>
                <Grid item xs={10} sx={{ pt : 3, pb : 3  }} >
                    <Divider></Divider>
                </Grid>
            </Grid>
        </Box>
    )
}


const EditableTextSetting = observer(({ settingName, settingURL, initialValue, placeHolder, helperText } : 
    { settingName : string, settingURL : string, initialValue : string, placeHolder : string, helperText : string}) => {

    const { updateSettingsInStorage } = useContext(SettingsUpdateContext) as SettingsProps

    const [edit, setEdit] = useState<boolean>(false)
    const [value, setValue] = useState<string>(initialValue)

    useEffect(() =>
        setValue(initialValue)
    , [initialValue])
  
    return(
        <>
            <OutlinedInput
                size='small' 
                fullWidth 
                placeholder={placeHolder}
                sx={{ pl : 0 }}
                disabled={!edit}
                value={value}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setValue(event.target.value)}
                startAdornment = {
                    <InputAdornment position='start'>
                        {edit? 
                            <IconButton 
                                sx={{bgcolor : '#808080', borderRadius : 0 }}
                                onClick={async () =>  {
                                    await updateSettingsInStorage(settingURL, settingName, value, null)
                                    setEdit(!edit)
                                }}
                                >
                                <IconsMaterial.DoneOutlineTwoTone />
                            </IconButton>
                            :
                            <IconButton 
                                sx={{ bgcolor : '#808080', borderRadius : 0 }}
                                onClick={() => setEdit(true)}
                            >
                                <IconsMaterial.EditTwoTone />
                            </IconButton>
                        }
                    </InputAdornment>
                }
            />
            <Typography variant="caption" >{helperText}</Typography>
        </>
    )
})


const BooleanSwitchSetting = observer(({ label, initialValue, settingName, settingURL, tooltip } : 
    { label : string, initialValue : boolean, settingName : string, settingURL : string, tooltip: string }) => {

    const { updateSettingsInStorage } = useContext(SettingsUpdateContext) as SettingsProps
    const [checked, setChecked] = useState<boolean>(initialValue)

    useEffect(() =>
        setChecked(initialValue)
    , [initialValue])
    
    return (
        <Stack direction='row' >
            <FormControlLabel 
                id={label.replace(' ', '-')}
                label={label} 
                control={
                    <Switch 
                    checked={checked} 
                    onChange={async (event: React.ChangeEvent<HTMLInputElement>) => 
                        await updateSettingsInStorage(settingURL, settingName, event.target.checked, event)
                    }
                    />
                } 
            />         
            <IconButton onClick={() => alert(tooltip)} size="small">
                <IconsMaterial.Info />
            </IconButton>
        </Stack>
    )
})


// following only as an visual alternative
const BooleanCheckboxSetting = observer(({ label, initialValue, settingName, settingURL } : 
    { label : string, initialValue : boolean, settingName : string, settingURL : string }) => {

    const { updateSettingsInStorage } = useContext(SettingsUpdateContext) as SettingsProps
    const [checked, setChecked] = useState<boolean>(initialValue)
   
    useEffect(() =>
        setChecked(initialValue)
    , [initialValue])
    
    return (
        <FormControlLabel 
            id={label.replace(' ', '-')}
            label={label} 
            control={
                <Checkbox
                    checked={checked} 
                    onChange={async (event: React.ChangeEvent<HTMLInputElement>) => 
                        await updateSettingsInStorage(settingURL, settingName, event.target.checked, event)
                    }
                />
            } 
        />
    )
})



const SelectSetting = observer(( { label, initialValue, allowedValues, settingName, settingURL } : 
    { label : string, initialValue : any, allowedValues : any[], settingName : string, settingURL : string}) => {
    
    const { updateSettingsInStorage } = useContext(SettingsUpdateContext) as SettingsProps
    const [value, setValue] = useState(initialValue)

    useEffect(() => {
        setValue(initialValue)
    }, [initialValue]) 

    let id = label.replace(' ', '-')
    // mostly useState and useEffect is not necessary - can be removed someday

    const handleChange = useCallback(async(event : SelectChangeEvent) => {
        await updateSettingsInStorage(settingURL, settingName, event.target.value, event)
    }, [settingName, settingURL])

    return (
        <FormControl id={id+'-form'} >
            <InputLabel id={id+"-label"}>{label}</InputLabel>
            <Select
                id={id+"-seöect"}
                label={label}
                value={value}
                size="small"
                variant="standard"
                sx={{ width : 120 }}
                onChange={handleChange}
            >
                {allowedValues.map((value : string, index : number) => 
                    <MenuItem key={`$${id}-selector-${value}-at-pos-${index}`} value={value}>{value}</MenuItem>)}
            </Select>
        </FormControl>
    )
})



const ThingViewerSettings = () => {

    const { settings } = useContext(PageContext) as PageProps
    
    return (
        <Box>
            <Typography variant="button">Console</Typography>
            <Grid 
                id="remote-object-viewer-console-settings" spacing={3}
                container direction='row' sx={{ flexWrap: 'wrap', pt: 2, '& > *': { pb: 2 } }}
            >
                <Grid item>
                    <SelectSetting 
                        settingName="console.defaultFontSize"
                        settingURL="/remote-object-viewer"
                        label="Font Size"
                        initialValue={settings.console.defaultFontSize}
                        allowedValues={allowedConsoleFontSizes}
                    />
                </Grid>
                <Grid item>
                    <SelectSetting 
                        settingName="console.defaultWindowSize"
                        settingURL="/remote-object-viewer"
                        label="Window Size"
                        initialValue={settings.console.defaultWindowSize}
                        allowedValues={allowedConsoleWindowSizes}
                    />
                </Grid>
                <Grid item>
                    <SelectSetting 
                        settingName="console.defaultMaxEntries"
                        settingURL="/remote-object-viewer"
                        label="Max Entries"
                        initialValue={settings.console.defaultMaxEntries}
                        allowedValues={allowedConsoleMaxEntries}
                    />
                </Grid> 
                <Grid item>
                    <BooleanCheckboxSetting
                        settingName="console.stringifyOutput"
                        settingURL="/remote-object-viewer"
                        initialValue={settings.console.stringifyOutput}
                        label="stringify output"
                    />
                </Grid>
            </Grid>
        </Box>        
    )
}


const OtherSettings = () => {
    
    const { settings } = useContext(PageContext) as PageProps

    return (
        <Box>
            <Typography variant="button">Other Settings</Typography>     
            <Grid container direction='column' id="dashboards-settings" spacing={2} sx={{ pt : 2 }}>
                <Grid item>
                    <SelectSetting
                        settingName="tabOrientation"
                        settingURL="/thing-viewer"
                        initialValue={settings.tabOrientation}
                        label="tab orientation"
                        allowedValues={["horizontal", "vertical"]}
                    />
                </Grid>
                <Grid item>
                    <Box sx={{ maxWidth : 500 }}>
                        <EditableTextSetting 
                            settingName="defaultEndpoint"
                            settingURL="/thing-viewer"
                            initialValue={settings.defaultEndpoint}
                            placeHolder="default endpoint for fetching thing description"
                            helperText="default endpoint for fetching thing description in addition to the main server URL which is entered in the URL input"
                        />
                    </Box>
                </Grid>
                <Grid item>
                    <BooleanSwitchSetting 
                        settingName="allowUndocking"
                        settingURL="/thing-viewer"
                        label="allow undocking of components"
                        initialValue={settings.allowUndocking}
                        tooltip={`Shows an icon which can undock/redock certain parts of the UI`}
                    />
                </Grid>
                {/* <Grid item> uncomment later, must work
                    <BooleanSwitchSetting 
                        settingName="autoSaveChanges"
                        settingURL="/thing-viewer"
                        label="auto save changes"
                        initialValue={settings.autoSaveChanges}
                        tooltip="auto save changes made to the same settings from else where in the app"
                    />
                </Grid> */}
                
                <Grid item>
                    <BooleanSwitchSetting 
                        settingName="useLocalStorage"
                        settingURL="/thing-viewer"
                        label="use local storage"
                        initialValue={settings.useLocalStorage}
                        tooltip={
                            `uses your browser's local storage to save settings and app data (like saved links to thing descriptions) 
                            permanently, nothing is transferred or stored somewhere else.
                            If you do not enable this, all settings and app data will be lost on page refresh.`.replace(/\s+/g, ' ')
                        }
                    />
                </Grid>

            </Grid>
        </Box>
    )
}


const updateNestedSetting = (obj: any, keys: string[], value: any) => {
    const key = keys.shift();
    if (key && keys.length > 0) {
        if (!obj[key]) {
            obj[key] = {};
        }
        updateNestedSetting(obj[key], keys, value);
    } else if (key) {
        obj[key] = value;
    }
};


const ClearLocalStorageButton = () => {

    const [open, setOpen] = useState(false);

    const handleClearLocalStorage = () => {
        clearLocalStorage();
        setOpen(false);
    };

    return (
        <>
            <Button 
                sx={{ alignSelf: 'flex-start' }}
                onClick={() => setOpen(true)}
                variant='contained'    
                color='warning'
            >
                Clear Local Storage 2
            </Button>
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
            >
                <DialogTitle>Confirm</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to clear local storage?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleClearLocalStorage} color="warning">
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}


export const AppSettings = ( { globalState } : { globalState : any }) => {

    const { settings, updateSettings, updateLocalStorage } = useContext(PageContext) as PageProps

    const updateSettingsInStorage = useCallback(async(URL : string, settingName : string, value : any, 
                                                event : React.BaseSyntheticEvent | any) => {
            
        if(event)
            event.preventDefault()
        if (globalState) {
            try {   
                const response = await axios.patch(
                                `${globalState.primaryHostServer}/app-settings${URL}`, 
                                stringToObject(settingName.split('.').slice(1).join('.'), value, {}), 
                                { withCredentials : true }
                            )
                if(response.status === 200) 
                    globalState.updateSetting(settingName, value)
                console.log("app setting updated", toJS(settings))
            } catch (error) {

            }
        }
        else {
            const settingKeys = settingName.split('.');
            // console.log(settingKeys)
            updateNestedSetting(settings, settingKeys, value);
            // console.log("app setting updated", toJS(settings))
            updateSettings(JSON.parse(JSON.stringify(settings)))
            updateLocalStorage(settings)
        }
    }, [globalState, settings, updateSettings, updateLocalStorage])

    return (
        <Grid container direction = 'column' sx={{ flexWrap: 'nowrap' }}>
            <SettingsUpdateContext.Provider value={{ updateSettingsInStorage }}>
                <Stack sx={{p : 1, pl: {sm: 10, xs: 2}  }} direction='column' spacing={3}>
                    <ThingViewerSettings />
                    <OtherSettings />
                    {/* <LoginPageSettings />  */}
                    <ClearLocalStorageButton />
                </Stack>
            </SettingsUpdateContext.Provider>
        </Grid>
    )
}


export type AppSettingsType = {
    tabOrientation : "horizontal" | "vertical",
    autoSaveChanges : boolean,
    useLocalStorage : boolean,
    showWebsiteWarningAgain : boolean,
    defaultEndpoint : string,
    allowUndocking : boolean,
    windowZoom : number,
    login : {
        displayFooter : boolean
        footer : string
        footerLink : string
    }
    console : {
        stringifyOutput : boolean 
        defaultMaxEntries : number 
        defaultWindowSize : number
        defaultFontSize : number
    }
    logViewer : {
        defaultMaxEntries : number 
        defaultWindowSize : number
        defaultFontSize : number
        defaultInterval : number
    }
}

export const defaultAppSettings : AppSettingsType = {
    tabOrientation : window.innerWidth < 600 ? "horizontal" : "vertical",
    autoSaveChanges : false,
    useLocalStorage : false,
    windowZoom : 100,
    showWebsiteWarningAgain : true,
    defaultEndpoint : "",
    allowUndocking : false,
    login : {
        displayFooter : true,
        footer : "",
        footerLink : ""
    },
    console : {
        stringifyOutput : false,
        defaultMaxEntries : 10,
        defaultWindowSize : 500,
        defaultFontSize : 16,
    },
    logViewer : {
        defaultMaxEntries : 10,
        defaultWindowSize : 500,
        defaultFontSize : 16,
        defaultInterval : 2
    }
}
