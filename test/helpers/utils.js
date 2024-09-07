'use strict'
const fs = require('fs')
const path = require('path')
const { faker } = require('@faker-js/faker')

const logsDir = path.join(__dirname, '../logs')

// Ensure logs directory exists
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir)
}

/**
 * Builds a CURL command string based on the HTTP method, URL, headers, and payload.
 *
 * @param {string} method - The HTTP method (e.g., GET, POST, PUT, DELETE).
 * @param {string} url - The base URL for the request.
 * @param {string} endpoint - The API endpoint.
 * @param {Object} [headers={}] - The headers to be included in the CURL command.
 * @param {Object} [payload={}] - The request payload (if applicable).
 * @returns {string} The constructed CURL command string.
 */
function buildCurlCommand(method, url, endpoint, headers, payload) {
    let curlCommand = `curl -svX ${method.toUpperCase()} "${url}"`

    if (headers) {
        for (const [key, value] of Object.entries(headers)) {
            curlCommand += ` -H "${key}: ${value}"`
        }
    }

    if (payload) {
        curlCommand += ` -d '${JSON.stringify(payload)}'`
    }

    return curlCommand
}

/**
 * Logs API request and response details to a file, including the CURL command and response details.
 *
 * @param {string} endpoint - The API endpoint being hit.
 * @param {string} method - The HTTP method (e.g., POST, GET).
 * @param {string} url - The full URL of the request.
 * @param {Object} payload - The payload sent with the request.
 * @param {Object} headers - The headers sent with the request.
 * @param {number} duration - The duration of the request in milliseconds.
 * @param {Object} response - The response object returned by the API.
 */
function logApiToFile(endpoint, method, url, payload, headers, duration, response) {
    const logFile = path.join(logsDir, `${globalLogFileName}.log`)
    let rebuiltCurl = buildCurlCommand(method, url, endpoint, headers, payload)
    let logMessage = `{\n`
    logMessage += `\tmethod: ${method},\n`
    logMessage += `\tendpoint: ${endpoint},\n`
    logMessage += `\tCURL: ${rebuiltCurl},\n`
    logMessage += `\turl: ${url},\n`
    logMessage += `\ttime: ${new Date().toISOString()},\n`
    logMessage += `\theaders: ${JSON.stringify(headers)},\n`
    logMessage += `\tPAYLOAD: ${JSON.stringify(payload)},\n`
    logMessage += `\tduration: ${duration},\n`
    logMessage += `\tSTATUS_CODE: ${response.statusCode},\n`
    logMessage += `\tRESPONSE_BODY: ${JSON.stringify(response.body)},\n`
    logMessage += `\tresponse: ${JSON.stringify(response)},\n`
    logMessage += `},\n`

    fs.appendFileSync(logFile, logMessage)
}

/**
 * Logs a custom debug message to a file.
 *
 * @param {string} debugMessage - The message to be logged.
 */
function logMessageToFile(debugMessage) {
    const logFile = path.join(logsDir, `${globalLogFileName}.log`)
    fs.appendFileSync(logFile, `{\n\t"debugMessage": "${debugMessage}"\n},\n`)
}

/**
 * Clears all log files in the logs directory.
 */
function clearLogs() {
    console.log('Logs directory:', logsDir)
    if (fs.existsSync(logsDir)) {
        fs.readdirSync(logsDir).forEach(file => {
            const filePath = path.join(logsDir, file)
            if (fs.lstatSync(filePath).isFile()) {
                fs.unlinkSync(filePath)  // Delete each file
            }
        })
    }
}

/**
 * Sets the global log file name based on the test suite being executed.
 *
 * @param {string} specFileName - The name of the test suite (e.g., pet_api).
 */
function setLogFileName(specFileName) {
    global.globalLogFileName = specFileName
}

/**
 * Generates a random pet object with optional default values for name, category, and status.
 *
 * @param {string} [name=undefined] - The pet's name.
 * @param {string} [category=undefined] - The pet's category (e.g., dog, cat).
 * @param {string} [status=undefined] - The pet's status (e.g., available, pending).
 * @returns {Object} A random pet object.
 */
async function generateRandomPet(name = undefined, category = undefined, status = undefined) {
    return {
        "name": name || faker.person.firstName(),
        "category": category || faker.helpers.arrayElement(["dog", "cat", "bird", "fish"]),
        "status": status || faker.helpers.arrayElement(["available", "pending"])
    }
}

/**
 * Verifies if the actual status code matches the expected status code.
 *
 * @param {number} expectedStatusCode - The expected status code.
 * @param {number} actualStatusCode - The actual status code returned by the API.
 * @returns {Array<string>} Array of mismatch errors, or an empty array if they match.
 */
function verifyStatusCode(expectedStatusCode, actualStatusCode) {
    return actualStatusCode !== expectedStatusCode ? 
        [`Expected status ${expectedStatusCode} does NOT match actual status ${actualStatusCode}\n\n`] : []
}

/**
 * Verifies that expected text strings are present in the API response body.
 *
 * @param {Array<string>} expectedResponseTexts - The list of expected text strings.
 * @param {Object} responseBody - The API response body.
 * @returns {Array<string>} Array of mismatch errors, or an empty array if all strings are found.
 */
function verifyExpectedResponseText(expectedResponseTexts, responseBody) {
    let results = []

    for (let i = 0; i < expectedResponseTexts.length; i++) {
        if (!JSON.stringify(responseBody).includes(expectedResponseTexts[i])) {
            results.push(
                `Expected string ${expectedResponseTexts[i]} does NOT appear in results content\n\n`
            )
        }
    }

    return results
}

