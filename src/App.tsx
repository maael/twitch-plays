import React from 'react'
import { FaTwitch as TwitchIco } from 'react-icons/fa'
import { MemoryRouter as Router, Switch, Route, Link } from 'react-router-dom'
import { v4 } from 'uuid'
import chat, { useChatEvents } from './chat'
import useStorage from './components/hooks/useStorage'
import MainScreen from './components/screens/Main'
import TeamsConfigScreen from './components/screens/TeamsConfigScreen'
import ControlsConfigScreen, { ControlConfig } from './components/screens/ControlsConfig'
import { translateActionToCommand, getMatchedActions } from './utils'

/**
 * TODO: Audience division
 * TODO: Limit to application?
 * TODO: Test building and compiling for Windows
 */

const DEFAULT_CONTROLS: ControlConfig[] = [
  {
    id: v4(),
    name: 'Right Click',
    command: 'yep',
    actions: ['Right Click'],
    team: undefined,
  },
  {
    id: v4(),
    name: 'Left Click',
    command: 'lul',
    actions: ['Click'],
    team: undefined,
  },
  {
    id: v4(),
    name: 'Jump',
    command: 'mousey',
    actions: ['Space'],
    team: undefined,
  },
]

export default function App() {
  const [settings, setSettings] = useStorage('settings', { waitDuration: 10, autoConnect: true })
  const [client, setClient] = React.useState<ReturnType<typeof chat> | null>(null)
  const [channel, setChannel] = useStorage('channel', '', (c) => (c ? setClient(chat(c)) : null))
  const [chatEvents, resetChat] = useChatEvents()
  const chatEventsRef = React.useRef(chatEvents)
  const [lastCheckTime, setLastCheckTime] = React.useState<Date | null>(null)
  const [controls, setControls] = useStorage<ControlConfig[]>('controls', DEFAULT_CONTROLS)
  React.useEffect(() => {
    chatEventsRef.current = chatEvents
  }, [chatEvents])
  const [lastAction, setLastAction] = React.useState<string | null>(null)
  React.useEffect(() => {
    const interval = setInterval(() => {
      const actions = getMatchedActions(controls, chatEventsRef.current)
      const actionText = Object.entries(actions).map(translateActionToCommand).filter(Boolean).join(', ')
      setLastAction(actionText)
      setLastCheckTime(new Date())
      resetChat()
    }, settings.waitDuration * 1000)
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [controls, settings.waitDuration, client])
  return (
    <Router initialEntries={['/']}>
      <div className="flex flex-row justify-start">
        <div className="flex-1">
          <div className="inline-block">
            <Link to="/">
              <h1 className="flex flex-row gap-1 items-center text-white bg-purple-600 rounded-md px-3 py-1 transform hover:scale-105 transition-transform shadow-md">
                <TwitchIco className="text-2xl" /> <span className="relative -top-0.5">Twitch Plays</span>
              </h1>
            </Link>
          </div>
        </div>
        <form
          className="flex flex-row"
          onSubmit={(e) => {
            e.preventDefault()
            if (client) {
              client.disconnect()
              resetChat()
              setClient(null)
            } else {
              setClient(chat(channel))
            }
          }}
        >
          <input
            className="bg-gray-700 px-2 py-1 rounded-l-md border-b border-l border-purple-500"
            placeholder="Channel Name"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            disabled={!!client}
          />
          <button className="bg-purple-600 text-white py-1 px-3 rounded-r-sm transform hover:scale-105 transition-transform shadow-md flex flex-row items-center gap-2 w-32 justify-center">
            <TwitchIco /> {client ? 'Disconnect' : 'Connect'}
          </button>
        </form>
      </div>
      <Switch>
        <Route path="/config/teams">
          <TeamsConfigScreen />
        </Route>
        <Route path="/config/controls">
          <ControlsConfigScreen controls={controls} setControls={setControls} />
        </Route>
        <Route path="/">
          <MainScreen
            chatEvents={chatEvents}
            lastAction={lastAction}
            settings={settings}
            setSettings={setSettings}
            controlCount={controls.length}
            lastCheckAt={lastCheckTime}
            isConnected={!!client}
            controls={controls}
          />
        </Route>
      </Switch>
    </Router>
  )
}
