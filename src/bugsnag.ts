import Bugsnag from '@bugsnag/js'
import BugsnagPluginReact from '@bugsnag/plugin-react'

Bugsnag.start({
  apiKey: import.meta.env.VITE_BUGSNAG_API_KEY,
  plugins: [new BugsnagPluginReact()],
  releaseStage: import.meta.env.MODE,
  appVersion: '0.1.0',
})

export default Bugsnag