/**
 * Verifies that unexpected text strings are not present in the API response body.
 *
 * @param {Array<string>} unexpectedResponseTexts - The list of unexpected text strings.
 * @param {Object} responseBody - The API response body.
 * @returns {Array<string>} Array of mismatch errors, or an empty array if none of the strings are found.
 */
function verifyUnexpectedResponseText(unexpectedResponseTexts, responseBody) {
    let results = []

    for (let i = 0; i < unexpectedResponseTexts.length; i++) {
        if (JSON.stringify(responseBody).includes(unexpectedResponseTexts[i])) {
            results.push(
                `Unexpected string ${unexpectedResponseTexts[i]} DOES appear in results content\n\n`
            )
        }
    }

    return results
}

/**
 * Compiles and formats the results of a verification check.
 *
 * @param {Array<string>} results - The results of the verification checks.
 * @returns {string} A formatted string indicating whether there are mismatches or not.
 */
function compileResults(results) {
    return results.length !== 0 ? 
        `\n${results.join('')}\n\nThere were ${results.length} mismatches!\n` : 
        "No mismatch values"
}

/**
 * Performs a multi-point verification on the API response, checking status codes, response body, and headers.
 *
 * @param {Object} response - The API response object.
 * @param {number} [expectedStatusCode=undefined] - The expected status code.
 * @param {Array<string>} [expectedJSONResponseTexts=undefined] - Expected text strings in the JSON response.
 * @param {Array<string>} [unexpectedJSONResponseTexts=undefined] - Unexpected text strings in the JSON response.
 * @param {Array<string>} [expectedHeaderTexts=undefined] - Expected text strings in the response headers.
 * @param {Array<string>} [unexpectedHeaderTexts=undefined] - Unexpected text strings in the response headers.
 * @param {Array<string>} [expectedResponseBodyTexts=undefined] - Expected text strings in the response body.
 * @param {Array<string>} [unexpectedResponseBodyTexts=undefined] - Unexpected text strings in the response body.
 * @returns {string} A string with the result of the verification checks.
 */
async function multiPointVerification(response, expectedStatusCode = undefined,
    expectedJSONResponseTexts = undefined,
    unexpectedJSONResponseTexts = undefined,
    expectedHeaderTexts = undefined,
    unexpectedHeaderTexts = undefined,
    expectedResponseBodyTexts = undefined,
    unexpectedResponseBodyTexts = undefined) {
    
    let results = []

    // test for expected status code
    if (expectedStatusCode !== undefined) {
        results = results.concat(verifyStatusCode(expectedStatusCode, response.statusCode))
    }

    // test for response JSON body (does include)
    if (expectedJSONResponseTexts !== undefined) {
        results = results.concat(verifyExpectedResponseText(expectedJSONResponseTexts, response.body))
    }

    // test for response JSON body (does NOT include)
    if (unexpectedJSONResponseTexts !== undefined) {
        results = results.concat(verifyUnexpectedResponseText(unexpectedJSONResponseTexts, response.body))
    }

    // test for response headers (does include)
    if (expectedHeaderTexts !== undefined) {
        results = results.concat(verifyExpectedResponseText(expectedHeaderTexts, response.header))
    }

    // test for response headers (does NOT include)
    if (unexpectedHeaderTexts !== undefined) {
        results = results.concat(verifyUnexpectedResponseText(unexpectedHeaderTexts, response.header))
    }

    // test for response text body (does include)
    if (expectedResponseBodyTexts !== undefined) {
        results = results.concat(verifyExpectedResponseText(expectedResponseBodyTexts, response.body))
    }

    // test for response text body (does NOT include)
    if (unexpectedResponseBodyTexts !== undefined) {
        results = results.concat(verifyUnexpectedResponseText(unexpectedResponseBodyTexts, response.body))
    }

    // compile results
    return compileResults(results)
}

/**
 * Pauses execution for a specified number of seconds.
 *
 * @param {number} seconds - The number of seconds to sleep.
 * @returns {Promise} A promise that resolves after the specified number of seconds.
 */
function sleep(seconds) {
    return new Promise(res => setTimeout(res, seconds*1000))
}

/**
 * Logs detailed information about an API response to the console.
 *
 * @param {Object} apiResponse - The API response object.
 */
function apiDebugger(apiResponse) {
    console.log("\nAPI DEBUGGER\n\n")
    console.log("\nSTATUS CODE: ", apiResponse.statusCode)
    console.log("\nRaw JSON Body: ", JSON.stringify(apiResponse.body))
    console.log("\nRaw Headers: ",  JSON.stringify(apiResponse.header))
    console.log("\nRaw Text Body: ", apiResponse.text)
    console.log("\nEND API DEBUGGER\n\n")
}

/**
 * Generates a random string of a specified length.
 *
 * @param {number} length - The length of the string to generate.
 * @returns {string} A random string consisting of letters and numbers.
 */
function stringGen(length) {
    let text = ""
    const charset = "abcdefghijklmnopqrstuvwxyz0123456789"
    for (let i = 0; i < length; i++) {
        text += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    return text
}

module.exports = {
    logApiToFile : logApiToFile,
    logMessageToFile : logMessageToFile,
    clearLogs : clearLogs,
    setLogFileName : setLogFileName,
    generateRandomPet : generateRandomPet,
    multiPointVerification : multiPointVerification,
    sleep : sleep,
    apiDebugger : apiDebugger,
    stringGen : stringGen
}
