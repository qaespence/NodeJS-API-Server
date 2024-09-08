'use strict'
const utils = require('../helpers/utils.js')

const chai = require('chai')
const chaiHttp = require('chai-http')

chai.use(chaiHttp)

const serverUrl = global.apiServer

/**
 * Sends a POST request to the specified API endpoint.
 *
 * @param {string} path - The API endpoint path (e.g., "/pet").
 * @param {Object} [headers={}] - Headers to be included in the request. Defaults to an empty object.
 * @param {Object} [payload={}] - The payload (body) to send with the POST request. Defaults to an empty object.
 */
function post(path, headers = {}, payload = {}) {
    let startTime = new Date()
    
    return chai.request(serverUrl)
    .post(path)
    .set(headers)
    .send(payload)
    .then(function (res) {
        let endTime = new Date()
        utils.logApiToFile(path, "POST", serverUrl+path, payload, headers, 
            endTime-startTime, res
        )
        return res
    })
    .catch(function (err) {
        throw err
    })
}

/**
 * Sends a GET request to the specified API endpoint.
 *
 * @param {string} path - The API endpoint path (e.g., "/pet/1").
 * @param {Object} [headers={}] - Headers to be included in the request. Defaults to an empty object.
 */
function get(path, headers = {}) {
    let startTime = new Date()

    return chai.request(serverUrl)
    .get(path)
    .set(headers)
    .then(function (res) {
        let endTime = new Date()
        utils.logApiToFile(path, "GET", serverUrl+path, {}, headers, 
            endTime-startTime, res
        )
        return res
    })
    .catch(function (err) {
        throw err
    })
}

/**
 * Sends a PUT request to the specified API endpoint.
 *
 * @param {string} path - The API endpoint path (e.g., "/pet/1").
 * @param {Object} [headers={}] - Headers to be included in the request. Defaults to an empty object.
 * @param {Object} [payload={}] - The payload (body) to send with the PUT request. Defaults to an empty object.
 */
function put(path, headers = {}, payload = {}) {
    let startTime = new Date()

    return chai.request(serverUrl)
    .put(path)
    .set(headers)
    .send(payload)
    .then(function (res) {
        let endTime = new Date()
        utils.logApiToFile(path, "PUT", serverUrl+path, payload, headers, 
            endTime-startTime, res
        )
        return res
    })
    .catch(function (err) {
        throw err
    })
}

/**
 * Sends a PATCH request to the specified API endpoint.
 *
 * @param {string} path - The API endpoint path (e.g., "/pet/1").
 * @param {Object} [headers={}] - Headers to be included in the request. Defaults to an empty object.
 * @param {Object} [payload={}] - The payload (body) to send with the PUT request. Defaults to an empty object.
 */
function patch(path, headers = {}, payload = {}) {
    let startTime = new Date()

    return chai.request(serverUrl)
    .patch(path)
    .set(headers)
    .send(payload)
    .then(function (res) {
        let endTime = new Date()
        utils.logApiToFile(path, "PATCH", serverUrl+path, payload, headers, 
            endTime-startTime, res
        )
        return res
    })
    .catch(function (err) {
        throw err
    })
}

/**
 * Sends a DELETE request to the specified API endpoint.
 *
 * @param {string} path - The API endpoint path (e.g., "/pet/1").
 * @param {Object} [headers={}] - Headers to be included in the request. Defaults to an empty object.
 */
function del(path, headers = {}) {
    let startTime = new Date()

    return chai.request(serverUrl)
    .delete(path)
    .set(headers)
    .then(function (res) {
        let endTime = new Date()
        utils.logApiToFile(path, "DELETE", serverUrl+path, {}, headers, 
            endTime-startTime, res
        )
        return res
    })
    .catch(function (err) {
        throw err
    })
}

module.exports = {
    post : post,
    get : get,
    put : put,
    patch : patch,
    del : del
}
