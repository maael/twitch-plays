import React from 'react'
import ReactDom from 'react-dom'
import App from './App'

window['myApp'] = {
  onWindowClose: () => {
    Neutralino.app.exit()
  },
  callScript: (keys: string) => {
    console.info('[cmd:run]', `${(window as any).NL_CWD}/cmd/nircmd.exe ${keys}`)
    Neutralino.os.execCommand(
      `${(window as any).NL_CWD}/cmd/nircmd.exe ${keys}`,
      (d) => {
        console.info('d', d)
      },
      () => {
        console.error('error')
      }
    )
  },
}

// Initialize native API communication. This is non-blocking
// use 'ready' event to run code on app load.
// Avoid calling API functions before init or after init.
Neutralino.init()

Neutralino.events.on('windowClose', window['myApp'].onWindowClose)

Neutralino.events.on('ready', () => {
  ReactDom.render(<App />, document.querySelector('#app'))
})
