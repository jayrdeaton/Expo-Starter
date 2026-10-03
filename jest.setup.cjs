globalThis.IS_REACT_ACT_ENVIRONMENT = true

const handleUnhandledRejection = (reason) => {
  console.error('UnhandledRejection in tests:', reason) // eslint-disable-line no-console
}
const handleUncaughtException = (err) => {
  console.error('UncaughtException in tests:', err) // eslint-disable-line no-console
}

if (typeof process !== 'undefined' && process?.on) {
  process.on('unhandledRejection', handleUnhandledRejection)
  process.on('uncaughtException', handleUncaughtException)
}
