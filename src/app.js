const express = require('express')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.json())

// Dummy data to simulate a database
let pets = []
let inventory = {}
let orders = []
let users = []

// Add a new pet to the Pet Store
app.post('/pet', (req, res) => {
    const data = req.body

    if (!data.name || !data.category || !data.status) {
        console.log("POST: 400 - Bad or missing data")
        return res.status(400).json({ message: 'Bad or missing data' })
    }

    if (data.name.length > 100 || data.category.length > 100 || data.status.length > 100) {
        console.log("POST: 400 - Bad or missing data. Name/Category/Status too long")
        return res.status(400).json({ message: 'Bad or missing data. Name/Category/Status too long' })
    }

    if (pets.some(pet => pet.name === data.name && pet.category === data.category)) {
        console.log("POST: 400 - Pet with the same name and category already exists")
        return res.status(400).json({ message: 'Pet with the same name and category already exists' })
    }

    const newPet = {
        id: pets.length + 1,
        name: data.name,
        category: data.category,
        status: data.status,
    }

    pets.push(newPet)

    // Update inventory
    if (!inventory[data.category]) {
        inventory[data.category] = 1  // Add new category with default quantity of 1
    } else {
        inventory[data.category]++  // Increment category quantity
    }
    console.log("POST: 201 - Pet created: " + JSON.stringify(newPet))
    res.status(201).json(newPet)
})

// Retrieve a pet by ID
app.get('/pet/:petId', (req, res) => {
    const pet = pets.find(p => p.id === parseInt(req.params.petId))

    if (!pet) {
        console.log("GET: 404 - Pet not found")
        return res.status(404).json({ message: 'Pet not found' })
    }

    console.log("GET 201: Pet fetched: " + JSON.stringify(pet))
    res.status(200).json(pet)
})

// Update a pet by ID
app.put('/pet/:petId', (req, res) => {
    const petId = parseInt(req.params.petId)
    const data = req.body

    const pet = pets.find(p => p.id === petId)

    if (!pet) {
        console.log("PUT: 404 - Pet not found")
        return res.status(404).json({ message: 'Pet not found' })
    }

    if (pets.some(p => p.name === data.name && p.category === data.category && p.id !== petId)) {
        console.log("PUT: 400 - Pet with the same name and category already exists")
        return res.status(400).json({ message: 'Pet with the same name and category already exists' })
    }

    // Capture the original category
    const originalCategory = pet.category

    if (data.name && data.name.length > 100) {
        console.log("PUT: 400 - Bad or missing data. Name too long")
        return res.status(400).json({ message: 'Bad or missing data. Name too long' })
    }
    if (data.category && data.category.length > 100) {
        console.log("PUT: 400 - Bad or missing data. Category too long")
        return res.status(400).json({ message: 'Bad or missing data. Category too long' })
    }
    if (data.status && data.status.length > 100) {
        console.log("PUT: 400 - Bad or missing data. Status too long")
        return res.status(400).json({ message: 'Bad or missing data. Status too long' })
    }

    pet.name = data.name || pet.name
    pet.category = data.category || pet.category
    pet.status = data.status || pet.status

    // Update inventory if category has changed
    if (originalCategory !== pet.category) {
        // Reduce inventory for the original category
        if (inventory[originalCategory]) {
            inventory[originalCategory]--
            if (inventory[originalCategory] <= 0) {
                delete inventory[originalCategory]  // Remove category if quantity is 0
            }
        }

        // Add to the new category
        if (!inventory[pet.category]) {
            inventory[pet.category] = 1  // Add new category with quantity of 1
        } else {
            inventory[pet.category]++  // Increment the new category's quantity
        }
    }
    
    console.log("PUT: 200 - Pet updated: " + JSON.stringify(pet))
    res.status(200).json(pet)
})

// Delete a pet by ID
app.delete('/pet/:petId', (req, res) => {
    const petId = parseInt(req.params.petId)
    const petIndex = pets.findIndex(p => p.id === petId)

    if (petIndex === -1) {
        console.log("DELETE: 404 - Pet not found")
        return res.status(404).json({ message: 'Pet not found' })
    }

    // Update inventory
    if (inventory[pets[petIndex].category]) {
        inventory[pets[petIndex].category]--
        if (inventory[pets[petIndex].category] <= 0) {
            delete inventory[pets[petIndex].category]  // Remove category if quantity is 0
        }
    }

    pets.splice(petIndex, 1)

    console.log("DELETE: 404 - Pet deleted")
    res.status(204).json({ message: 'Pet deleted' })
})

