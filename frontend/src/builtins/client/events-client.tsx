// Internal & 3rd party functional libraries
import { useCallback, useContext, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
// Custom functional libraries
// Internal & 3rd party component libraries
import { Button, Stack, ButtonGroup, Link, Tabs, Tab, FormControlLabel, Checkbox } from "@mui/material"
// Custom component libraries 
import { EventInformation } from './state'
import { Thing } from "./state";
import { ThingContext } from "./index";
import { PageContext, PageProps } from "../../App";
import { TabPanel } from "../reuse-components";
import { TDDocViewer } from "./doc-viewer";



export const Subscription = observer(( { event } :  { event : EventInformation }) => {

    const thing = useContext(ThingContext) as Thing
    const { settings } = useContext(PageContext) as PageProps

    const [eventURL, setEventURL] = useState<string>(event.forms[0].href)
    const [clientChoice, setClientChoice] = useState<string>("axios")
    const [skipDataSchemaValidation, setSkipDataSchemaValidation] = useState(false)
    

    useEffect(() => {
        setEventURL(event.forms[0].href)
    }, [event.forms[0].href])
   
    const streamEvent = useCallback(() => {
        if (clientChoice === "node-wot") {
            thing.client.subscribeEvent(event.name, async (data : any) => {
                data.ignoreValidation = skipDataSchemaValidation
                const value = await data.value()
                if(settings.console.stringifyOutput)    
                    console.log(value)            
                else 
                    console.log(JSON.parse(value))
            }).then((subscription : any) => {
                thing.addEventSource(event.name, subscription) 
                console.debug(`subscribed to event source at ${eventURL}`)
            })
        } else {
            let source = new EventSource(eventURL)
            source.onmessage = (event : MessageEvent) => {
                if(settings.console.stringifyOutput)    
                    console.log(event.data)
                else 
                    console.log(JSON.parse(event.data))
            } 
            source.onopen = (event) => {
                console.log(`subscribed to event source at ${eventURL}`)
            } 
            source.onerror = (error) => {
                console.log(error)
            }
            thing.addEventSource(eventURL, source)
        }
    }, [thing, eventURL, settings, clientChoice, event, skipDataSchemaValidation])

    const stopEvent = useCallback(() => {
        if (clientChoice === "node-wot") {
            let eventSrc = thing.eventSources[event.name]
            if(eventSrc) {
                thing.removeNodeWoTEventSource(event.name)
                console.log(`unsubscribed from event ${event.name}`)
                thing.removeEventSource(event.name)
            }
        }
        else {
            let eventSrc = thing.eventSources[eventURL] as EventSource
            if(eventSrc) {
                eventSrc.close()
                console.log(`closing event source ${eventURL}`)
                thing.removeEventSource(eventURL)
            }
        }
    }, [thing, eventURL, clientChoice, event, settings])

    return(
        <Stack sx={{ flexGrow: 1, display : 'flex' }}>
            <Link 
                // @ts-ignore
                onClick={() => window.open(eventURL)} 
                sx={{ display : 'flex', alignItems : "center", cursor:'pointer', 
                    pt : 1, fontSize : 18, color : "#0000EE" }}
                underline="hover"
                variant="caption"
            >
                {eventURL}
            </Link> 
            <Stack direction = "row" sx={{ pt : 1 }}>
                <ButtonGroup 
                    variant="contained"
                    sx = {{ pr : 2 }}
                    disableElevation
                    color="secondary"
                >
                    <Button 
                        sx={{ flexGrow: 0.05, display : 'flex'}} 
                        onClick={streamEvent}
                        disabled={thing.eventSources[eventURL] || thing.eventSources[event.name] ? true : false}
                    >
                        Stream
                    </Button>
                    <Button 
                        sx={{ flexGrow: 0.05, display : 'flex'}} 
                        onClick={stopEvent}
                        disabled={thing.eventSources[eventURL] || thing.eventSources[event.name] ? false : true}
                    >
                        Stop
                    </Button>
                </ButtonGroup>
            </Stack>
            <FormControlLabel
                label="skip data schema validation"
                control={
                    <Checkbox
                        size="small"
                        checked={skipDataSchemaValidation}
                        onChange={(event) => setSkipDataSchemaValidation(event.target.checked)}
                    />
                }
            />
        </Stack>
    )
})


const eventFields = ['Subscription', 'Doc']

export const SelectedEventWindow = ({ event } : { event : EventInformation }) => {

    const [eventFieldsTab, setEventFieldsTab] = useState(0);
    const handleTabChange = useCallback((_ : React.SyntheticEvent, newValue: number) => {
        setEventFieldsTab(newValue);
    }, [])
    
    return (
        <Stack id="selected-action-view-layout" sx={{ flexGrow: 1, display : 'flex' }} >
            <Tabs
                id="selected-action-fields-tab"
                variant="scrollable"
                value={eventFieldsTab}
                onChange={handleTabChange}
                sx={{ borderBottom: 2, borderColor: 'divider' }}
            >
                {eventFields.map((name : string) => 
                    <Tab 
                        key={"selected-action-fields-tab-"+name}    
                        id={name} 
                        label={name} 
                        sx={{ maxWidth: 150}} 
                    />
                )}
            </Tabs>
            {eventFields.map((name : string, index : number) => 
                <TabPanel 
                    key={"selected-action-fields-tabpanel-"+name}
                    tree="selected-action-fields-tab"
                    value={eventFieldsTab} 
                    index={index} 
                >
                    <EventTabComponents 
                        tab={name} 
                        event={event}
                    />
                </TabPanel>
            )} 
        </Stack>
    )
}


const EventTabComponents = ( { tab, event } : {
    tab : string
    event : EventInformation
}) => {

    const thing = useContext(ThingContext) as Thing

    switch(tab) {
        case "Doc" : return <TDDocViewer resource={event} type="event" />
        default : return <Subscription event={event} />
    }
}
