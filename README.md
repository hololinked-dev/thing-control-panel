# Thing Control Panel

Admin control panel in React for Things having a standard WoT Thing Description with HTTP protocol binding or 
implemented with [`hololinked`](https://github.com/VigneshVSV/hololinked). Suitable for development of server backend, 
test properties, actions and events or generic use purposes to interact with the Thing. 

The GUI is only coming up, its still rough on the edges. If anything is not upto your standard or buggy/broken,
 please do feel free to reach me, or open a discussion in the discussions tab or an issue. 
<br>
[![email](https://img.shields.io/badge/email%20me-brown)](mailto:vignesh.vaidyanathan@hololinked.dev) [![ways to contact me](https://img.shields.io/badge/ways_to_contact_me-brown)](https://hololinked.dev/contact) <br>

[Visit Here](https://control-panel.hololinked.dev) for predeployed website with SSL. <br>
[Visit Here](http://no-ssl-control-panel.hololinked.net) for predeployed website without SSL. <br> <br>
![Website Status](https://img.shields.io/website?url=https%3A%2F%2Fcontrol-panel.hololinked.dev&label=SSL%20Website)
![Website Status](https://img.shields.io/website?url=http%3A%2F%2Fno-ssl-control-panel.hololinked.net&label=Non%20SSL%20Website) <br>
<br>
Based on your server SSL support, you can choose the appropriate link.

![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/hololinked-dev/thing-control-panel/docker-publish.yml?label=Build%20Docker%20Image)

### Installation

If you intend to self host or use as a desktop app:

```npm install . ``` or ```npm install . --force``` to install the requirements and dependencies <br/>
```npm run dev``` to run as react app <br/>
```npm run dev -- --host --port 12345``` to run on the network <br/>
```npm run build``` to build and host with your own HTTP server <br/>

This application is written in plain React and therefore CSR. It is intended to keep it like that.

### Usage

Insert the address of the device or the endpoint of the thing description, then press load. If you are using your own Thing server runtime or a standard location to store
your thing descriptions, click on settings (cog-wheel on top left) and edit "default endpoint for fetching thing description" to suit
your requirements. The address enetered in the address bar will then be considered as base URL and the default endpoint will be appended.
Store your addresses in the browser using the store icon on the top right so that you dont have to type the address everytime - this storage is browser specific.  

If you are using `hololinked` as the server, the default endpoint must be one of `/resources/wot-td` or `/resources/wot-td?ignore_errors=true`, and
enter the Thing addresss as `http(s)://{address of host}/{instance name of the thing}`.

If self signed HTTP(s) certificate is used, you might have to give permission to the browser. You can open the endpoint in new tab using the new tab button on top right. 
This should fetch the thing description without fail. Sometimes, the permission given for self signed certificate given may not match the form (TD form field) entries, so please do make sure you can atleast fetch/read one property from a browser tab if the GUI is still not working.  

After you load, your defined properties, actions and events are shown. You can freely interact with them as shown below:

![Read-Write-Observe Properties](readme-assets/properties.png)
![Execute Actions](readme-assets/actions.png)
![Stream Events](readme-assets/events.png)

Supported ops are
- read, write & observe property
- invoke action
- subscribe & unsubscribe event 
  
Whenever an operation is executed, the output is printed in the console below. 
Its recommended to install a JSON viewer for your web browser, like [this](https://chromewebstore.google.com/detail/json-viewer/gbmdgpbipfallnflgajpaliibnhdgobh).

Credentials or security definitions are not supported yet, sorry, please feel free to add support for it. The client is built on top of node-wot so all
node-wot features can, in principle, be supported. 

You can then load the console entries in a new tab and read it in a correctly formatted way or download it for other purposes. 
Edit the number of entries that can stored in the console output by setting the value of "Max Entries" from the drop down. 
More entries will take more RAM, but useful for capturing events or eventful measurement data directly in the GUI. 

### Configuration - app.config.ts

This file contains certain configurations that can be modified according to your requirements:

- `useSSL` - when set to `true`, the app will rendered with a self signed SSL certificate from vite, and the clients will be forced to use SSL. 

### To Do

##### Contributors welcome. Feel free to also propose new ideas or add more ops. There are also similar projects available from Web of Things community. 

- Improvements in viewing TD, especially for events as its shown right below 
- Settings are not saved correctly in browser
- Responsive layout for smaller screens
- Packaging in Electron
- Observe all properties, subscribe all events & top level forms

Possible further ideas
- Database viewer (i.e. viewer of properties that are stored in database)
- Log Viewer does not work correctly, although its almost complete. 
- Graphical data acquisition into file using events


