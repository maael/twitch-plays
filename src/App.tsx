import React from 'react'
import { FaTwitch as TwitchIco, FaArrowRight as RightIco, FaPlusSquare as PlusIco } from 'react-icons/fa'
import {
  MemoryRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import chat, { useChatEvents, ChatItem } from './chat';

const actionConfig = [
  {
    name: 'Right Click',
    script: 'sendmouse right click',
    command: 'yep',
    team: undefined
  },
  {
    name: 'Left Click',
    script: 'sendmouse left click',
    command: 'lul',
    team: undefined
  },
  {
    name: 'Jump',
    script: 'sendkey capslock press',
    command: 'mousey',
    team: undefined
  }
]

function getMatchedActions (config: typeof actionConfig, chatItems: ChatItem[]) {
  const commands = config.reduce((acc, {command, team}) => ({...acc, [team || 'default']: ((acc[team || 'default'] || []).concat(command))}), {});
  const chatCalculations = chatItems.reduce<{[k: string]: {[k: string]: number}}>((acc, c) => {
    const team = 'default';
    const matchedCommand = (commands[team] || []).find((cmd) => c.words.some((w) => w === cmd));
    if (!matchedCommand) return acc;
    const existingTeam = acc[team] || {};
    return {
      ...acc,
      [team]: {
        ...existingTeam,
        [matchedCommand]: (existingTeam[matchedCommand] || 0) + 1
      }
    }
  }, {})
  const teamActionSelections = Object.entries(chatCalculations).reduce<{[k: string]: (typeof actionConfig)[0] | undefined}>((acc, [cmdTeam, commandWeights]) => {
    const selectedCommand = (Object.entries(commandWeights).sort(([_a, aWeight], [_b, bWeight]) => aWeight - bWeight).pop() || []).shift()
    const action = config.find(({team, command}) => (command === selectedCommand) && ((team || 'default') === cmdTeam))
    return {
      ...acc,
      [cmdTeam]: action
    }
  }, {})
  return teamActionSelections
}

export default function App() {
  const [settings] = React.useState(() => ({waitDuration: 10_000}))
  const [channel, setChannel] = React.useState('nyanners');
  const [client, setClient] = React.useState(() => channel ? chat(channel) : null);
  const [chatEvents, resetChat] = useChatEvents()
  const chatEventsRef = React.useRef(chatEvents);
  const [lastCheckTime, setLastCheckTime] = React.useState(null);
  React.useEffect(() => {
    chatEventsRef.current = chatEvents
  }, [chatEvents])
  const [lastAction, setLastAction] = React.useState(null)
  React.useEffect(() => {
    const interval = setInterval(() => {
      const actions = getMatchedActions(actionConfig, chatEventsRef.current);
      const actionText = Object.entries(actions).map(([team, action]) => {
        if (!action) return ''
        window['myApp'].callScript(action.script)
        return `[${team}] ${action.name}`
      }).filter(Boolean).join(', ')
      setLastAction(actionText)
      setLastCheckTime(new Date())
      resetChat()
    }, settings.waitDuration)
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [actionConfig, settings.waitDuration, client])
  return (
    <Router initialEntries={['/']}>
      <div className='flex flex-row justify-start'>
        <div className='flex-1'>
          <Link to='/'>
            <h1 className='text-xl flex flex-row gap-2 items-center text-purple-400'><TwitchIco /> Twitch Plays</h1>
          </Link>
        </div>
        <form className='flex flex-row' onSubmit={(e) => {
          e.preventDefault()
          if (client) {
            client.disconnect()
            resetChat()
            setClient(null)
          } else {
            setClient(chat(channel))
          }
        }}>
          <input className='bg-gray-700 px-2 py-1' placeholder='Channel Name' value={channel} onChange={(e) => setChannel(e.target.value)} disabled={!!client} />
          <button className='bg-purple-600 text-white py-1 px-3 rounded-sm transform hover:translate-y-1 transition-transform shadow-md flex flex-row items-center gap-2 w-32 justify-center'><TwitchIco /> {client ? 'Disconnect' : 'Connect'}</button>
        </form>
      </div>
      <Switch>
        <Route path='/config/audience'>
          <AudienceConfigScreen />
        </Route>
        <Route path='/config/controls'>
          <ControlsConfigScreen />
        </Route>
        <Route path='/'>
          <MainScreen chatEvents={chatEvents} lastAction={lastAction} />
        </Route>
      </Switch>
    </Router>
  )
}

function MainScreen({chatEvents, lastAction}: {chatEvents: ChatItem[], lastAction: string | null}) {
  return (
    <>
      <div className='grid gap-2 grid-cols-2 mt-3'>
        <div className='px-3 py-1 rounded-md text-center'>Controls: VVVVV</div>
        <div className='px-3 py-1 rounded-md text-center'>Audience: 50/50</div>
      </div>
      <div className='grid gap-2 grid-cols-2 mt-3'>
        <Link to='/config/controls'>
          <div className='bg-gray-600 px-3 py-1 rounded-md shadow-md flex flex-row items-center transform hover:translate-y-1 transition-transform cursor-pointer'>
            <div className='flex-1'>Control Configurations</div><RightIco /></div>
        </Link>
        <Link to='/config/audience'>
          <div className='bg-gray-600 px-3 py-1 rounded-md shadow-md flex flex-row items-center transform hover:translate-y-1 transition-transform cursor-pointer'>
            <div className='flex-1'>Audience Configuration</div><RightIco /></div>
        </Link>
      </div>
      <div className='mt-2 rounded-md bg-gray-700 flex-1 flex flex-col relative overflow-hidden'>
        <div className='bg-gray-600 absolute top-0 right-0 left-0 h-8 flex justify-between px-10 items-center text-white'>
          <div>Last action: {lastAction || 'None'}</div>
          <div>{chatEvents.length} message{chatEvents.length === 1 ? '' : 's'}</div>
        </div>
        <div className='bg-gray-300 absolute top-8 right-0 left-0 h-2 shadow-md'>
          <div className='bg-purple-600 h-full transition-all' style={{width: '30%'}} />
        </div>
        <div className='relative flex-1'>
        {chatEvents.length === 0 ? <span className='relative top-12 left-2'>Logs will appear here...</span> : (
        <div className='absolute top-10 right-0 left-0 bottom-0 overflow-y-scroll px-2 py-3 flex flex-col gap-1'>
          {chatEvents.map((c) => {
            return (
              <div key={c.id}><span className='rounded-full bg-purple-700 h-4 w-4 inline-block mr-1'><span className='flex justify-center items-center text-xs' title={`Team: ${'Default'}`}>D</span></span><span style={{color: c.color}}>[{c.displayName}]</span> {c.msg}</div>
            )
          })}
        </div>)}
        </div>
      </div>
    </>
  )
}

function ControlsConfigScreen() {
  const [controls, setControls] = React.useState([{ id: 1 }])
  return (
    <div>
      <h2>Controls</h2>
      <div className='flex flex-col gap-3 mt-2'>
        {controls.map((c) => (<ControlRow key={c.id} />))}
        <button className='flex justify-center items-center py-2 w-full transform hover:translate-y-1 transition-transform' onClick={() => setControls((c) => c.concat([{ id: c.length + 1 }]))}>
          <PlusIco />
        </button>
      </div>
    </div>
  )
}

function ControlRow() {
  return (
    <div className='flex flex-row gap-2'>
      <input className='bg-gray-700 px-2 py-1' placeholder='Control' />
      <input className='bg-gray-700 px-2 py-1' placeholder='Chat Command' />
      <input className='bg-gray-700 px-2 py-1' placeholder='Audience Group' />
    </div>
  )
}

function AudienceConfigScreen() {
  return (
    <div>
      <h2 className='text-lg'>Audience Settings</h2>
      <div className='flex flex-col gap-2'>
      <label className='flex flex-row gap-2 items-center'>
        <input type='checkbox' />
        Subscriber only?
      </label>
      <input className='bg-gray-700 px-2 py-1' placeholder='Number of Groups' />
      <h3 className='mt-3'>Split Method</h3>
      <div className='grid gap-2 grid-cols-3 mt-1'>
        <div className='bg-gray-600 px-3 py-1 rounded-md shadow-md flex flex-row items-center justify-center transform hover:translate-y-1 transition-transform cursor-pointer text-center'>Random</div>
        <div className='bg-gray-600 px-3 py-1 rounded-md shadow-md flex flex-row items-center justify-center transform hover:translate-y-1 transition-transform cursor-pointer text-center'>Alphabet</div>
        <div className='bg-gray-600 px-3 py-1 rounded-md shadow-md flex flex-row items-center justify-center transform hover:translate-y-1 transition-transform cursor-pointer text-center'>Subscriber Status</div>
      </div>
      </div>
    </div>
  )
}