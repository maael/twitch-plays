import React from 'react'
import ReactDom from 'react-dom'
import App from './App';

window['myApp'] = {
  openTwitchAuth: () => {
    Neutralino.os.open(`https://id.twitch.tv/oauth2/authorize?client_id=<your client ID>&redirect_uri=http://localhost:${NL_PORT}&response_type=code&scope=${['channel:read:subscriptions'].join(' ')}`);
  },
  setTray: () => {
      if(NL_MODE != "window") {
          console.log("INFO: Tray menu is only available in the window mode.");
          return;
      }
      let tray = {
          icon: "/resources/icons/trayIcon.png",
          menuItems: [
              {id: "VERSION", text: "Get version"},
              {id: "SEP", text: "-"},
              {id: "QUIT", text: "Quit"}
          ]
      };
      Neutralino.os.setTray(tray);
  },
  onTrayMenuItemClicked: (event) => {
      switch(event.detail.id) {
          case "VERSION":
              Neutralino.os.showMessageBox("Version information",
                  `Neutralinojs server: v${NL_VERSION} | Neutralinojs client: v${NL_CVERSION}`);
              break;
          case "QUIT":
              Neutralino.app.exit();
              break;
      }
  },
  onWindowClose: () => {
      Neutralino.app.exit();
  }
};

// Initialize native API communication. This is non-blocking
// use 'ready' event to run code on app load.
// Avoid calling API functions before init or after init.
Neutralino.init();

Neutralino.events.on("trayMenuItemClicked", window['myApp'].onTrayMenuItemClicked);
Neutralino.events.on("windowClose", window['myApp'].onWindowClose);
Neutralino.events.on("ready", () => {
  if(NL_OS != "Darwin") { // TODO: Fix https://github.com/neutralinojs/neutralinojs/issues/615
      window['myApp'].setTray();
  }
})

Neutralino.events.on("ready", () => {
  ReactDom.render(<App />, document.querySelector('#app'))
});
