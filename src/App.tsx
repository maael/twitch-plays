import React from 'react'
import { FaTwitch as TwitchIco } from 'react-icons/fa'
import { MemoryRouter as Router, Switch, Route, Link } from 'react-router-dom'
import { v4 } from 'uuid'
import chat, { useChatEvents, ChatItem } from './chat'
import useStorage from './components/hooks/useStorage'
import MainScreen from './components/screens/Main'
import AudienceConfigScreen from './components/screens/AudienceConfig'
import ControlsConfigScreen, { ControlConfig } from './components/screens/ControlsConfig'

/**
 * TODO: Bar for action timing
 * TODO: Audience division
 * TODO: Limit to application?
 * TODO: Test building and compiling for Windows
 * TODO: Highlight selected action (if any) in chat log
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
      const actionText = Object.entries(actions)
        .map(([team, action]) => {
          if (!action) return ''
          const clicks = action.actions
            .filter((a) => a.endsWith('Click'))
            .map((c) => `sendmouse ${c.startsWith('Right') ? 'right' : 'left'} click`)
          const scrolls = action.actions
            .filter((a) => a.startsWith('Scroll'))
            .map((s) => `sendmouse wheel ${s.endsWith('Up') ? 120 : -120}`)
          let keys = action.actions
            .filter((a) => !a.startsWith('Scroll') && !a.endsWith('Click'))
            .map((k) => {
              if (k.startsWith('F')) return k
              if (k.length === 1 && k.match(/^[a-z0-9]$/)) return k
              if (k === 'ArrowLeft') return '0x25'
              if (k === 'ArrowRight') return '0x27'
              if (k === 'ArrowUp') return '0x26'
              if (k === 'ArrowDown') return '0x28'
              const kSafe = k.toLowerCase().replace(' ', '')
              if (kSafe === 'control') return 'ctrl'
              if (kSafe === 'space') return 'spc'
              if (kSafe === 'backspace') return kSafe
              if (kSafe === 'alt') return kSafe
              if (kSafe === 'shift') return kSafe
              if (kSafe === 'escape') return 'esc'
              if (kSafe === 'enter') return kSafe
              console.warn('No matching key for', k, kSafe)
              return ''
            })
            .filter(Boolean)
          const keyCombo = keys.length ? `sendkeypress ${keys.join('+')}` : ''
          ;([] as string[])
            .concat(scrolls)
            .concat(clicks)
            .concat([keyCombo])
            .forEach((c) => {
              if (!c) return
              console.info('[send]', c)
              window['myApp'].callScript(c)
            })
          return `[${team}] ${action.name}`
        })
        .filter(Boolean)
        .join(', ')
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
        <Route path="/config/audience">
          <AudienceConfigScreen />
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
          />
        </Route>
      </Switch>
    </Router>
  )
}
