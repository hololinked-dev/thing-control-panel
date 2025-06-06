// Internal & 3rd party functional libraries
import {  useState, useEffect, useRef, useCallback, useContext } from "react";
import { observer } from "mobx-react-lite";
import { AxiosResponse } from "axios";
// Custom functional libraries
// Internal & 3rd party component libraries
import { Box, Button, FormControl, InputLabel, Select, Stack,
    Typography, MenuItem, ButtonGroup,  Divider, Checkbox, IconButton } from "@mui/material"
import OpenInNewTwoToneIcon from '@mui/icons-material/OpenInNewTwoTone';
import DownloadIcon from '@mui/icons-material/Download';
import CallReceivedTwoToneIcon from '@mui/icons-material/CallReceivedTwoTone';
import OpenInBrowserTwoToneIcon from '@mui/icons-material/OpenInBrowserTwoTone';
import { Console, Hook, Unhook } from 'console-feed-optimized'
// Custom component libraries 
import { downloadJSON, openJSONinNewTab, asyncRequest } from "../utils";
import { LogTable, LogDataType, useRemoteObjectLogColumns } from "../log-viewer/log-viewer";
import { ErrorViewer } from "../reuse-components";
import NewWindow from "react-new-window";
import { ThingContext } from "./index";
import { PageContext, PageProps } from "../../App";
import { Thing } from "./state";



export const allowedConsoleFontSizes = ["6", "8", "10", "12", "14", "16", "18", "20", "22", "24", "26", "28", "30"]
export const allowedConsoleWindowSizes = ["100", "200", "300", "400", "500", "700", "1000", "2000", "5000", "10000"]
export const allowedConsoleMaxEntries  = ["5", "10", "15", "20", "25", "50", "100", "200", "500", "show all"]

