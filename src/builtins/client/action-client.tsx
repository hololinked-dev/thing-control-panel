// Internal & 3rd party functional libraries
import { useCallback, useContext, useEffect, useState } from "react";
import { AxiosResponse } from "axios";
// Custom functional libraries
import { getFormattedTimestamp, asyncRequest, parseActionPayloadWithInterpretation } from "../utils";
// Internal & 3rd party component libraries
import { Stack, Divider, Tabs, Tab, FormControl, FormControlLabel, Button, ButtonGroup, 
    RadioGroup, Box, Radio, Checkbox, Typography} from "@mui/material";
// Custom component libraries 
import { ActionInformation, Thing } from "./state";
import { TabPanel } from "../reuse-components";
import { PageContext, ThingContext, PageProps } from "./index";
import { InputChoice } from "./input-components";
import { TDDocViewer } from "./doc-viewer";    
    

const actionFields = ['Execute', 'Doc']

export const SelectedActionWindow = ({ action } : { action : ActionInformation }) => {

    const [actionFieldsTab, setActionFieldsTab] = useState(0);
    const handleTabChange = useCallback((_ : React.SyntheticEvent, newValue: number) => {
        setActionFieldsTab(newValue);
    }, [])
    
    return (
        <Stack id="selected-action-view-layout" sx={{ flexGrow: 1, display: 'flex' }}>
            <Tabs
                id="selected-action-fields-tab"
                variant="scrollable"
                value={actionFieldsTab}
                onChange={handleTabChange}
                sx={{ borderBottom: 2, borderColor: 'divider' }}
            >
                {actionFields.map((name : string) => 
                    <Tab 
                        key={"selected-action-fields-tab-"+name}    
                        id={name} 
                        label={name} 
                        sx={{ maxWidth: 150}} 
                    />
                )}
            </Tabs>
            {actionFields.map((name : string, index : number) => 
                <TabPanel 
                    key={"selected-action-fields-tabpanel-"+name}
                    tree="selected-action-fields-tab"
                    value={actionFieldsTab} 
                    index={index} 
                >
                    <ActionTabComponents 
                        tab={name} 
                        action={action}
                    />
                </TabPanel>
            )} 
        </Stack>
    )
}


const ActionTabComponents = ({tab, action} : {
    tab : string
    action : ActionInformation
}) => {

    switch(tab) {
        case "Doc" : return <TDDocViewer resource={action} type='action' />
        default : return <ActionInvokationClient action={action} />
    }
}


