import { useContext, useState } from "react";
import { Button, Divider, Drawer, Icon, IconButton, Link, Stack, Tooltip, Typography } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import { OpenInNewTwoTone, ShareTwoTone } from "@mui/icons-material";
import { Thing } from "./client/state";
import { ThingContext } from "./client";

export const Sidebar = ({ open, setOpen }: { open: boolean; setOpen: Function }) => {
	return (
		<Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
			<Stack sx={{ minWidth: 250, padding: 1 }}>
				<Divider>
					<Typography variant="button" color="black">
						Online Things
					</Typography>
				</Divider>
				<OnlineThings />
				<Divider />
				<SSLSwappedWebsite />
				<Divider />
				<Links />
			</Stack>
		</Drawer>
	);
};

const nonSSLDomainName = "hololinked.net";
const SSLDomainName = "hololinked.dev";
const nonSSLWebsiteURL = `http://no-ssl-control-panel.${nonSSLDomainName}`;
const SSLWebsiteURL = `https://control-panel.${SSLDomainName}`;

const IsSSLWebsite = () => window.location.hostname.endsWith(".dev");

const OscilloscopeSimulatorNoSSLDevice = `http://examples.${nonSSLDomainName}/simulations/oscilloscope/resources/wot-td`;
const DataSchemaThingNoSSLDevice = `http://external-examples.${nonSSLDomainName}/data-schema-thing`;
const AdvancedCoffeeMachineNoSSLDevice = `http://external-examples.${nonSSLDomainName}/advanced-coffee-machine`;
const SpectrometerNoSSLDevice = `http://examples.${nonSSLDomainName}/simulations/spectrometer/resources/wot-td`;

const OscilloscopeSimulatorSSLDevice = `https://examples.${SSLDomainName}/simulations/oscilloscope/resources/wot-td`;
const DataSchemaThingSSLDevice = `https://external-examples.${SSLDomainName}/data-schema-thing`;
const AdvancedCoffeeMachineSSLDevice = `https://external-examples.${SSLDomainName}/advanced-coffee-machine`;
const SpectrometerSSLDevice = `https://examples.${SSLDomainName}/simulations/spectrometer/resources/wot-td`;

const SSLThings = [
	{
		title: "Oscilloscope Simulator",
		link: OscilloscopeSimulatorSSLDevice,
		GUI: `${SSLWebsiteURL}/#${OscilloscopeSimulatorSSLDevice}`,
	},
	{ title: "Data Schema Thing", link: DataSchemaThingSSLDevice, GUI: `${SSLWebsiteURL}/#${DataSchemaThingSSLDevice}` },
	{
		title: "Advanced Coffee Machine",
		link: AdvancedCoffeeMachineSSLDevice,
		GUI: `${SSLWebsiteURL}/#${AdvancedCoffeeMachineSSLDevice}`,
	},
	{ title: "Spectrometer Simulator", link: SpectrometerSSLDevice, GUI: `${SSLWebsiteURL}/#${SpectrometerSSLDevice}` },
];

const NoSSLThings = [
	{
		title: "Oscilloscope Simulator",
		link: OscilloscopeSimulatorNoSSLDevice,
		GUI: `${nonSSLWebsiteURL}/#${SpectrometerNoSSLDevice}`,
	},
	{
		title: "Data Schema Thing",
		link: DataSchemaThingNoSSLDevice,
		GUI: `${nonSSLWebsiteURL}/#${DataSchemaThingNoSSLDevice}`,
	},
	{
		title: "Advanced Coffee Machine",
		link: AdvancedCoffeeMachineNoSSLDevice,
		GUI: `${nonSSLWebsiteURL}/#${AdvancedCoffeeMachineNoSSLDevice}`,
	},
	{
		title: "Spectrometer Simulator",
		link: SpectrometerNoSSLDevice,
		GUI: `${nonSSLWebsiteURL}/#${SpectrometerNoSSLDevice}`,
	},
];

const SSLSwappedWebsite = () => {
	return (
		<Stack>
			<Link href={IsSSLWebsite() ? nonSSLWebsiteURL : SSLWebsiteURL} target="_blank" sx={{ padding: 1 }}>
				<Typography sx={{ padding: 2, fontSize: 12 }} variant="caption">
					Visit SSL-swapped version of the website
				</Typography>
			</Link>
			<Typography sx={{ fontSize: 11, padding: 1, maxWidth: 250 }} variant="caption">
				non-SSL (unencrypted) versions of the protocols are not supported in the same website as the SSL versions.
			</Typography>
		</Stack>
	);
};

const OnlineThings = () => {
	return (
		<Stack sx={{ padding: 1 }}>
			{IsSSLWebsite()
				? SSLThings.map((thing, index) => <OnlineThing key={index} {...thing} />)
				: NoSSLThings.map((thing, index) => <OnlineThing key={index} {...thing} />)}
			<ShareCurrentGUI />
			<Typography fontSize={10}>More coming in due time...</Typography>
		</Stack>
	);
};

const OnlineThing = ({ title, link, GUI }: { title: string; link: string; GUI: string }) => {
	const [tooltipOpen, setTooltipOpen] = useState(false);

	return (
		<Stack direction={"row"}>
			<Tooltip open={tooltipOpen} title="Copied to clipboard!" placement="right">
				<Button
					onClick={() => {
						navigator.clipboard.writeText(link);
						setTooltipOpen(true);
						setTimeout(() => setTooltipOpen(false), 2000);
					}}
				>
					{title}
				</Button>
			</Tooltip>
			<IconButton title="Open Counter in new tab" onClick={() => window.open(GUI, "_blank")}>
				<OpenInNewTwoTone />
			</IconButton>
		</Stack>
	);
};

export const Links = () => {
	return (
		<Stack direction="row" spacing={1} sx={{ paddingTop: 1 }}>
			<IconButton
				onClick={() => window.open("https://github.com/hololinked-dev/thing-control-panel", "_blank")}
				title="View source code on GitHub"
			>
				<GitHubIcon />
			</IconButton>
			<IconButton
				onClick={() => window.open("https://github.com/sponsors/VigneshVSV", "_blank")}
				title="Support the developer"
			>
				<VolunteerActivismIcon />
			</IconButton>
		</Stack>
	);
};

const ShareCurrentGUI = () => {
	const thing = useContext(ThingContext) as Thing;
	const [tooltipOpen, setTooltipOpen] = useState(false);
	const link = window.location.href + `#${thing.tdURL}`;

	if (!thing || !thing.tdURL) return null;

	return (
		<Tooltip open={tooltipOpen} title="Copied to clipboard!" placement="right">
			<Button
				onClick={() => {
					navigator.clipboard.writeText(link);
					setTooltipOpen(true);
					setTimeout(() => setTooltipOpen(false), 2000);
				}}
				sx={{ alignSelf: "flex-start" }}
			>
				Copy current loaded Thing link
			</Button>
		</Tooltip>
	);
};
