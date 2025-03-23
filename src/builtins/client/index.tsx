// Internal & 3rd party functional libraries
import {  useState, useRef, useCallback, useContext, createContext, useEffect } from "react";
import * as React from "react";
import { observer } from "mobx-react-lite";
import '../../lib/wot-bundle.min.js';
// Custom functional libraries
import { EventInformation, ActionInformation, PropertyInformation, ResourceInformation, Thing} from './state'
import { AppSettings } from "../app-settings.js";
// Internal & 3rd party component libraries
import { Box, Stack, Tab, Tabs, Typography, Divider,
    IconButton, List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import OpenInBrowserTwoToneIcon from '@mui/icons-material/OpenInBrowserTwoTone';
import CallReceivedTwoToneIcon from '@mui/icons-material/CallReceivedTwoTone';
import CopyAllTwoToneIcon from '@mui/icons-material/CopyAllTwoTone';
import NewWindow from "react-new-window";
// Custom component libraries
import { TabPanel } from "../reuse-components";
import { SelectedPropertyWindow } from "./property-client";
import { SelectedActionWindow } from "./action-client";
import { SelectedEventWindow } from "./events-client";
import { ErrorBoundary, LiveLogViewer, ResponseLogs, UndockableConsole } from "./output-components";
import { ClassDocWindow } from "./doc-viewer";
import { PageContext, PageProps } from "../../App";
import { Sidebar } from "../sidebar.js";
import { appConfig } from "../../../app.config.js";
import { Locator } from "./locator.js";



export const ThingViewer = () => {

    return (
        <Stack id="thing-viewer-main-vertical-layout" sx={{ pl: 1, pr: 1 }}>  
            <FunctionalitiesView />
            <ErrorBoundary />
            <ResponseLogs />
            <UndockableConsole />
        </Stack>
    )
}


const thingOptions = ['Properties', 'Actions', 'Events', 'Doc/Description']

const FunctionalitiesView = observer(() => {

    const thing = useContext(ThingContext) as Thing
    const { settings } = useContext(PageContext) as PageProps
    const [currentTab, setCurrentTab] = useState<number>(0)
    const [undock, setUndock] = useState<number>(-1)
    const [duplicates, setDuplicates] = useState<number[]>([])
    const undockedTab = useRef<number>(undock)
    const [tabOrientation, _] = useState<"vertical" | "horizontal">(settings.tabOrientation)

    const handleTabChange = useCallback(
        (_: React.SyntheticEvent, newValue: number) => {
            setCurrentTab(newValue);
    }, [])

    const addDuplicateWindow = useCallback(() => {
        setDuplicates([...duplicates, currentTab])
        // not perfect
        // console.log([...duplicates, currentTab])
    }, [duplicates, currentTab])

    const removeDuplicateWindow = useCallback((index : number) => {
        duplicates.splice(index, 1)
        setDuplicates([...duplicates])
    }, [duplicates])

    const undockWindow = useCallback(() => {
        undockedTab.current = currentTab
        setUndock(currentTab)
    }, [currentTab])

    const dockWindow = useCallback(() => {
        undockedTab.current = -1
        setUndock(-1)
    }, [])

    return(
        <Stack direction='row'>
            {settings.allowUndocking?
                <Stack>
                    {undock >= 0?
                        <IconButton id='undock-icon-button' size="small" sx={{ borderRadius : 0 }} onClick={dockWindow}>
                            <CallReceivedTwoToneIcon fontSize="small"/>
                        </IconButton>
                        :
                        <IconButton id='dock-icon-button' size="small" sx={{ borderRadius : 0 }} onClick={undockWindow}>
                            <OpenInBrowserTwoToneIcon fontSize="small"/>
                        </IconButton>
                    }
                    
                    <IconButton id='copy-icon-button' size="small" sx={{ borderRadius : 0 }} onClick={addDuplicateWindow}>
                        <CopyAllTwoToneIcon fontSize="small"/>
                    </IconButton>
                </Stack>
                : null
            }
            <Stack 
                sx={{ flexGrow : 1, display : 'flex', overflowX: 'auto' }} 
                direction={tabOrientation === 'vertical'? 'row' : 'column'}
            >
                <Tabs
                    id="thing-options-tabs"
                    variant="scrollable"
                    value={currentTab}
                    onChange={handleTabChange}
                    orientation={tabOrientation}
                    sx={{
                        border : tabOrientation == 'vertical' ? 1 : null,
                        borderRight: tabOrientation === 'vertical'? 3 : 1,
                        borderBottom: tabOrientation === 'vertical'? 1 : 3,
                        flexGrow : tabOrientation === 'vertical'? null : 1,
                        borderColor: 'divider',
                        width: tabOrientation === 'vertical'? 150 : null,
                        minWidth: tabOrientation === 'vertical'? 150 : null,
                    }}
                >
                    {thingOptions.map((name : string) =>
                        <Tab
                            key={"thing-options-tab-" + name}
                            id={"thing-options-tab-" + name}
                            label={name}
                            sx={{ maxWidth : 150 }}
                            disabled={!thing.info.id}
                        />
                    )}
                </Tabs>
                <Box
                    sx={{
                        resize : 'vertical', height : thing.info.id? 300 : null,
                        flexGrow : 1, border : 1, borderColor : 'divider', overflow: 'hidden'
                    }}
                >
                {thingOptions.map((name : string, index : number) => {
                        if(index === undock)
                            return(
                                <NewWindow
                                    key={`${thingOptions[undockedTab.current]} - ${thing.info.id}`}
                                    name={`${thingOptions[undockedTab.current]} - ${thing.info.id}`}
                                    title={`${thingOptions[undockedTab.current]} - ${thing.info.id}`}
                                    copyStyles={true}
                                >
                                    <Box id='functionalities-box-new-window' sx={{ p : 5 }}>
                                        <Divider id='functionalities-title'>
                                            <Typography variant="button">
                                                {thingOptions[undockedTab.current]} - {thing.info.id}
                                            </Typography>
                                        </Divider>
                                        <Functionalities type={thingOptions[undockedTab.current]} />
                                        {/* undocked={undockedTab.current >= 0} */}
                                    </Box>
                                </NewWindow>
                            )
                        return (
                            <TabPanel
                                key={"thing-options-native-tabpanel-" + name}
                                tree="thing-options-tab"
                                index={index}
                                value={currentTab}
                            >
                                <Functionalities type={name} />
                                {/* undocked={undockedTab.current === index} */}
                            </TabPanel>
                        )
                })}
                </Box>
                {duplicates.map((tabNum : number, index : number) =>
                    <NewWindow
                        key={`${thingOptions[tabNum]} - ${thing.info.id} - no. ${index}`}
                        name={`${thingOptions[tabNum]} - ${thing.info.id} - no. ${index}`}
                        title={`${thingOptions[tabNum]} - ${thing.info.id} - no. ${index}`}
                        copyStyles={true}
                        onUnload={() => removeDuplicateWindow(index)}
                    >
                        <Box id='functionalities-box-new-window-copied' sx={{ p : 5 }}>
                            <Divider>
                                <Typography variant="button">
                                    {thingOptions[tabNum]} - {thing.info.id}
                                </Typography>
                            </Divider>
                            <Functionalities type={thingOptions[tabNum]} />
                        </Box>
                    </NewWindow>
                )}
            </Stack>
        </Stack>
    )
})


const Functionalities = observer(({ type } : { type : string }) => {

    switch(type) {

        case 'Doc/Description' : return <ClassDocWindow />

        case 'Database' : return <Typography sx={{p : 2}}>No DB client</Typography>

        //  case 'Log Viewer' : return <LiveLogViewer />

        default : return <InteractionAffordancesView type={type as "Properties" | "Actions" | "Events"} />
                   
    }
})


const InteractionAffordancesView = observer(({ type } : { type : "Properties" | "Actions" | "Events" }) => {

    const thing = useContext(ThingContext) as Thing

    // interaction affordance object selection number
    const objects = thing.getInteractionAffordances(type)
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const handleListItemClick = useCallback((
            _ : React.MouseEvent<HTMLDivElement, MouseEvent>,
            index: number,
        ) => {
            setSelectedIndex(index);
            // console.log(sortKey, index, objects[sortKey][index])
    }, [setSelectedIndex])

    return (
        <Stack direction='row' sx={{ flexGrow: 1, overflowX: { xs: 'scroll', sm: 'auto' }}} >
            <Box
                id="interaction-affordance-object-selection-list-layout" 
                sx={{ 
                    width : "50%", resize : 'horizontal', minWidth: 300,
                    overflow : 'auto', height : "100%"
                }}
            >
                <List
                    id="interaction-affordance-objects-list"
                    dense
                    disablePadding
                >
                    {objects.map((object : ResourceInformation, index : number) => {
                        return (
                            <ListItem
                                key={`interaction-affordance-client-${type}-${object.name}`}
                                id={`interaction-affordance-${type}-${object.name}`}
                                alignItems="flex-start"
                                disablePadding
                            >
                                <ListItemButton
                                    key={`interaction-affordance-${type}-${object.name}-choosing-button`}
                                    selected={selectedIndex === index}
                                    onClick={(event) => handleListItemClick(event, index)}
                                >
                                    <ListItemText
                                        key={`interaction-affordance-${type}-${object.name}-text-display`}
                                        primary={
                                            <Typography
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between'
                                                }}
                                            >
                                                <span>{object.name}</span>
                                                {
                                                // @ts-expect-error
                                                object.type || object.oneOf ?
                                                    <span style={{color : 'rgba(0, 0, 0, 0.5)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                                        {object.type ? object.type : 
                                                        (object as PropertyInformation).oneOf ? 
                                                        (object as PropertyInformation).oneOf.map(item => item.type).join(' | ') 
                                                        : null
                                                        }
                                                    </span> 
                                                    : null
                                                    
                                                }
                                            </Typography>
                                        }
                                    />
                                </ListItemButton>
                            </ListItem>
                        )
                    })}
                </List>
            </Box>
            <Divider id="interaction-affordance-view-divider" orientation="vertical" sx={{ borderWidth : 2 }} />
            <Box 
                id="interaction-affordance-object-after-selected-execution-layout"
                sx={{ 
                    width: '50%', pl : 1, pr : 2, minWidth: 300,
                    overflowY : 'scroll', overflowX: 'auto', height : '100%' 
                }}
            >
                {
                    objects[selectedIndex]?
                    <InteractionAffordanceSelect
                        object={objects[selectedIndex]}
                        type={type}
                    /> : null 
                }
            </Box>
        </Stack>
    )
})


