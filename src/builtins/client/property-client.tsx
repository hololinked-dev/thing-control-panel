// Internal & 3rd party functional libraries
import { useCallback, useContext, useEffect, useState } from "react";
import { AxiosRequestConfig, AxiosResponse } from "axios";
import { observer } from "mobx-react-lite";
// Custom functional libraries
import { getFormattedTimestamp,  asyncRequest, parseWithInterpretation } from "../utils";
// Internal & 3rd party component libraries
import { Stack, Tabs, Tab, FormControl, FormControlLabel, Button, ButtonGroup, 
    RadioGroup, Radio, Checkbox} from "@mui/material";
// Custom component libraries 
import { TabPanel } from "../reuse-components";
import { PropertyInformation, Thing } from "./state";
import { PageContext, PageProps, ThingManager } from "./view";
import { ObjectInspector } from "react-inspector";
import { InputChoice } from "./input-components";



const propertyOptions = ['Execute', 'Doc']

export const SelectedPropertyWindow = ( { property } : { property : PropertyInformation}) => {
    // No need to use observer HOC as either property prop changes or child components of this component 
    // read and manipulate client state 
    // const thing = useContext(ThingManager) as Thing
    
    // current tab of property options
    const [propertyOptionsTab, setPropertyOptionsTab] = useState(0);

    const handleTabChange = useCallback(
        (_ : React.SyntheticEvent, newValue: number) => {
            setPropertyOptionsTab(newValue);
    }, [])

    return (
        <Stack id="selected-property-layout">
            <Tabs
                id="selected-property-options-tab"
                variant="scrollable"
                value={propertyOptionsTab}
                onChange={handleTabChange}
                sx={{ borderBottom: 2, borderColor: 'divider' }}
            >
                {propertyOptions.map((name : string) => {
                    return (
                        <Tab 
                            key={"selected-property-options-tab-"+name}    
                            id={name} 
                            label={name} 
                            sx={{ maxWidth : 150 }} 
                        />
                    )}
                )}
            </Tabs>
            {propertyOptions.map((name : string, index : number) => {
                return (
                    <TabPanel 
                        key={"selected-property-options-tabpanel-"+name}
                        tree="selected-property-options-tab"
                        value={propertyOptionsTab} 
                        index={index} 
                    >
                        <PropertyTabComponents tab={name} property={property} />
                    </TabPanel>
                )} 
            )} 
        </Stack>
    )
}



type PropertyTabComponentsProps = { 
    tab : string
    property : PropertyInformation
}

export const PropertyTabComponents = ( { tab, property } : PropertyTabComponentsProps) => {
    const thing = useContext(ThingManager) as Thing
    switch(tab) {
        case "Execute"  : return (
                                <RWO property={property}></RWO>
                            )
        default : return (
                        <ObjectInspector 
                            data={thing.td.properties[property.name]}
                            expandLevel={3} 
                        />
                    ) 
    }
}



