# NodeJS API Testing Framework

This is an API testing framework built using Node.js, Mocha, and Chai. The framework supports automated testing for API endpoints using utility functions for generating random data, logging API requests, and verifying responses.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (version 14.x or higher)
- [npm](https://www.npmjs.com/)

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/qaespence/NodeJS-API-Server.git
cd NodeJS-API-Server
```

### 2. Install dependencies

After cloning the repository, install the required dependencies using npm:
```bash
npm install
```

### 3. Run the API Server

To start the API server for testing, follow these steps:

1. Ensure that you have all the necessary dependencies installed (as described in step 2).
2. Run the API server using the following command:
```bash
cd src
node app.js
```
3. The server will start on the default port (e.g., http://localhost:3000), or you can specify a port using an environment variable (e.g., PORT=4000 node app.js).

### 4. Logs Directory Setup

Make sure the test/logs directory exists for storing log files. If it does not exist, create it:
```bash
mkdir -p test/logs
```

## Running the Tests

### 1. Run all tests

To run the entire test suite, execute the following command:
```bash
npm test
```
This will run all the test files recursively from the test/specs folder.

### 2. Run specific test files

To run a specific test file, for example, the pet.js test file:
```bash
npx mocha test/specs/pet.js
```

### 3. Run specific tests

To run a specific tests, for example, the Pet Create tests:
```bash
npm test -- -g "Test pet create"
```

## Folder Structure

Here’s a description of the project’s folder and file structure:
```
.
├── src/                        # Contains the test PetStore API server
├── test/                       # Main test folder containing all test-related files
│   ├── api/                    # Contains API request functions (e.g., addPet, getPet, updatePet, deletePet)
│   │   └── basicRequests.js    # Contains core request methods (POST, GET, PUT, DELETE)
│   ├── helpers/                # Contains utility functions for logging, random data generation, etc.
│   │   └── utils.js            # Utility functions (e.g., logging, clearing logs, etc.)
│   ├── logs/                   # Stores log files for each test suite
│   ├── specs/                  # Contains all the test cases for different API endpoints
│   │   └── pet.js              # Test cases for the Pet API (POST, GET, PUT, DELETE /pet)
│   └── setup.js                # Global setup file that runs before the tests
├── .gitignore                  # Files and folders to ignore in Git
├── .mocharc.js                 # Mocha configuration file
├── package.json                # Project dependencies and scripts
└── README.md                   # Project instructions and documentation
```
