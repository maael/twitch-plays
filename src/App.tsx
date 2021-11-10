import React from 'react'
import { FaTwitch as TwitchIco } from 'react-icons/fa'
import { MemoryRouter as Router, Switch, Route, Link } from 'react-router-dom'
import { v4 } from 'uuid'
import chat, { useChatEvents, ChatItem } from './chat'
import useStorage from './components/hooks/useStorage'
import MainScreen from './components/screens/Main'
import AudienceConfigScreen from './components/screens/AudienceConfig'
import ControlsConfigScreen, { ControlConfig } from './components/screens/ControlsConfig'

const DEFAULT_CONTROLS: ControlConfig[] = [
  {
    id: v4(),
    name: 'Right Click',
    readableScript: 'Right Click',
    script: 'sendmouse right click',
    command: 'yep',
    team: undefined,
  },
  {
    id: v4(),
    name: 'Left Click',
    readableScript: 'Left Click',
    script: 'sendmouse left click',
    command: 'lul',
    team: undefined,
  },
  {
    id: v4(),
    name: 'Jump',
    readableScript: 'Caps Lock',
    script: 'sendkey capslock press',
    command: 'mousey',
    team: undefined,
  },
]

function getMatchedActions(config: ControlConfig[], chatItems: ChatItem[]) {
  const commands = config.reduce(
    (acc, { command, team }) => ({ ...acc, [team || 'default']: (acc[team || 'default'] || []).concat(command) }),
    {}
  )
  const chatCalculations = chatItems.reduce<{ [k: string]: { [k: string]: number } }>((acc, c) => {
    const team = 'default'
    const matchedCommand = (commands[team] || []).find((cmd) => c.words.some((w) => w === cmd))
    if (!matchedCommand) return acc
    const existingTeam = acc[team] || {}
    return {
      ...acc,
      [team]: {
        ...existingTeam,
        [matchedCommand]: (existingTeam[matchedCommand] || 0) + 1,
      },
    }
  }, {})
  const teamActionSelections = Object.entries(chatCalculations).reduce<{
    [k: string]: ControlConfig | undefined
  }>((acc, [cmdTeam, commandWeights]) => {
    const selectedCommand = (
      Object.entries(commandWeights)
        .sort(([_a, aWeight], [_b, bWeight]) => aWeight - bWeight)
        .pop() || []
    ).shift()
    const action = config.find(({ team, command }) => command === selectedCommand && (team || 'default') === cmdTeam)
    return {
      ...acc,
      [cmdTeam]: action,
    }
  }, {})
  return teamActionSelections
}

export default function App() {
  const [settings] = useStorage('settings', { waitDuration: 10_000, autoConnect: true })
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
      const actionText = Object.entries(actions)
        .map(([team, action]) => {
          if (!action) return ''
          window['myApp'].callScript(action.script)
          return `[${team}] ${action.name}`
        })
        .filter(Boolean)
        .join(', ')
      setLastAction(actionText)
      setLastCheckTime(new Date())
      resetChat()
    }, settings.waitDuration)
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [controls, settings.waitDuration, client])
  return (
    <Router initialEntries={['/config/controls']}>
      <div className="flex flex-row justify-start">
        <div className="flex-1">
          <Link to="/">
            <h1 className="text-xl flex flex-row gap-2 items-center text-purple-400">
              <TwitchIco /> Twitch Plays
            </h1>
          </Link>
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
            className="bg-gray-700 px-2 py-1"
            placeholder="Channel Name"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            disabled={!!client}
          />
          <button className="bg-purple-600 text-white py-1 px-3 rounded-sm transform hover:translate-y-1 transition-transform shadow-md flex flex-row items-center gap-2 w-32 justify-center">
            <TwitchIco /> {client ? 'Disconnect' : 'Connect'}
          </button>
        </form>
      </div>
      <Switch>
        <Route path="/config/audience">
          <AudienceConfigScreen />
        </Route>
        <Route path="/config/controls">
          <ControlsConfigScreen controls={controls} setControls={setControls} />
        </Route>
        <Route path="/">
          <MainScreen chatEvents={chatEvents} lastAction={lastAction} />
        </Route>
      </Switch>
    </Router>
  )
}
