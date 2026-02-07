const fs = require('fs');
const path = require('path');

try {
    console.log('Attempting to require ./src/index.js');
    require('./src/index.js');
    console.log('Success!');
} catch (error) {
    console.error('Error caught:');
    console.error(error);
    fs.writeFileSync('debug-error.txt', error.stack || error.toString());
}