export const RWO = ( { property } : { property : PropertyInformation}) => {
    // no need observer HOC as well
    const thing = useContext(ThingManager) as Thing
    const { settings } = useContext(PageContext) as PageProps
    // property input choice - raw value or JSON
    const [inputChoice, setInputChoice ] = useState(property.inputType) // JSON and RAW are allowed
    const [skipDataSchemaValidation, setSkipDataSchemaValidation] = useState(false)
    const [timeout, setTimeout] = useState<number>(-1)
    const [timeoutValid, setTimeoutValid] = useState<boolean>(true)
    const [clientChoice, _] = useState('node-wot')
    // the value entered
    const [propValue, setPropValue] = useState<any>(null)
    // the latest response to be available as download
   
    useEffect(() => {
        setInputChoice(property.inputType)
    }, [property])
    
    const handleInputSelection = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setInputChoice(event.target.value)
    }, [])

    const RWProp = useCallback(async (mode : 'READ' | 'WRITE' ) => {
        const requestTime = getFormattedTimestamp()
        const requestTime_ = Date.now()
        let request : AxiosRequestConfig, consoleOutput : string | null = null, response
        try {
            /* 
            order -
                1. perform operation 
                2. set response
                3. set console output
                4. reset error

            In this way
            1. If there is an error in even doing the operation 
                1. the last valid response is not unncessarily lost
                2. update error to new one and ignore console output
            2. If there is an error in retrieving the value from the response
                1. update last response
                2. update error to new one and ignore console output
            3. If there is no error
                1. update last response
                2. update console output
                3. reset error
            */
            if(clientChoice === 'node-wot') {
                /*
                for node-wot 
                response = interaction output
                console output = received data
                */
                if(mode === 'READ') 
                    response = await thing.client.readProperty(property.name)
                else 
                    response = await thing.client.writeProperty(property.name, 
                                            parseWithInterpretation(propValue, property.type))    
                thing.setLastResponse(response)
                if(response) {
                    response.ignoreValidation = skipDataSchemaValidation
                    consoleOutput = await response.value()
                }           
                thing.resetError()
            }
            else {
                if(mode === 'READ') {
                    let form = property.forms.find(form => form.op === 'readproperty')
                    request = {
                        url : form.href, 
                        method : form["htv:methodName"], 
                        // httpsAgent: new https.Agent({ rejectUnauthorized: false })
                    }
                } else {
                    let form = property.forms.find(form => form.op === 'writeproperty')
                    request = {
                        url : form.href, 
                        method : form["htv:methodName"], 
                        data : { 
                            timeout : timeout >= 0? timeout : null,
                            value : parseWithInterpretation(propValue, property.python_type) 
                        },
                        // httpsAgent: new https.Agent({ rejectUnauthorized: false })
                    }
                }
                response = await asyncRequest(request) as AxiosResponse
                thing.setLastResponse(response)
                if(response.data && response.data.exception) 
                    thing.setError(response.data.exception.message, response.data.exception.traceback)
                else {
                    if(response.data) 
                        consoleOutput = response.data
                    thing.resetError()
                }
            }
            if(settings.console.stringifyOutput) 
                console.log(JSON.stringify(consoleOutput, null, 2))
            else 
                console.log(consoleOutput)    
        } 
        catch(error : any){
            console.log(error)
            thing.setError(error.message, null)
        }
        let executionTime = Date.now() - requestTime_
        console.log(`PROPERTY ${mode} : ${property.name}, REQUEST TIME : ${requestTime}, RESPONSE TIME : ${getFormattedTimestamp()}, EXECUTION TIME : ${executionTime.toString()}ms, RESPONSE BELOW :`)
    }, [thing, settings, property, timeout, propValue, skipDataSchemaValidation, clientChoice])

    const readProp = useCallback(async() => await RWProp('READ'), [RWProp])
    const writeProp = useCallback(async() => await RWProp('WRITE'), [RWProp])

    const handleTimeoutChange = useCallback((event : any) => {
        let oldTimeout =  timeout 
        let timeoutValid = false 
        if(Number(event.target.value)) {
            oldTimeout = Number(event.target.value)
            timeoutValid = true 
        } 
        setTimeout(oldTimeout)
        setTimeoutValid(timeoutValid)
    }, [timeout, setTimeout])


    return (
        <Stack id="property-rw-client" sx={{ pt: 1 }}>
            {property.readOnly? null : 
                <InputChoice 
                    jsonSchema={property} 
                    // remember, property is a subclass of data schema which is basically JSON schema
                    choice={inputChoice} 
                    value={propValue} 
                    setValue={setPropValue}
                />
            }
            <Stack 
                id='property-rw-client-options-layout' 
                spacing={1.5} 
                useFlexGap 
                direction="row" 
                sx={{ flexWrap: 'wrap' }}
            >
                {property.readOnly? null :
                    <FormControl> 
                        <RadioGroup
                            id="input-choice-group"
                            row
                            value={inputChoice}
                            onChange={handleInputSelection}
                        >
                            <FormControlLabel value="RAW" control={<Radio size="small" />} label="raw" />
                            <FormControlLabel value="JSON" control={<Radio size="small" />} label="code editor" />
                        </RadioGroup>
                    </FormControl>
                }
                {/* <Box sx={{ pl : 2, pt: 2, pr: 2, maxWidth : 100 }} >
                    <TextField
                        id='timeout-input'
                        label='Timeout (s)'    
                        size='small'
                        defaultValue={timeout}
                        error={!timeoutValid}
                        onChange={handleTimeoutChange}
                    />
                </Box> */}
                <ButtonGroup 
                    id='rw-buttons'
                    variant="contained"
                    disableElevation
                    color="secondary"
                >
                    <Button onClick={readProp}>
                        Read
                    </Button>
                    <Button 
                        disabled={property.readOnly}
                        onClick={writeProp}
                    >
                        Write
                    </Button>
                </ButtonGroup>
                {property.observable? 
                    <Observe property={property} skipDataSchemaValidation={skipDataSchemaValidation} />
                    : null
                }   
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
        </Stack>
    )
}


