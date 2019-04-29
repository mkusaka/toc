#!/usr/bin/env node

var program = require('commander');

program
  .version('0.1.0')
  .option('-p, --pattern <add pattern>', 'Add pattern')
  .option('-c, --cheese [type]', 'Add the specified type of cheese [marble]', 'marble')
  .option('-m --myarg [myVar]', 'my super cool description')
  .option('-n --nyarg <nyVar>', 'ny super cool description')
  .parse(process.argv);

console.log('you ordered a pizza with:');
if (program.pattern) console.log('  - pattern %s', program.pattern);
if (program.pineapple) console.log('  - pineapple');
if (program.bbqSauce) console.log('  - bbq');
console.log('  - %s cheese', program.cheese);
