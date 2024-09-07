const utils = require('./helpers/utils')

// Define the global API URL
global.apiUrl = 'http://localhost:3000'

// Define the log file name prefix
global.globalLogFileName = "unnamed"

// Clear logs at the start of each test run
utils.clearLogs()