export const UndockableConsole = observer(() => {

    const thing = useContext(ThingContext) as Thing
    const { settings, updateLocalStorage } = useContext(PageContext) as PageProps

    const [consoleOutputFontSize, setConsoleOutputFontSize] = useState<string>
                    (settings.console.defaultFontSize.toString())
    const [consoleWindowSize, setConsoleWindowSize] = useState<string>
                    (settings.console.defaultWindowSize.toString())
    const [consoleMaxEntries, setConsoleMaxEntries] = useState<string>
                    (settings.console.defaultMaxEntries.toString())
    const [stringifyOutput, setStringifyOutput] = useState<boolean>
                    (settings.console.stringifyOutput)
    // return values from python server side
    const [consoleEntries, setConsoleEntries] = useState([])
    const [undock, setUndock] = useState<boolean>(false)
   
    const handleFontSizeChange = useCallback((event: any) => {
        setConsoleOutputFontSize(event.target.value as string);
        if(settings.autoSaveChanges) {
            settings.console.defaultFontSize = event.target.value
            updateLocalStorage(settings)
        }
    }, [settings, updateLocalStorage])

    const handleWindowSizeChange = useCallback((event: any) => {
        setConsoleWindowSize(event.target.value as string);
        if(settings.autoSaveChanges) {
            settings.console.defaultWindowSize = event.target.value
            updateLocalStorage(settings)
        }
    }, [settings, updateLocalStorage])
    
    const handleMaxEntries = useCallback((event: any) => {
        setConsoleMaxEntries(event.target.value);
        if(settings.autoSaveChanges) {
            settings.console.defaultMaxEntries = event.target.value
            updateLocalStorage(settings)
        }
    }, [settings, updateLocalStorage])

    const handleStringify = useCallback((event: any) => {
        setStringifyOutput(event.target.checked);
        if(settings.autoSaveChanges) {
            settings.console.stringifyOutput = event.target.checked
            updateLocalStorage(settings)
        }
    }, [settings, updateLocalStorage])

    const clearOutput = useCallback(()=> {
        thing.resetError()
        setConsoleEntries([])
    }, [])

    const openLastResponseInNewTab = useCallback(() => {
        openJSONinNewTab(thing.lastResponse, `Last Response`)
    }, [])
    
    const downloadLastResponse = useCallback(() => {
        thing.lastResponse? 
            downloadJSON(thing.lastResponse, 'last-response.json') : 
            console.log("no valid response to download")  
    }, [])

    const openResponseInNewTab = useCallback(() => {
        openJSONinNewTab(consoleEntries, `All Console Entries`)
    }, [consoleEntries])
    
    const downloadResponse = useCallback(() => {
        consoleEntries? 
            downloadJSON(consoleEntries, 'last-response.json') : 
            console.log("no valid response to download")  
    }, [consoleEntries])
    
    useEffect(() => {
        const hookedConsole = Hook(
            window.console,
            // dont understand fully the types in the following
            // @ts-ignore 
            (ret) => setConsoleEntries((currValue : any) => {
                if(consoleMaxEntries === "show all")
                    return [ret, ...currValue]
                else if (currValue.length < Number(consoleMaxEntries))
                    return [ret, ...currValue]
                else 
                    return [ret, 
                    ...currValue.slice(0, currValue.length-1) ]
            }),
            false
        )
        return () => {Unhook(hookedConsole)}
    }, [consoleMaxEntries]) 

    
    return(
        <Stack id="client-output-console-box" sx={{ pt : 1 }}>
            <Divider id="client-output-console-title">
                <Typography variant="button" color="GrayText">OUTPUT</Typography>
            </Divider>
            <Stack 
                id="console-window-options-layout" 
                direction="row" 
                sx={{ 
                    pb: 1, flexGrow: 1, display: 'flex', overflowX: 'scroll',
                    scrollbarWidth: "none", // Firefox
                    "&::-webkit-scrollbar": {
                      display: "none", // Chrome, Safari
                    },
                  }}
                spacing={0.5}
            >
                {settings.allowUndocking? undock? 
                    <IconButton size="medium" sx={{ borderRadius : 0 }} onClick={() => setUndock(false)}>
                        <CallReceivedTwoToneIcon fontSize="medium"/>
                    </IconButton>
                    : 
                    <IconButton size="medium" sx={{ borderRadius : 0 }} onClick={() => setUndock(true)}>
                        <OpenInBrowserTwoToneIcon fontSize="medium"/>
                    </IconButton>
                    : null
                }
                <Button 
                    id='console-window-clear-button'
                    variant='outlined' 
                    onClick={clearOutput}
                    sx={{ borderColor : 'GrayText' }}
                >
                    Clear Output
                </Button>
                <Stack direction="row">
                    <ButtonGroup> 
                        <Button variant="text" disabled>
                            Last Response
                        </Button>                
                        <IconButton 
                            onClick={openLastResponseInNewTab} 
                            size="medium" 
                            sx={{ borderRadius : 0 }}
                        >
                            <OpenInNewTwoToneIcon fontSize="medium"/> 
                        </IconButton>
                        <IconButton 
                            onClick={downloadLastResponse} 
                            size="medium" 
                            sx={{ borderRadius : 0 }}
                        >
                            <DownloadIcon fontSize="medium"/> 
                        </IconButton>
                    </ButtonGroup>
                </Stack>
                <Stack direction="row">
                    <Button variant="text" disabled>
                        CONSOLE ENTRIES
                    </Button>    
                    <IconButton onClick={openResponseInNewTab} size="medium" sx={{ borderRadius : 0 }}>
                        <OpenInNewTwoToneIcon fontSize="medium"/> 
                    </IconButton>
                    <IconButton onClick={downloadResponse} size="medium" sx={{ borderRadius : 0 }}>
                        <DownloadIcon fontSize="medium"/> 
                    </IconButton>
                </Stack>
                <Stack direction="row">
                    <Button variant="text" disabled>
                        Stringify Output
                    </Button>   
                    <Checkbox
                        id='console-window-stringify-output-checkbox'
                        size="small"
                        checked={stringifyOutput}
                        onChange={handleStringify}
                        sx={{ borderRadius : 0 }}
                    />
                </Stack>
                <Stack direction="row" spacing={2} sx={{ pt: { xs: 1.25, md: 0.75 } }} >
                    <FormControl id='console-window-font-size-form'>
                        <InputLabel id="console-window-font-size-selector-label">Font Size</InputLabel>
                        <Select
                            id="console-window-font-size-selector"
                            label="Font Size"
                            size="small"
                            value={consoleOutputFontSize}      
                            sx={{ width : 80 }}
                            onChange={handleFontSizeChange}
                        >
                            {allowedConsoleFontSizes.map((value : string) => 
                                <MenuItem key={"console-window-font-size-selector-"+value} value={value}>{value}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <FormControl id='console-window-size-form'>
                        <InputLabel id="console-window-size-selector-label">Window Size</InputLabel>
                        <Select
                            id="console-window-size-selector"
                            label="Window Size"
                            size="small"
                            value={consoleWindowSize}
                            sx={{ width : 100 }}
                            onChange={handleWindowSizeChange}
                        >
                            {allowedConsoleWindowSizes.map((value : string) => 
                                <MenuItem key={"console-window-size-selector-"+value} value={value}>{value}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <FormControl id='console-window-max-entries-form'>
                        <InputLabel id="console-window-max-entries-selector-label">Max Entries</InputLabel>
                        <Select
                            id="console-window-max-entries-selector"
                            label="Max Entries"
                            size="small"
                            value={consoleMaxEntries}
                            sx={{ width : 100 }}
                            onChange={handleMaxEntries}
                        >
                            {allowedConsoleMaxEntries.map((value : string) => 
                                <MenuItem key={"console-window-max-entries-selector"+value} value={value}>{value}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Stack>
            </Stack>
            {undock?
                <NewWindow
                    title="title"
                    name="somename"
                    copyStyles={true}
                >
                    <Box sx={{ p : 5 }}>
                        <ConsoleOutput 
                            consoleWindowSize={consoleWindowSize} 
                            consoleEntries={consoleEntries}
                            consoleOutputFontSize={consoleOutputFontSize}
                        />
                    </Box>   
                </NewWindow>
                :  
                <ConsoleOutput 
                    consoleWindowSize={consoleWindowSize} 
                    consoleEntries={consoleEntries}
                    consoleOutputFontSize={consoleOutputFontSize}
                />
            }
        </Stack>
    )
})


type ConsoleOutputProps = {
    consoleWindowSize : string
    consoleEntries : any[]
    consoleOutputFontSize : string
}

export const ConsoleOutput = ( { consoleWindowSize, consoleEntries, consoleOutputFontSize} : ConsoleOutputProps) => {

    return (
        <Box 
            id="console-window-box"
            sx={{ 
                p : 1, // adds padding inside the console
                scrollBehavior : "smooth", 
                height : consoleWindowSize === "expand always" ? undefined : Number(consoleWindowSize),
                overflow  : 'scroll',
                border : '1px solid grey',
            }}
        >
            <Console 
                logs={consoleEntries} 
                // @ts-ignore
                filter='log'
                styles={{
                    BASE_FONT_SIZE : Number(consoleOutputFontSize),
                    BASE_BACKGROUND_COLOR : null,
                }}
            />
        </Box>
    )
    
}





export const allowedLogIntervals=['1', '2', '3', '5', '7', '10', '15', '20', '30', '60', '120', '300']

export const LiveLogViewer = () => {

    const thing = useContext(ThingContext) as Thing
    
    const { settings, updateLocalStorage } = useContext(PageContext) as PageProps
    const [eventSrc, setEventSrc] = useState<EventSource | null>(null)
    const [docked, setDocked] = useState<boolean>(true)

    const [logWindowSize, setLogWindowSize] = useState<string>
            (settings.logViewer.defaultWindowSize.toString())
    const [logOutputFontSize, setLogOutputFontSize] = useState<string>
            (settings.logViewer.defaultFontSize.toString())
    const [logInterval, setLogInterval] = useState<string>
            (settings.logViewer.defaultInterval.toString())            
    const [logMaxEntries, setLogMaxEntries] = useState<string>
            (settings.logViewer.defaultMaxEntries.toString())
    
    const [rowData, setRowData] = useState<LogDataType[] | null>([])
    const columnDefs = useRemoteObjectLogColumns('16px')
    const rowDataRef = useRef<LogDataType[] | null>(null)
    
    // return values from python server side
    useEffect(() => {
        thing.setLastResponse(null) 
    }, [])

    const handleFontSizeChange = useCallback((event: any) => {
        setLogOutputFontSize(event.target.value as string);
        if(settings.autoSaveChanges) {
            settings.logViewer.defaultFontSize = event.target.value
            updateLocalStorage(settings)
        }
    }, [settings, updateLocalStorage])

    const handleIntervalChange = useCallback((event: any) => {
        setLogInterval(event.target.value as string);
        if(settings.autoSaveChanges) {
            settings.logViewer.defaultInterval = event.target.value
            updateLocalStorage(settings)
        }
    }, [settings, updateLocalStorage])

    const handleWindowSizeChange = useCallback((event: any) => {
        setLogWindowSize(event.target.value as string);
        if(settings.autoSaveChanges) {
            settings.logViewer.defaultWindowSize = event.target.value
            updateLocalStorage(settings)
        }
    }, [settings, updateLocalStorage])

    const handleMaxEntriesChange = useCallback((event: any) => {
        setLogMaxEntries(event.target.value as string);
        if(settings.autoSaveChanges) {
            settings.logViewer.defaultMaxEntries = event.target.value
            updateLocalStorage(settings)
        }
    }, [settings, updateLocalStorage])

    const updateLogs = useCallback((data : LogDataType[]) => {
        // console.log("old row data", rowDataRef.current)
        if(rowDataRef.current !== null) 
            data = [...data, ...rowDataRef.current]
        rowDataRef.current = data
        setRowData(rowDataRef.current)
    }, [])

    const fetchLogs = useCallback(async() => {
        try {
            const response = await asyncRequest({
                url : thing.logEventsPusherURL, 
                method : 'post',
                data : {
                    interval : Number(logInterval)
                }
            }) as AxiosResponse
            if(response.status !== 200 && response.status !== undefined) {
                if(response.data.exception) 
                    thing.setError(response.data.exception.message, response.data.exception.traceback)
                else 
                    thing.setError(`could not fetch log events - response code ${response.status}`)
                console.log(response)
                console.log("could not fetch log events")
                return
            }
        } catch(error : any) {
            thing.setError(`could not fetch log events ${error.message}`)
            console.log(error)
            console.log("could not fetch log events")
            return 
        }

        let eventSrcURL : string | null = thing.logEventsURL 
        if (!eventSrcURL) {
            console.log(`could not find a valid log-event source. make sure you have a logger 
            with scadapy.server.remote_object.RemoteAccessHandler (or its subclass) attached to it emitting events named 'log-events'.`)
            return 
        }
        const logEventSrc = new EventSource(eventSrcURL)
        logEventSrc.onopen = (ev) => console.debug(`connected to log-events at ${eventSrcURL}`)
        logEventSrc.onerror = (ev) => console.debug(`error while fetching events from event source ${ev}`)
        logEventSrc.onmessage = (ev) => updateLogs(JSON.parse(ev.data))
        // clear old logs if any set using lastResponse
        setEventSrc(logEventSrc)
    }, [thing, logInterval])

    const stopLogEventSrc = useCallback(() => {
        const cleanup = async() => {
            if(eventSrc) {
                eventSrc.close()
                setEventSrc(null)
                try {
                    const response = await asyncRequest({
                        url : thing.logEventsStopURL, 
                        method : 'post'
                    }) as AxiosResponse
                    if(response.status !== 200 && response.status !== undefined) {
                        if(response.data.exception) 
                            thing.setError(response.data.exception.message, response.data.exception.traceback)
                        else 
                            thing.setError(`could not stop log events - response code ${response.status}`)
                        console.log(response)
                        console.log("could not stop log events")
                        return
                    }
                } catch(error : any) {
                    thing.setError(`could not stop log events ${error.message}`)
                    console.log(error)
                    console.log("could not stop log events")
                    return 
                }
            }
        }
        cleanup()
    }, [eventSrc])

    useEffect(() => {
        return stopLogEventSrc
    }, [stopLogEventSrc])

    const clearLogs = useCallback(() => {
        rowDataRef.current = []
        setRowData(rowDataRef.current)
    }, [])

    return (
        <Stack sx={{ display : 'flex', flexGrow : 1, pt : 1, pl : settings.tabOrientation === 'vertical' ?  2 : null }}>
            <Stack direction="row" sx={{pt : 2}}>
                <Box>
                    {docked? 
                        <IconButton size="medium" sx={{ borderRadius : 0 }} onClick={() => setDocked(false)}>
                            <OpenInBrowserTwoToneIcon fontSize="medium"/>
                        </IconButton>
                        :
                        <IconButton size="medium" sx={{ borderRadius : 0 }} onClick={() => setDocked(true)}>
                            <CallReceivedTwoToneIcon fontSize="medium"/>
                        </IconButton>
                    }
                </Box>
                <ButtonGroup 
                    variant="contained"
                    sx = {{ pl : 2, pb : 2, pr : 2 }}
                    disableElevation
                    color="secondary"
                >
                    <Button 
                        sx={{ flexGrow: 0.05, display : 'flex'}} 
                        onClick={fetchLogs}
                        disabled={eventSrc !== null}
                    >
                        Stream
                    </Button>
                    <Button 
                        sx={{ flexGrow: 0.05, display : 'flex'}} 
                        onClick={stopLogEventSrc}
                        disabled={eventSrc === null}
                    >
                        Stop
                    </Button>
                </ButtonGroup>
                <Box key='log-window-clear-button-box' sx={{ pb : 2 }}>
                    <Button 
                        id='log-window-clear-button'
                        variant='outlined' 
                        onClick={clearLogs}
                        sx={{borderColor : 'GrayText'}}
                    >
                        Clear Logs
                    </Button>
                </Box>
                <FormControl id='log-window-interval-form' sx={{pl : 2}}>
                    <InputLabel id="log-window-interval-selector-label">Interval (s)</InputLabel>
                    <Select
                        id="log-window-interval-selector"
                        label="Interval (s)"
                        value={logInterval}
                        size="small"
                        variant="standard"
                        sx={{ width:80 }}
                        onChange={handleIntervalChange}
                    >
                        {allowedLogIntervals.map((value : string) => 
                            <MenuItem key={"log-window-size-selector-"+value} value={value}>{value}</MenuItem>)}
                    </Select>
                </FormControl>
                <FormControl id='log-window-font-size-form' sx={{pl : 2}}>
                    <InputLabel id="log-window-font-size-selector-label">Font Size</InputLabel>
                    <Select
                        id="log-window-font-size-selector"
                        label="Font Size"
                        value={logOutputFontSize}
                        size="small"
                        variant="standard"
                        sx={{ width:80 }}
                        onChange={handleFontSizeChange}
                    >
                        {allowedConsoleFontSizes.map((value : string) => 
                            <MenuItem key={"log-window-font-size-selector-"+value} value={value}>{value}</MenuItem>)}
                    </Select>
                </FormControl>
                <FormControl id='log-window-size-form' sx={{pl : 2}}>
                    <InputLabel id="log-window-size-selector-label">Window Size</InputLabel>
                    <Select
                        id="log-window-size-selector"
                        label="Window Size"
                        value={logWindowSize}
                        size="small"
                        variant="standard"
                        sx={{ width:80 }}
                        onChange={handleWindowSizeChange}
                    >
                        {allowedConsoleWindowSizes.map((value : string) => 
                            <MenuItem key={"log-window-size-selector-"+value} value={value}>{value}</MenuItem>)}
                    </Select>
                </FormControl>
            </Stack>
            {docked?                
                <Box sx={{ display : 'flex', flexGrow : 1, pt : 2}}>
                    <LogTable
                        rowData={rowData}
                        boundary={true}
                        minHeight={`${logWindowSize}px`}
                        fontSize={`${logOutputFontSize}px`}
                        columnDefs={columnDefs}
                    />
                </Box> :
                <NewWindow
                    title={`${thing.td.id}-log-viewer`}
                    name={`${thing.td.id}-log-viewer`}
                >
                    <Box sx={{ display : 'flex', flexGrow : 1, p : 5 }}>
                        <LogTable
                            rowData={rowData}
                            boundary={true}
                            minHeight={`${logWindowSize}px`}
                            fontSize={`${logOutputFontSize}px`}
                            columnDefs={columnDefs}
                        />
                    </Box>
                </NewWindow>
            }
        </Stack>
    )
}


export const ResponseLogs = observer(() => {

    const thing = useContext(ThingContext) as Thing

    const logs = thing.lastResponse? thing.lastResponse.data? 
                thing.lastResponse.data.logs? thing.lastResponse.data.logs : null : null : null 
    const columnDefs = useRemoteObjectLogColumns('16px')
    
    return (
        <>
            {logs?
                <>
                    <Divider sx={{ pt : 1, pb : 1 }}>
                        <Typography variant="button" color="GrayText">LOGS</Typography>
                    </Divider>
                    <LogTable rowData={logs} columnDefs={columnDefs}/> 
                </>
                : null         
            }
        </>
    )

})


export const ErrorBoundary = observer(() => {

    const thing = useContext(ThingContext) as Thing

    return (
        <>
        {thing.errorMessage? 
            <Stack id='error-viewer-box-for-padding' sx={{ pt : 1 }}>
                <Divider id="client-output-console-title">
                    <Typography variant="button" color="GrayText">DETAILED ERRORS</Typography>
                </Divider> 
                <ErrorViewer 
                    errorMessage={thing.errorMessage} 
                    errorTraceback={thing.errorTraceback}
                />
                <Box sx={{ pb : 1 }} />
                <Button
                    id='error-viewer-clear-button'
                    variant='outlined'
                    onClick={() => thing.resetError()}
                    sx={{ alignSelf: 'flex-start' }}
                >
                    Clear Errors
                </Button>
            </Stack> : null     
        }
        </>
    )
})


// export const StatusBar = observer(( { thing } : { thing : Thing }) => {

//     const remoteObjectState = thing.remoteObjectState
//     const remoteObjectInfo = thing.remoteObjectInfo

//     return (
//         <>
//             {remoteObjectInfo.instance_name?
//                 <Stack sx={{ flexGrow: 1, display : 'flex' }} direction='row'>
//                     <ButtonGroup
//                         disableElevation
//                         variant='contained'
//                         color='secondary'
//                         size="small"
//                     >
//                         <Button>
//                             Restart
//                         </Button>
//                         <Button>
//                             Kill
//                         </Button>
//                         <Button>
//                             Start
//                         </Button>
//                     </ButtonGroup>
//                     {remoteObjectState?
//                         <Box sx ={{ pt : 0.5, pl : 2}}>
//                             <Typography variant="button">
//                                 { "State : " + remoteObjectState}
//                             </Typography>
//                         </Box> : null }
//                 </Stack>
//             : null}
//         </>
//     )
// })