// Internal & 3rd party functional libraries
import { useState, useCallback, useContext, useEffect } from "react";
import * as React from "react";
import { observer } from "mobx-react-lite";
import "../../lib/wot-bundle.min.js";
// Custom functional libraries
import { Thing } from "./state";
// Internal & 3rd party component libraries
import {
	Box,
	Button,
	Stack,
	Typography,
	TextField,
	Divider,
	IconButton,
	Autocomplete,
	CircularProgress,
} from "@mui/material";
import SaveTwoToneIcon from "@mui/icons-material/SaveTwoTone";
import ArrowBackTwoToneIcon from "@mui/icons-material/ArrowBackTwoTone";
import OpenInNewTwoToneIcon from "@mui/icons-material/OpenInNewTwoTone";
import SettingsTwoToneIcon from "@mui/icons-material/SettingsTwoTone";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import MenuIcon from "@mui/icons-material/Menu";
// Custom component libraries
import { useAutoCompleteOptionsFromLocalStorage } from "../hooks";
import { ThingContext } from "./index";
import { PageContext, PageProps } from "../../App";
import { ZoomedInput } from "../reuse-components.js";

export const Locator = observer(() => {
	const [existingURLs, modifyOptions] = useAutoCompleteOptionsFromLocalStorage("thing-url-text-input");
	const [currentURL, setCurrentURL] = useState<string>(
		window.location ? (window.location.hash ? window.location.hash.substring(1) : "") : "",
	);
	const [loadingThing, setLoadingThing] = useState<boolean>(false);

	const thing = useContext(ThingContext) as Thing;
	const { settings, showSettings, setShowSettings, setShowSidebar } = useContext(PageContext) as PageProps;

	const fetchThing = useCallback(
		async (currentURL: string) => {
			setLoadingThing(true);
			await thing.fetch(currentURL, settings.defaultEndpoint);
			if (!thing.fetchSuccessful) {
				console.log("could not load thing");
				if (settings.console.stringifyOutput)
					console.log("last response from loading thing - ", JSON.stringify(thing.lastResponse, null, 2));
				else console.log("last response from loading thing - ", thing.lastResponse);
				if (thing.errorMessage) console.log(thing.errorMessage);
				if (thing.errorTraceback) console.log(thing.errorTraceback);
			} else if (window.location.hash && currentURL === window.location.hash.substring(1)) {
				// load successful, remove hash
				window.location.hash = "";
			}
			setLoadingThing(false);
		},
		[settings],
	);

	useEffect(() => {
		if (!currentURL) return;
		fetchThing(currentURL);
	}, []);

	return (
		<Stack id="locator-horizontal-layout" direction="row" sx={{ pb: 1 }}>
			<Box>
				<IconButton id="view-sidebar-icon" sx={{ borderRadius: 0 }} onClick={() => setShowSidebar(true)}>
					<MenuIcon />
				</IconButton>
				{!showSettings ? (
					<IconButton id="show-settings-icon" onClick={() => setShowSettings(true)} sx={{ borderRadius: 0 }}>
						<SettingsTwoToneIcon />
					</IconButton>
				) : (
					<IconButton id="hide-settings-icon" onClick={() => setShowSettings(false)} sx={{ borderRadius: 0 }}>
						<ArrowBackTwoToneIcon />
					</IconButton>
				)}
			</Box>
			<LocatorAutocomplete
				existingURLs={existingURLs}
				currentURL={currentURL}
				setCurrentURL={setCurrentURL}
				editURLsList={modifyOptions}
				fetchThing={fetchThing}
			/>
			<Box id="loader-button-options-box" sx={{ display: "flex" }}>
				<Button
					id="load-thing-using-url-locator-button"
					size="small"
					onClick={async () => await fetchThing(currentURL)}
					sx={{ borderRadius: 0 }}
				>
					Load
					{loadingThing ? (
						<Box sx={{ pl: 1, pt: 0.5 }}>
							<CircularProgress size={20} />
						</Box>
					) : null}
				</Button>
				<Divider orientation="vertical" />
				{settings.useLocalStorage ? (
					<IconButton id="save-thing-url" sx={{ borderRadius: 0 }} onClick={() => modifyOptions(currentURL, "ADD")}>
						<SaveTwoToneIcon />
					</IconButton>
				) : null}
				<IconButton
					id="open-resource-json-in-new-tab"
					onClick={() => window.open(settings.defaultEndpoint ? currentURL + settings.defaultEndpoint : currentURL)}
					sx={{ borderRadius: 0 }}
				>
					<OpenInNewTwoToneIcon />
				</IconButton>
				<Divider orientation="vertical"></Divider>
				<Button id="clear-thing" size="small" onClick={() => thing.clearState()} sx={{ borderRadius: 0 }}>
					Clear
				</Button>
			</Box>
		</Stack>
	);
});

type LocatorAutocompleteProps = {
	existingURLs: string[];
	currentURL: string;
	setCurrentURL: React.Dispatch<React.SetStateAction<string>>;
	editURLsList: (inputURL: string, operation: "ADD" | "REMOVE") => void;
	fetchThing: (currentURL: string) => void;
};

const LocatorAutocomplete = ({
	existingURLs,
	currentURL,
	setCurrentURL,
	editURLsList,
	fetchThing,
}: LocatorAutocompleteProps) => {
	// show delete button at given option
	const [autocompleteShowDeleteIcon, setAutocompleteShowDeleteIcon] = useState<string>("");
	const thing = useContext(ThingContext) as Thing;

	return (
		<Autocomplete
			id="locator-autocomplete"
			freeSolo
			disablePortal
			autoComplete
			size="small"
			onChange={(_, name) => {
				setCurrentURL(name as string);
			}}
			value={currentURL}
			options={existingURLs}
			sx={{ flexGrow: 1, display: "flex" }}
			renderInput={(params) =>
				window.innerWidth < 600 ? (
					<ZoomedInput
						label="Thing Description URL"
						inputValue={currentURL}
						setInputValue={setCurrentURL}
						error={!thing.fetchSuccessful}
						// @ts-ignore
						sx={{ flexGrow: 0.99, display: "flex", borderRadius: 0 }}
						{...params}
					/>
				) : (
					<TextField
						label="Thing Description URL"
						error={!thing.fetchSuccessful}
						sx={{ flexGrow: 0.99, display: "flex", borderRadius: 0 }}
						onChange={(event) => setCurrentURL(event.target.value)}
						onKeyDown={async (event) => {
							if (event.key === "Enter") {
								await fetchThing(currentURL);
							}
						}}
						{...params}
					/>
				)
			}
			renderOption={(props, option: any, {}) => {
				const key = props.key;
				delete props.key;
				return (
					<li
						key={key}
						{...props} // key no longer supports spread operator
						onMouseOver={() => setAutocompleteShowDeleteIcon(option)}
						onMouseLeave={() => setAutocompleteShowDeleteIcon("")}
					>
						<Typography
							sx={{
								display: "flex",
								flexGrow: 1,
								fontWeight: option === autocompleteShowDeleteIcon ? "bold" : null,
							}}
						>
							{option}
						</Typography>
						{option === autocompleteShowDeleteIcon ? (
							<IconButton size="small" onClick={() => editURLsList(option, "REMOVE")}>
								<DeleteForeverIcon fontSize="small" />
							</IconButton>
						) : null}
					</li>
				);
			}}
		/>
	);
};
