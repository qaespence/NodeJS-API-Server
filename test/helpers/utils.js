'use strict'
const fs = require('fs')
const path = require('path')
const { faker } = require('@faker-js/faker')

const logsDir = path.join(__dirname, '../logs')

// Ensure logs directory exists
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir)
}

// Function to build a curl command
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

// Helper function to log to a file
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

function logMessageToFile(debugMessage) {
    const logFile = path.join(logsDir, `${globalLogFileName}.log`)
    fs.appendFileSync(logFile, `{\n\t"debugMessage": "${debugMessage}"\n},\n`)
}

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

function setLogFileName(specFileName) {
    global.globalLogFileName = specFileName
}

async function generateRandomPet(name = undefined, category = undefined, status = undefined) {
    return {
        "name": name || faker.person.firstName(),
        "category": category || faker.helpers.arrayElement(["dog", "cat", "bird", "fish"]),
        "status": status || faker.helpers.arrayElement(["available", "pending"])
    }
}

function verifyStatusCode(expectedStatusCode, actualStatusCode) {
    return actualStatusCode !== expectedStatusCode ? 
        [`Expected status ${expectedStatusCode} does NOT match actual status ${actualStatusCode}\n\n`] : []
}

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

function compileResults(results) {
    return results.length !== 0 ? 
        `\n${results.join('')}\n\nThere were ${results.length} mismatches!\n` : 
        "No mismatch values"
}

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

function sleep(seconds) {
    return new Promise(res => setTimeout(res, seconds*1000))
}

function apiDebugger(apiResponse) {
    console.log("\nAPI DEBUGGER\n\n")
    console.log("\nSTATUS CODE: ", apiResponse.statusCode)
    console.log("\nRaw JSON Body: ", JSON.stringify(apiResponse.body))
    console.log("\nRaw Headers: ",  JSON.stringify(apiResponse.header))
    console.log("\nRaw Text Body: ", apiResponse.text)
    console.log("\nEND API DEBUGGER\n\n")
}

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
