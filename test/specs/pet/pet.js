'use strict'
const utils = require('../../helpers/utils.js')
const petApi = require('../../api/pet.js')

describe("Pet API Tests", () => {

    let petsToDelete = []

    before( async() => {
        await utils.setLogFileName("pet_api")
    })

    after( async() => {
        for(let i = 0; i < petsToDelete.length; i++) {
            await petApi.deletePet(petsToDelete[i])
        }
    })

    beforeEach( function() {
        utils.logMessageToFile(this.currentTest.title)
    })

    //
    // POST /pet/:petId
    //

    it("Test pet create", async() => {
        let petData = await utils.generateRandomPet()
        const addPetResponse = await petApi.addPet(petData.name, petData.category, petData.status)
        petsToDelete.push(addPetResponse.body.id)

        const testResults = await utils.multiPointVerification(addPetResponse,
            201, ['"id":1', `"name":"${petData.name}"`, `"category":"${petData.category}"`,
                `"status":"${petData.status}"`], undefined, ['"x-powered-by":"Express"',
                    '"content-type":"application/json; charset=utf-8"',
                    '"connection":"close"'], undefined, 
                ['"id":1', `"name":"${petData.name}"`, `"category":"${petData.category}"`,
                    `"status":"${petData.status}"`])
        await expect(testResults, "Verify test results").to.equal("No mismatch values")
    })

    it("Test pet create schema", async() => {
        let petData = await utils.generateRandomPet()
        const addPetResponse = await petApi.addPet(petData.name, petData.category, petData.status)
        petsToDelete.push(addPetResponse.body.id)

        const testResults = utils.schemaValidation("pet", "/pet/:pet_id", "POST",
            addPetResponse.body, addPetResponse.header, true, true)
        await expect(testResults, "Verify test results").to.equal("No mismatch values")
    })

    it("Test pet create - missing name", async() => {
        let petData = await utils.generateRandomPet()
        const addPetResponse = await petApi.addPet(undefined, petData.category, petData.status)
    
        const testResults = await utils.multiPointVerification(addPetResponse,
            400, 
            ['"message":"Bad or missing data"'], undefined, 
            ['"x-powered-by":"Express"', '"content-type":"application/json; charset=utf-8"',
                '"content-length":"33"'], undefined, 
            ['"message":"Bad or missing data"'])
    
        await expect(testResults, "Verify test results").to.equal("No mismatch values")
    })

    it("Test pet create - missing category", async() => {
        let petData = await utils.generateRandomPet()
        const addPetResponse = await petApi.addPet(petData.name, undefined, petData.status)
    
        const testResults = await utils.multiPointVerification(addPetResponse,
            400, 
            ['"message":"Bad or missing data"'], undefined, 
            ['"x-powered-by":"Express"', '"content-type":"application/json; charset=utf-8"',
                '"content-length":"33"'], undefined, 
            ['"message":"Bad or missing data"'])
    
        await expect(testResults, "Verify test results").to.equal("No mismatch values")
    })

    it("Test pet create - missing status", async() => {
        let petData = await utils.generateRandomPet()
        petData.name = utils.stringGen(101)
        const addPetResponse = await petApi.addPet(petData.name, petData.category, undefined)
    
        const testResults = await utils.multiPointVerification(addPetResponse,
            400, 
            ['"message":"Bad or missing data"'], undefined, 
            ['"x-powered-by":"Express"', '"content-type":"application/json; charset=utf-8"',
                '"content-length":"33"'], undefined, 
            ['"message":"Bad or missing data"'])
    
        await expect(testResults, "Verify test results").to.equal("No mismatch values")
    })

    it("Test pet create - name too long", async() => {
        let petData = await utils.generateRandomPet()
        petData.name = utils.stringGen(101)
        const addPetResponse = await petApi.addPet(petData.name, petData.category, petData.status)
    
        const testResults = await utils.multiPointVerification(addPetResponse,
            400, 
            ['"message":"Bad or missing data. Name/Category/Status too long"'], undefined, 
            ['"x-powered-by":"Express"', '"content-type":"application/json; charset=utf-8"',
                '"content-length":"64"'], undefined, 
            ['"message":"Bad or missing data. Name/Category/Status too long"'])
    
        await expect(testResults, "Verify test results").to.equal("No mismatch values")
    })

    it("Test pet create - category too long", async() => {
        let petData = await utils.generateRandomPet()
        petData.category = utils.stringGen(101)
        const addPetResponse = await petApi.addPet(petData.name, petData.category, petData.status)
    
        const testResults = await utils.multiPointVerification(addPetResponse,
            400, 
            ['"message":"Bad or missing data. Name/Category/Status too long"'], undefined, 
            ['"x-powered-by":"Express"', '"content-type":"application/json; charset=utf-8"',
                '"content-length":"64"'], undefined, 
            ['"message":"Bad or missing data. Name/Category/Status too long"'])
    
        await expect(testResults, "Verify test results").to.equal("No mismatch values")
    })

    it("Test pet create - status too long", async() => {
        let petData = await utils.generateRandomPet()
        petData.status = utils.stringGen(101)
        const addPetResponse = await petApi.addPet(petData.name, petData.category, petData.status)
    
        const testResults = await utils.multiPointVerification(addPetResponse,
            400, 
            ['"message":"Bad or missing data. Name/Category/Status too long"'], undefined, 
            ['"x-powered-by":"Express"', '"content-type":"application/json; charset=utf-8"',
                '"content-length":"64"'], undefined, 
            ['"message":"Bad or missing data. Name/Category/Status too long"'])
    
        await expect(testResults, "Verify test results").to.equal("No mismatch values")
    })

    it("Test pet create - duplicate pet", async() => {
        let petData = await utils.generateRandomPet()
        const addPetResponse = await petApi.addPet(petData.name, petData.category, petData.status)
        petsToDelete.push(addPetResponse.body.id)
    
        const duplicatePetResponse = await petApi.addPet(petData.name, petData.category, petData.status)
    
        const testResults = await utils.multiPointVerification(duplicatePetResponse,
            400, 
            ['"message":"Pet with the same name and category already exists"'], undefined, 
            ['"x-powered-by":"Express"', '"content-type":"application/json; charset=utf-8"', 
                '"content-length":"64"'], undefined, 
            ['"message":"Pet with the same name and category already exists"'])
    
        await expect(testResults, "Verify test results").to.equal("No mismatch values")
    })

    //
    // GET /pet/:petId
    //

    it("Test get pet by ID", async() => {
        let petData = await utils.generateRandomPet()
        const addPetResponse = await petApi.addPet(petData.name, petData.category, petData.status)
        petsToDelete.push(addPetResponse.body.id)
    
        const getPetResponse = await petApi.getPet(addPetResponse.body.id)
    
        const testResults = await utils.multiPointVerification(getPetResponse,
            200, 
            [`"name":"${petData.name}"`, `"category":"${petData.category}"`, `"status":"${petData.status}"`], 
            undefined, 
            ['"x-powered-by":"Express"', '"content-type":"application/json; charset=utf-8"'], 
            undefined, 
            [`"name":"${petData.name}"`, `"category":"${petData.category}"`, `"status":"${petData.status}"`])
    
        await expect(testResults, "Verify test results").to.equal("No mismatch values")
    })

    it("Test get pet schema", async() => {
        let petData = await utils.generateRandomPet()
        const addPetResponse = await petApi.addPet(petData.name, petData.category, petData.status)
        petsToDelete.push(addPetResponse.body.id)
    
        const getPetResponse = await petApi.getPet(addPetResponse.body.id)
    
        const testResults = utils.schemaValidation("pet", "/pet/:pet_id", "GET",
            getPetResponse.body, getPetResponse.header, true, true)
        await expect(testResults, "Verify test results").to.equal("No mismatch values")
    })
    
    it("Test get non-existent pet by ID (0)", async() => {
        const getPetResponse = await petApi.getPet(0)
    
        const testResults = await utils.multiPointVerification(getPetResponse,
            404, 
            ['"message":"Pet not found"'], undefined, 
            ['"x-powered-by":"Express"', '"content-type":"application/json; charset=utf-8"', 
                '"content-length":"27"'], undefined, 
            ['"message":"Pet not found"'])
    
        await expect(testResults, "Verify test results").to.equal("No mismatch values")
    })

    it("Test get non-existent pet by ID (99999)", async() => {
        const getPetResponse = await petApi.getPet(99999)
    
        const testResults = await utils.multiPointVerification(getPetResponse,
            404, 
            ['"message":"Pet not found"'], undefined, 
            ['"x-powered-by":"Express"', '"content-type":"application/json; charset=utf-8"', 
                '"content-length":"27"'], undefined, 
            ['"message":"Pet not found"'])
    
        await expect(testResults, "Verify test results").to.equal("No mismatch values")
    })

    it("Test get non-existent pet by ID (-1)", async() => {
        const getPetResponse = await petApi.getPet(-1)
    
        const testResults = await utils.multiPointVerification(getPetResponse,
            404, 
            ['"message":"Pet not found"'], undefined, 
            ['"x-powered-by":"Express"', '"content-type":"application/json; charset=utf-8"', 
                '"content-length":"27"'], undefined, 
            ['"message":"Pet not found"'])
    
        await expect(testResults, "Verify test results").to.equal("No mismatch values")
    })

    it("Test get non-existent pet by ID (bad)", async() => {
        const getPetResponse = await petApi.getPet("bad")
    
        const testResults = await utils.multiPointVerification(getPetResponse,
            404, 
            ['"message":"Pet not found"'], undefined, 
            ['"x-powered-by":"Express"', '"content-type":"application/json; charset=utf-8"', 
                '"content-length":"27"'], undefined, 
            ['"message":"Pet not found"'])
    
        await expect(testResults, "Verify test results").to.equal("No mismatch values")
    })

    //
    // PUT /pet/:petId
    //

    it("Test update pet", async() => {
        let petData = await utils.generateRandomPet()
        const addPetResponse = await petApi.addPet(petData.name, petData.category, petData.status)
        petsToDelete.push(addPetResponse.body.id)
    
        let updatedPetData = await utils.generateRandomPet()
        const updatePetResponse = await petApi.updatePet(addPetResponse.body.id, updatedPetData.name, updatedPetData.category, updatedPetData.status)
        
        const testResults = await utils.multiPointVerification(updatePetResponse,
            200, 
            [`"name":"${updatedPetData.name}"`, `"category":"${updatedPetData.category}"`, `"status":"${updatedPetData.status}"`], 
            undefined, 
            ['"x-powered-by":"Express"', '"content-type":"application/json; charset=utf-8"'], 
            undefined, 
            [`"name":"${updatedPetData.name}"`, `"category":"${updatedPetData.category}"`, `"status":"${updatedPetData.status}"`])
    
        await expect(testResults, "Verify test results").to.equal("No mismatch values")
    })

    it("Test update pet schema", async() => {
        let petData = await utils.generateRandomPet()
        const addPetResponse = await petApi.addPet(petData.name, petData.category, petData.status)
        petsToDelete.push(addPetResponse.body.id)
    
        let updatedPetData = await utils.generateRandomPet()
        const updatePetResponse = await petApi.updatePet(addPetResponse.body.id, updatedPetData.name, updatedPetData.category, updatedPetData.status)
        
        const testResults = utils.schemaValidation("pet", "/pet/:pet_id", "PUT",
            updatePetResponse.body, updatePetResponse.header, true, true)
        await expect(testResults, "Verify test results").to.equal("No mismatch values")
    })

    it("Test update non-existent pet (0)", async() => {
        let updatedPetData = await utils.generateRandomPet()
        const updatePetResponse = await petApi.updatePet(0, updatedPetData.name, updatedPetData.category, updatedPetData.status)
    
        const testResults = await utils.multiPointVerification(updatePetResponse,
            404, 
            ['"message":"Pet not found"'], undefined, 
            ['"x-powered-by":"Express"', '"content-type":"application/json; charset=utf-8"', 
                '"content-length":"27"'], undefined, 
            ['"message":"Pet not found"'])
    
        await expect(testResults, "Verify test results").to.equal("No mismatch values")
    })
    
    it("Test update non-existent pet (99999)", async() => {
        let updatedPetData = await utils.generateRandomPet()
        const updatePetResponse = await petApi.updatePet(99999, updatedPetData.name, updatedPetData.category, updatedPetData.status)
    
        const testResults = await utils.multiPointVerification(updatePetResponse,
            404, 
            ['"message":"Pet not found"'], undefined, 
            ['"x-powered-by":"Express"', '"content-type":"application/json; charset=utf-8"', 
                '"content-length":"27"'], undefined, 
            ['"message":"Pet not found"'])
    
        await expect(testResults, "Verify test results").to.equal("No mismatch values")
    })

    it("Test update non-existent pet (-1)", async() => {
        let updatedPetData = await utils.generateRandomPet()
        const updatePetResponse = await petApi.updatePet(-1, updatedPetData.name, updatedPetData.category, updatedPetData.status)
    
        const testResults = await utils.multiPointVerification(updatePetResponse,
            404, 
            ['"message":"Pet not found"'], undefined, 
            ['"x-powered-by":"Express"', '"content-type":"application/json; charset=utf-8"', 
                '"content-length":"27"'], undefined, 
            ['"message":"Pet not found"'])
    
        await expect(testResults, "Verify test results").to.equal("No mismatch values")
    })

    it("Test update non-existent pet (bad)", async() => {
        let updatedPetData = await utils.generateRandomPet()
        const updatePetResponse = await petApi.updatePet("bad", updatedPetData.name, updatedPetData.category, updatedPetData.status)
    
        const testResults = await utils.multiPointVerification(updatePetResponse,
            404, 
            ['"message":"Pet not found"'], undefined, 
            ['"x-powered-by":"Express"', '"content-type":"application/json; charset=utf-8"', 
                '"content-length":"27"'], undefined, 
            ['"message":"Pet not found"'])
    
        await expect(testResults, "Verify test results").to.equal("No mismatch values")
    })

    it("Test update pet - name too long", async() => {
        let petData = await utils.generateRandomPet()
        const addPetResponse = await petApi.addPet(petData.name, petData.category, petData.status)
        petsToDelete.push(addPetResponse.body.id)
    
        let updatedPetData = await utils.generateRandomPet(utils.stringGen(101))
        const updatePetResponse = await petApi.updatePet(addPetResponse.body.id, updatedPetData.name, updatedPetData.category, updatedPetData.status)
    
        const testResults = await utils.multiPointVerification(updatePetResponse,
            400, 
            ['"message":"Bad or missing data. Name too long"'], undefined, 
            ['"x-powered-by":"Express"', '"content-type":"application/json; charset=utf-8"', 
                '"content-length":"48"'],  undefined, 
            ['"message":"Bad or missing data. Name too long"'])
    
        await expect(testResults, "Verify test results").to.equal("No mismatch values")
    })

    it("Test update pet - category too long", async() => {
        let petData = await utils.generateRandomPet()
        const addPetResponse = await petApi.addPet(petData.name, petData.category, petData.status)
        petsToDelete.push(addPetResponse.body.id)
    
        let updatedPetData = await utils.generateRandomPet(undefined, utils.stringGen(101))
        const updatePetResponse = await petApi.updatePet(addPetResponse.body.id, updatedPetData.name, updatedPetData.category, updatedPetData.status)
    
        const testResults = await utils.multiPointVerification(updatePetResponse,
            400, 
            ['"message":"Bad or missing data. Category too long"'], undefined, 
            ['"x-powered-by":"Express"', '"content-type":"application/json; charset=utf-8"', 
                '"content-length":"52"'],  undefined, 
            ['"message":"Bad or missing data. Category too long"'])
    
        await expect(testResults, "Verify test results").to.equal("No mismatch values")
    })

    it("Test update pet - status too long", async() => {
        let petData = await utils.generateRandomPet()
        const addPetResponse = await petApi.addPet(petData.name, petData.category, petData.status)
        petsToDelete.push(addPetResponse.body.id)
    
        let updatedPetData = await utils.generateRandomPet(undefined, undefined, utils.stringGen(101))
        const updatePetResponse = await petApi.updatePet(addPetResponse.body.id, updatedPetData.name, updatedPetData.category, updatedPetData.status)
    
        const testResults = await utils.multiPointVerification(updatePetResponse,
            400, 
            ['"message":"Bad or missing data. Status too long"'], undefined, 
            ['"x-powered-by":"Express"', '"content-type":"application/json; charset=utf-8"', 
                '"content-length":"50"'],  undefined, 
            ['"message":"Bad or missing data. Status too long"'])
    
        await expect(testResults, "Verify test results").to.equal("No mismatch values")
    })

    //
    // DELETE /pet/:petId
    //

    it("Test delete pet", async() => {
        let petData = await utils.generateRandomPet()
        const addPetResponse = await petApi.addPet(petData.name, petData.category, petData.status)
        petsToDelete.push(addPetResponse.body.id)
    
        const deletePetResponse = await petApi.deletePet(addPetResponse.body.id)
    
        const testResults = await utils.multiPointVerification(deletePetResponse,
            204, undefined, undefined, ['"x-powered-by":"Express"'], 
            undefined, undefined)
    
        await expect(testResults, "Verify test results").to.equal("No mismatch values")
    })

    it("Test delete pet schema", async() => {
        let petData = await utils.generateRandomPet()
        const addPetResponse = await petApi.addPet(petData.name, petData.category, petData.status)
        petsToDelete.push(addPetResponse.body.id)
    
        const deletePetResponse = await petApi.deletePet(addPetResponse.body.id)
    
        const testResults = utils.schemaValidation("pet", "/pet/:pet_id", "DELETE",
            undefined, deletePetResponse.header, false, true)
        await expect(testResults, "Verify test results").to.equal("No mismatch values")
    })

    it("Test delete non-existent pet (0)", async() => {
        const deletePetResponse = await petApi.deletePet(0)
    
        const testResults = await utils.multiPointVerification(deletePetResponse,
            404, 
            ['"message":"Pet not found"'], undefined, 
            ['"x-powered-by":"Express"', '"content-type":"application/json; charset=utf-8"', 
                '"content-length":"27"'], undefined, 
            ['"message":"Pet not found"'])
    
        await expect(testResults, "Verify test results").to.equal("No mismatch values")
    }) 

    it("Test delete non-existent pet (99999)", async() => {
        const deletePetResponse = await petApi.deletePet(99999)
    
        const testResults = await utils.multiPointVerification(deletePetResponse,
            404, 
            ['"message":"Pet not found"'], undefined, 
            ['"x-powered-by":"Express"', '"content-type":"application/json; charset=utf-8"', 
                '"content-length":"27"'], undefined, 
            ['"message":"Pet not found"'])
    
        await expect(testResults, "Verify test results").to.equal("No mismatch values")
    })

    it("Test delete non-existent pet (-1)", async() => {
        const deletePetResponse = await petApi.deletePet(-1)
    
        const testResults = await utils.multiPointVerification(deletePetResponse,
            404, 
            ['"message":"Pet not found"'], undefined, 
            ['"x-powered-by":"Express"', '"content-type":"application/json; charset=utf-8"', 
                '"content-length":"27"'], undefined, 
            ['"message":"Pet not found"'])
    
        await expect(testResults, "Verify test results").to.equal("No mismatch values")
    })

    it("Test delete non-existent pet (bad)", async() => {
        const deletePetResponse = await petApi.deletePet("bad")
    
        const testResults = await utils.multiPointVerification(deletePetResponse,
            404, 
            ['"message":"Pet not found"'], undefined, 
            ['"x-powered-by":"Express"', '"content-type":"application/json; charset=utf-8"', 
                '"content-length":"27"'], undefined, 
            ['"message":"Pet not found"'])
    
        await expect(testResults, "Verify test results").to.equal("No mismatch values")
    })

})