// Find pets by status
app.get('/pet/findByStatus', (req, res) => {
    const status = req.query.status

    if (!status || !['available', 'pending', 'sold'].includes(status)) {
        return res.status(400).json({ message: 'Status parameter is missing or invalid' })
    }

    const foundPets = pets.filter(pet => pet.status === status)
    res.status(200).json(foundPets)
})

// Upload an image for a pet (dummy implementation)
app.post('/pet/:petId/uploadImage', (req, res) => {
    const petId = parseInt(req.params.petId)
    const pet = pets.find(p => p.id === petId)

    if (!pet) {
        return res.status(404).json({ message: 'Pet not found' })
    }

    if (!req.files || !req.files.file) {
        return res.status(400).json({ message: 'No file part or no selected file' })
    }

    // Handle the file upload here (implementation needed)
    res.status(201).json({ message: 'File uploaded successfully' })
})

// Inventory routes
app.get('/store/inventory', (req, res) => {
    res.status(200).json(inventory)
})

app.post('/store/inventory/add', (req, res) => {
    const { category, quantity } = req.body

    if (!category || !quantity) {
        return res.status(400).json({ message: 'Bad or missing data. Missing category or quantity field' })
    }

    if (!inventory[category]) {
        inventory[category] = quantity  // Add new category with the specified quantity
    } else {
        inventory[category] += quantity  // Increment category quantity
    }

    res.status(200).json({ message: `Added ${quantity} to inventory for category ${category}` })
})

app.post('/store/inventory/remove', (req, res) => {
    const { category, quantity } = req.body

    if (!category || !quantity) {
        return res.status(400).json({ message: 'Bad or missing data. Missing category or quantity field' })
    }

    if (!inventory[category]) {
        return res.status(404).json({ message: 'Category not found in inventory' })
    }

    if (inventory[category] < quantity) {
        return res.status(400).json({ message: 'Not enough quantity in inventory' })
    }

    inventory[category] -= quantity

    if (inventory[category] <= 0) {
        delete inventory[category]  // Remove category if quantity is 0
    }

    res.status(200).json({ message: `Removed ${quantity} from inventory for category ${category}` })
})

// Order routes
app.post('/store/order', (req, res) => {
    const { petId, quantity } = req.body

    if (!petId || !quantity) {
        return res.status(400).json({ message: 'Bad or missing data. Missing petId or quantity field' })
    }

    if (!inventory[petId] || inventory[petId] < quantity) {
        return res.status(400).json({ message: 'Not enough inventory for the specified pet' })
    }

    inventory[petId] -= quantity

    const newOrder = {
        orderId: orders.length + 1,
        petId: petId,
        quantity: quantity,
        status: 'placed',
    }

    orders.push(newOrder)
    res.status(201).json(newOrder)
})

app.get('/store/order/:orderId', (req, res) => {
    const orderId = parseInt(req.params.orderId)
    const order = orders.find(o => o.orderId === orderId)

    if (!order) {
        return res.status(404).json({ message: 'Order not found' })
    }

    res.status(200).json(order)
})

app.delete('/store/order/:orderId', (req, res) => {
    const orderId = parseInt(req.params.orderId)
    const orderIndex = orders.findIndex(o => o.orderId === orderId)

    if (orderIndex === -1) {
        return res.status(404).json({ message: 'Order not found' })
    }

    orders.splice(orderIndex, 1)
    res.status(204).json({ message: `Order ${orderId} deleted` })
})

// User routes
app.post('/user', (req, res) => {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Bad or missing data' })
    }

    if (users.find(user => user.username === username)) {
        return res.status(400).json({ message: 'Username already exists' })
    }

    const newUser = {
        id: users.length + 1,
        username,
        email,
        password,
    }

    users.push(newUser)
    res.status(201).json(newUser)
})

app.get('/user/login', (req, res) => {
    const { username, password } = req.query

    if (!username || !password) {
        return res.status(400).json({ message: 'Bad or missing data' })
    }

    const user = users.find(user => user.username === username && user.password === password)

    if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' })
    }

    res.status(200).json({ message: 'Login successful' })
})

app.get('/user/:username', (req, res) => {
    const user = users.find(user => user.username === req.params.username)

    if (!user) {
        return res.status(404).json({ message: 'User not found' })
    }

    res.status(200).json(user)
})

app.put('/user/:username', (req, res) => {
    const user = users.find(user => user.username === req.params.username)

    if (!user) {
        return res.status(404).json({ message: 'User not found' })
    }

    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ message: 'Bad or missing data' })
    }

    user.email = email
    user.password = password

    res.status(200).json(user)
})

app.delete('/user/:username', (req, res) => {
    users = users.filter(user => user.username !== req.params.username)

    res.status(204).json({ message: `User ${req.params.username} deleted` })
})

// Start the server
const port = 3000
app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
