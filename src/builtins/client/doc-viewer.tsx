// Internal & 3rd party functional libraries
import { useContext } from 'react';
// import {  useCallback, useState } from "react";
import { observer } from 'mobx-react-lite';
// import { AxiosResponse } from 'axios';
import DOMPurify from 'dompurify';
// Custom functional libraries
// Internal & 3rd party component libraries
import { Box, Stack, Typography, 
//  Button, TextField, ButtonGroup, IconButton, Autocomplete 
    } from "@mui/material"
// import OpenInNewTwoToneIcon from '@mui/icons-material/OpenInNewTwoTone';
// import DownloadTwoToneIcon from '@mui/icons-material/DownloadTwoTone'
// Custom component libraries 
// import { PropertyInformation } from './state';
import { ResourceInformation, Thing } from './state';
import { ThingContext } from './index';
import { PageContext, PageProps } from "../../App";
import { chromeLight, ObjectInspector } from 'react-inspector';



export const ClassDocWindow = observer(() => {

    const thing = useContext(ThingContext) as Thing
    const { settings } = useContext(PageContext) as PageProps
    const classDoc = thing.td.description

    return (
        <Stack sx={{ flexGrow : 1, display : 'flex' }}> 
            <Typography sx={{ pt : 2, pb : 5, pl : settings.tabOrientation === 'vertical' ? 2 : null }}>
                {classDoc ? 
                    <div dangerouslySetInnerHTML={{__html : DOMPurify.sanitize(classDoc)}}></div>
                    : "no class doc provided" 
                }
            </Typography>
            {/* <Box sx={{ display : 'flex' }}>
                <Stack sx = {{ flexGrow : 0.5, display : 'flex' }}>
                    <PostmanFetcher />
                    <FileServer />
                </Stack>
            </Box> */}
        </Stack>
    )
})


export const TDDocViewer = ({ resource, type } : { 
    resource: ResourceInformation
    type: string
}) => {

    const thing = useContext(ThingContext) as Thing
    const tdFragment = thing.td[type === 'action'? 'actions' : type === 'event' ? 'events' : 'properties'][resource.name]
    return (
        <Box sx={{ flexGrow: 1, display: 'flex', p : 1 }}>
            <ObjectInspector 
                name={tdFragment.title}
                expandLevel={2} 
                data={tdFragment} 
                // styles={{ }}
                // @ts-expect-error
                theme={{...chromeLight, ...({ TREENODE_FONT_SIZE: '16px' })}}
            /> 
        </Box>
    )
}


