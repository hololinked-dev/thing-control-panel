import { Button, Divider, Drawer, IconButton, Link, Stack, Typography } from "@mui/material"
import { useState } from "react"
import GitHubIcon from '@mui/icons-material/GitHub';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import { OpenInNewTwoTone } from "@mui/icons-material";


export const Sidebar = ({ open, setOpen }: { open: boolean, setOpen: Function}) => {

    return (
        <Drawer 
            anchor="left"
            open={open}
            onClose={() => setOpen(false)}
        >   
            <Stack sx={{ minWidth : 250, padding : 2}}>
                <Divider><Typography variant='button' color='black'>Online Things</Typography></Divider>
                <OnlineThings />
                <Divider />
                {/* <SSLSwappedWebsite /> */}
                {/* <Divider /> */}
                <Links />
            </Stack>
        </Drawer>        
    )
}


const SSLSwappedWebsite = () => {

    return (
        <Stack>
            <Link 
                href={window.location.hostname === 'thing-control-panel.hololinked.dev' ? 
                    'http://thing-control-panel-no-ssl.hololinked.dev' : 'https://thing-control-panel.hololinked.dev'} 
                    target='_blank' 
                    sx={{ padding : 1}}
                    >
                
                <Typography sx={{ padding : 2, fontSize: 12 }} variant='caption'>
                    Visit SSL-swapped version of the website 
                </Typography>
            </Link>
            <Typography sx={{ fontSize : 11, padding : 1, maxWidth : 250 }} variant='caption'>
                non-SSL (unencrypted) versions of the protocols are not supported in the same website as the SSL versions.
            </Typography>
        </Stack>
    )
}


const OnlineThings = () => {


    return (
        <Stack sx={{ padding : 1}}>
            <OnlineThing title='Oscilloscope Simulator' link='https://control-panel.hololinked.dev/#https://examples.hololinked.dev/simulations/oscilloscope/resources/wot-td' />
            <Typography fontSize={10}>More coming in due time...</Typography>
        </Stack>
    )
}


const OnlineThing = ({ title, link } : { title : string, link : string }) => {

    return (

        <Stack direction={'row'} spacing={1}>
            <Button onClick={() => window.location.assign(link)}>{title}</Button>
            <IconButton 
                title="Open Counter in new tab"
                onClick={() => window.open(link, '_blank')}
            >
                <OpenInNewTwoTone />
            </IconButton>
        </Stack>
    )
}


export const Links = () => {

    return (
        <Stack direction='row' spacing={1} sx={{ paddingTop : 1}}>
            <IconButton 
                onClick={() => window.open('https://github.com/VigneshVSV/thing-control-panel', '_blank')}
                title='View source code on GitHub'
            >
                <GitHubIcon />
            </IconButton>
            <IconButton 
                onClick={() => window.open('https://github.com/sponsors/VigneshVSV', '_blank')}
                title='Support the developer'
            >
                <VolunteerActivismIcon />
            </IconButton>
        </Stack>
    )
}