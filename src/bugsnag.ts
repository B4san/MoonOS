import Bugsnag from '@bugsnag/js'
import BugsnagPluginReact from '@bugsnag/plugin-react'

const apiKey = import.meta.env.VITE_BUGSNAG_API_KEY

if (apiKey) {
  Bugsnag.start({
    apiKey,
    plugins: [new BugsnagPluginReact()],
    releaseStage: import.meta.env.MODE,
    appVersion: '0.1.0',
  })
}

export default Bugsnag
export const bugsnagEnabled = !!apiKey
