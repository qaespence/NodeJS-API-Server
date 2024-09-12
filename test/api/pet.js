'use strict'
const basicRequests = require('./basicRequests.js')

/**
 * Adds a new pet to the system.
 *
 * @param {string} [name=undefined] - The name of the pet. Optional parameter.
 * @param {string} [category=undefined] - The category (or type) of the pet, e.g., dog, cat. Optional parameter.
 * @param {string} [status=undefined] - The status of the pet, e.g., available, pending, sold. Optional parameter.
 */
async function addPet(name = undefined, category = undefined, status = undefined) {
    let headers = {"Content-Type": "application/json"}
    
    let payload = {}
    if (name !== undefined) { payload.name = name }
    if (category !== undefined) { payload.category = category }
    if (status !== undefined) { payload.status = status }
       
    return await basicRequests.post("/pet", headers, payload)
}

/**
 * Retrieves the details of a pet by its ID.
 *
 * @param {number} petID - The ID of the pet to retrieve.
 */
async function getPet(petID) {
    return await basicRequests.get(`/pet/${petID}`)
}

/**
 * Updates the details of an existing pet.
 *
 * @param {number} petID - The ID of the pet to update.
 * @param {string} [name=undefined] - The updated name of the pet. Optional parameter.
 * @param {string} [category=undefined] - The updated category (or type) of the pet. Optional parameter.
 * @param {string} [status=undefined] - The updated status of the pet. Optional parameter.
 */
async function updatePet(petID, name = undefined, category = undefined, status = undefined) {
    let headers = {"Content-Type": "application/json"}
    
    let payload = {}
    if (name !== undefined) { payload.name = name }
    if (category !== undefined) { payload.category = category }
    if (status !== undefined) { payload.status = status }
       
    return await basicRequests.put(`/pet/${petID}`, headers, payload)
}

/**
 * Deletes a pet by its ID.
 *
 * @param {number} petID - The ID of the pet to delete.
 */
async function deletePet(petID) {
    return await basicRequests.del(`/pet/${petID}`)
}

/**
 * Finds the details of one or more pets by status.
 *
 * @param {string} [status=undefined] - The status of the pet(s) to find.
 */
async function findPetByStatus(status = undefined) {
    let queryString = ""
    if (status !== undefined) { queryString = `?status=${status}` }
    
    return await basicRequests.get(`/pet/findByStatus${queryString}`)
}

module.exports = {
    addPet : addPet,
    getPet : getPet,
    updatePet : updatePet,
    deletePet : deletePet,
    findPetByStatus : findPetByStatus
}