const InteractionAffordanceSelect = ({ object, type } : {
    object : ResourceInformation
    type : string
}) => {
    switch(type) {
        case 'Events' : return <SelectedEventWindow event={object as EventInformation} />                
        case 'Actions' : return <SelectedActionWindow action={object as ActionInformation} />                
        default : return <SelectedPropertyWindow property={object as PropertyInformation} />
    }
}



export const ThingContext = createContext<Thing | null>(null)

export const ThingClient = () => {

    const thing = useRef<Thing>(new Thing())
    const { showSettings, showSidebar, setShowSidebar } = useContext(PageContext) as PageProps

    /* 
    Thing Client composes Thing Viewer, Location and Settings components which controls the settings of the client

    1. There is a client worker state which controls the state of the interactions with the thing with MobX. 
    The values contained within this state are always related to application data, never purely component rendering data.
    The purely component rendering data is left to react own's state management.

    2. purely component rendering data may be also part of contexts
    */
   useEffect(() => {
        const startServient = async() => {
            // @ts-expect-error
            const servient = new Wot.Core.Servient(); 
            // Wot.Core is auto-imported by wot-bundle.min.js

            const IsOurWebsite = window.location.hostname.endsWith('hololinked.dev') || window.location.hostname.endsWith('hololinked.net')
            const IsSSLWebsite = window.location.hostname.endsWith('hololinked.dev')
                
            try {
                if((IsOurWebsite && IsSSLWebsite) || (!IsOurWebsite && appConfig.useSSL)){
                    // @ts-expect-error
                    servient.addClientFactory(new Wot.Http.HttpsClientFactory({ allowSelfSigned : true }))
                    // @ts-expect-error
                    servient.addClientFactory(new Wot.WebSocket.WebSocketSecureClientFactory({ allowSelfSigned : true }))
                    console.log("added HTTPS and WSS client factories, HTTP & WS clients not supported although Thing Description may be fetched")
                }
                else {
                    // @ts-expect-error
                    servient.addClientFactory(new Wot.Http.HttpClientFactory())
                    // @ts-expect-error
                    servient.addClientFactory(new Wot.WebSocket.WebSocketClientFactory())
                    console.log("added non-SSL HTTP and WS client factories, HTTPS and WSS clients not supported although Thing Description may be fetched")
                }
                // servient.addClientFacotry(new Wor)
                servient.start().then((WoT : any) => {
                    console.log("WoT servient started")
                    thing.current.servient = servient  
                    thing.current.wot = WoT
                })
            } catch (error) {
                console.log("error in starting servient", error.message)
            }
        }
        startServient()
        return () => {
            thing.current.cancelAllEvents()
            thing.current.servient.shutdown()
        }
   }, [])


    return (
        <ThingContext.Provider value={thing.current}>
            <Box id='client-layout-box' sx={{ pt: 0.5 }}>
                <Stack id="thing-viewer-page-layout">
                    <Locator />
                    {showSettings?
                        <AppSettings globalState={null} /> : 
                        <ThingViewer />
                    }
                </Stack>
                <Sidebar open={showSidebar} setOpen={setShowSidebar} />    
            </Box>
        </ThingContext.Provider>
    )
}

