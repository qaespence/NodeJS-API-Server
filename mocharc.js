global.apiServer = 'http://localhost:3000'

module.exports = {
    require: [
        './test/setup.js',
        'chai/register-assert',  
        'chai/register-expect',  
        'chai/register-should'   
    ],
    spec: "test/specs/**/*.js",   
    timeout: 5000,                
    recursive: true
}