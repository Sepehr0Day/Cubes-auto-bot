const { execSync } = require('child_process');

try {
    console.log('Installing g++ and clang...');
    execSync('clear')
    execSync('sudo apt-get update');
    execSync('sudo apt-get install g++ clang gdb -y');
    execSync('clear')
    console.log('g++ and clang installed successfully.');
} catch (error) {
    console.error('Error occurred while installing dependencies:', error);
    process.exit(1);
}
