import { Button, Divider, Drawer, IconButton, Link, Stack, Typography } from "@mui/material"
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
                <SSLSwappedWebsite />
                <Divider />
                <Links />
            </Stack>
        </Drawer>        
    )
}


const nonSSLDomainName = 'hololinked.net'
const SSLDomainName = 'hololinked.dev'
const nonSSLWebsiteURL = `http://no-ssl-control-panel.${nonSSLDomainName}`
const SSLWebsiteURL = `https://control-panel.${SSLDomainName}`

const IsSSLWebsite = () => window.location.hostname.endsWith('.dev')

const OscilloscopeSimulatorNoSSL = `${nonSSLWebsiteURL}/#http://examples.${nonSSLDomainName}/simulations/oscilloscope/resources/wot-td`
const DataSchemaThingNoSSL = `${nonSSLWebsiteURL}/#http://external-examples.${nonSSLDomainName}/data-schema-thing`
const AdvancedCoffeeMachineNoSSL = `${nonSSLWebsiteURL}/#http://external-examples.${nonSSLDomainName}/advanced-coffee-machine`
const SpectrometerNoSSL = `${nonSSLWebsiteURL}/#http://examples.${nonSSLDomainName}/simulations/spectrometer/resources/wot-td`

const OscilloscopeSimulatorSSL = `${SSLWebsiteURL}/#https://examples.${SSLDomainName}/simulations/oscilloscope/resources/wot-td`
const DataSchemaThingSSL = `${SSLWebsiteURL}/#https://external-examples.${SSLDomainName}/data-schema-thing`
const AdvancedCoffeeMachineSSL = `${SSLWebsiteURL}/#https://external-examples.${SSLDomainName}/advanced-coffee-machine`
const SpectrometerSSL = `${SSLWebsiteURL}/#https://examples.${SSLDomainName}/simulations/spectrometer/resources/wot-td`

const SSLThings = [
    { title : 'Oscilloscope Simulator', link : OscilloscopeSimulatorSSL },
    { title : 'Data Schema Thing', link : DataSchemaThingSSL },
    { title : 'Advanced Coffee Machine', link : AdvancedCoffeeMachineSSL },
    { title : 'Spectrometer Simulator', link : SpectrometerSSL }
]

const NoSSLThings = [
    { title : 'Oscilloscope Simulator', link : OscilloscopeSimulatorNoSSL },
    { title : 'Data Schema Thing', link : DataSchemaThingNoSSL },
    { title : 'Advanced Coffee Machine', link : AdvancedCoffeeMachineNoSSL },
    { title : 'Spectrometer Simulator', link : SpectrometerNoSSL }
]


const SSLSwappedWebsite = () => {

    return (
        <Stack>
            <Link 
                href={IsSSLWebsite() ? nonSSLWebsiteURL : SSLWebsiteURL} 
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
            {
                IsSSLWebsite() ? 
                SSLThings.map((thing, index) => <OnlineThing key={index} title={thing.title} link={thing.link} />):
                NoSSLThings.map((thing, index) => <OnlineThing key={index} title={thing.title} link={thing.link} />)
            }
            <Typography fontSize={10}>More coming in due time...</Typography>
        </Stack>
    )
}


const OnlineThing = ({ title, link } : { title : string, link : string }) => {

    return (
        <Stack direction={'row'} spacing={1}>
            <Button  sx={{ pointerEvents: "none" }} onClick={(e) => e.preventDefault()}>{title}</Button>
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