const ActionInvokationClient = ({ action } :  {
    action : ActionInformation
}) => {

    const thing = useContext(ThingContext) as Thing
    const { settings } = useContext(PageContext) as PageProps

    const [clientChoice, _] = useState('node-wot')
    const [fetchExecutionLogs, setFetchExecutionLogs] = useState<boolean>(false)                                                                                               
    const [inputChoice, setInputChoice ] = useState('code-editor')
    const [timeout, setTimeout] = useState<number>(-1)
    const [timeoutValid, setTimeoutValid] = useState<boolean>(true)
    const [skipResponseValidation, setSkipResponseValidation] = useState(false)
    const [kwargsValue, setKwargsValue] = useState<any>(null)
    const handleInputSelection = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setInputChoice(event.target.value)
    }, [])

    useEffect(() => {
        // setInputChoice(action.inputType)
        return () => setKwargsValue(null)
    }, [action])
    
    const invokeAction = useCallback(async () => {
        try {
            let data: any, _fullpath: string 
            let fullpath = action.forms[0]["href"]
            let http_method = action.forms[0]["htv:methodName"]
            if(http_method.toLowerCase() === 'get') {
                data = null
                _fullpath = fullpath + `?timeout=${timeout}`
                if(fetchExecutionLogs)
                    _fullpath += `&fetch_execution_logs=${fetchExecutionLogs}`
            }
            else {
                data = { 
                    // fetch_execution_logs : fetchExecutionLogs,
                    // timeout : timeout,
                    ...JSON.parse(kwargsValue)
                }
                _fullpath = fullpath  
            }
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
            let consoleOutput: any
            const requestTime = getFormattedTimestamp()
            const requestTime_ = Date.now()
            if(clientChoice !== 'node-wot') {
                const response = await asyncRequest({
                    url : _fullpath, 
                    method : http_method, 
                    data : data
                    // httpsAgent: new https.Agent({ rejectUnauthorized: false })
                }) as AxiosResponse
                thing.setLastResponse(response)
                if(response.status >= 200 && response.status < 300) {
                    if(response.data) 
                        consoleOutput = response.data
                    thing.resetError()
                }
                else if(response.data && response.data.exception) {
                    thing.setError(response.data.exception.message, response.data.exception.traceback)
                    consoleOutput = response.data.exception 
                }
                else {
                    consoleOutput = response
                }
                
            }
            else {
                console.log("payload for action: ", data)
                let lastResponse = await thing.client.invokeAction(action.name, data)
                thing.setLastResponse(lastResponse)
                if(skipResponseValidation)
                    lastResponse.ignoreValidation = true
                consoleOutput = await lastResponse.value()
                if(!consoleOutput)
                    consoleOutput = 'no return value'
            }       
            if(settings.console.stringifyOutput) 
                console.log(JSON.stringify(consoleOutput, null, 2))
            else 
                console.log(consoleOutput)
            let executionTime = Date.now() - requestTime_
            console.log(`ACTION EXECUTION : ${thing.td.title}.${action.name}, REQUEST TIME : ${requestTime}, RESPONSE TIME : ${getFormattedTimestamp()}, EXECUTION TIME : ${executionTime.toString()}ms, RESPONSE BELOW : `)
        } 
        catch(error : any){
            // console.log(error)
            thing.setError(error.message, null)
        } 
    }, [thing, action, settings, fetchExecutionLogs, kwargsValue, timeout, clientChoice, skipResponseValidation])

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
        <Stack id='action-execution-client-layout' sx={{ pt: 1, flexGrow: 1, display: 'flex' }}>
            <InputChoice 
                choice={inputChoice} 
                jsonSchema={action.input} 
                setValue={setKwargsValue} 
                value={kwargsValue}    
            />
            {inputChoice === 'code-editor' && <Typography variant="caption">Use double quotes only</Typography>}
            <Stack 
                id='action-execution-client-options-layout' 
                direction="row" 
                spacing={1}
                useFlexGap
                sx={{ flexWrap: 'wrap', pt: 1 }}
            >
                <FormControl> 
                    <RadioGroup
                        id="actions-execution-client-input-choice-group"
                        row
                        value={inputChoice}
                        onChange={handleInputSelection}
                    >
                        <FormControlLabel value="raw" control={<Radio size="small" />} label="raw" />
                        <FormControlLabel value="code-editor" control={<Radio size="small" />} label="code editor" />
                    </RadioGroup>
                </FormControl>
                {/* <Box sx={{ pl : 2, pt: 2, pr: 2, maxWidth : 100 }} > */}
                    {/* <TextField
                        id='console-window-timeout-input'
                        label='Timeout (s)'    
                        size='small'
                        defaultValue={timeout}
                        error={!timeoutValid}
                        onChange={handleTimeoutChange}
                    />
                </Box> */}
                {/* <ButtonGroup> */}
                    <Button 
                        variant="contained"
                        disableElevation
                        color="secondary"
                        onClick={invokeAction}
                        
                    >
                        Execute
                    </Button>    
                    {/* <Divider orientation="vertical" sx={{ backgroundColor : "black" }}></Divider> */}
                    {/* <Button 
                        variant="contained"
                        disableElevation
                        color="secondary"
                        
                        // onClick={cancelAction}
                    >
                        Cancel
                    </Button>     */}
                {/* </ButtonGroup> */}
                <FormControlLabel
                    label="skip response validation"
                    control={
                        <Checkbox
                            size="small"
                            checked={skipResponseValidation}
                            onChange={(event) => setSkipResponseValidation(event.target.checked)}
                        />
                    }
                />
                {/* <FormControlLabel
                    label="fetch execution logs"
                    control={<Checkbox
                                size="small"
                                checked={fetchExecutionLogs}
                                onChange={(event) => setFetchExecutionLogs(event.target.checked)}
                            />}
                    sx={{ pl : 1, pt : 2}}
                /> */}
            </Stack>
        </Stack>
    )
}