// @ts-ignore
function stringify(val, depth, replacer, space) {
    depth = isNaN(+depth) ? 1 : depth;
    // @ts-ignore
    function _build(key, val, depth, o, a) { // (JSON.stringify() has it's own rules, which we respect here by using it for property iteration)
        // @ ts-ignore
        return !val || typeof val != 'object' ? val : (a=Array.isArray(val), JSON.stringify(val, function(k,v){ if (a || depth > 0) { 
            if (replacer) v=replacer(k,v); if (!k) 
                // @ts-ignore
                return (a=Array.isArray(v),val=v); !o && (o=a?[]:{}); o[k] = _build(k, v, a?depth:depth-1); } }), o||(a?[]:{}));
    }
    // @ts-ignore
    return JSON.stringify(_build('', val, depth), null, space);
}


const Observe = observer(({ property, skipDataSchemaValidation } : { property : PropertyInformation, skipDataSchemaValidation : boolean}) => {
    // This component will error if property is not observable
    const thing = useContext(ThingManager) as Thing
    const { settings } = useContext(PageContext) as PageProps

    const [eventURL, setEventURL] = useState<string>(property.forms.find(form => form.op === 'observeproperty').href)
    const [clientChoice, setClientChoice] = useState<string>("node-wot")

    useEffect(() => {
        setEventURL(property.forms.find(form => form.op === 'observeproperty').href)
    }, [property])
   
    const observeProp = useCallback(() => {
        if (clientChoice === "node-wot") {
            thing.client.observeProperty(property.name, async (data : any) => {
                try {
                    data.ignoreValidation = skipDataSchemaValidation
                    const value = await data.value()
                    if(settings.console.stringifyOutput)
                        console.log(`${property.name} change event - ${value}`)
                    else
                        console.log(`${property.name} change event - ${JSON.parse(value)}`)
                } catch(error) {
                    console.log(`${property.name} change event error occured ${error}`)
                }
            }).then((subscription : any) => {
                // thing.addEventSource(property.name, subscription) 
                console.log(`subscribed to observable event ${property.name}`)
            })
            thing.addEventSource(property.name, property.name) 
        } else {
            let source = new EventSource(eventURL)
            source.onmessage = (event : MessageEvent) => {
                if(settings.console.stringifyOutput)    
                    console.log(event.data)
                else 
                    console.log(JSON.parse(event.data))
            } 
            source.onopen = (_) => {
                console.log(`subscribed to event source at ${eventURL}`)
            } 
            source.onerror = (error) => {
                console.log(error)
            }
            thing.addEventSource(eventURL, source)
        }
    }, [thing, property, eventURL, settings.console.stringifyOutput, skipDataSchemaValidation, clientChoice])

    const unobserveProp = useCallback(() => {
        if (clientChoice === "node-wot") {
            let eventSrc = thing.eventSources[property.name]
            if(eventSrc) {
                thing.removeNodeWoTEventSource(property.name)
                console.log(`unsubscribed from observable event ${property.name}`)
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
    }, [thing, eventURL, clientChoice, property])


    return (
        <>
            <ButtonGroup
                id='observe-buttons'
                variant="contained"
                disableElevation
                color="secondary"
            >
                <Button 
                    disabled={thing.eventSources[property.name] !== undefined}
                    onClick={observeProp}
                >
                    Observe
                </Button>
                <Button 
                    disabled={!thing.eventSources[property.name]}
                    onClick={unobserveProp}
                >
                    Stop
                </Button>
            </ButtonGroup>
        </>
    )
})
