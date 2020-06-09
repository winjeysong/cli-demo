#!/usr/bin/env node

const program = require('commander');
const fetch = require('node-fetch');
const fs = require('fs');
const util = require('util');
const exec = require('child_process').exec;
const chalk = require('chalk');

const pl = util.promisify(require('stream').pipeline);

let projName;
const tplZipUrl = 'http://172.18.110.129:7777/songwj/cockpit-pc-cli/-/archive/master/cockpit-pc-tpl-master.zip';
const tplZipName = 'tpl.zip';

program
  .name('cockpit-pc-cli')
  .version('0.1.0');

program
  .description('初始化驾驶舱pc端')
  .command('init [projectName]')
  .action(name => {
    projName = name;
  });

program.parse(process.argv);

if (!projName) {
  console.log(chalk.red('[Error]: Project name is required.'));
  process.exit();
}

const clStr = [`unzip -o ${tplZipName}`, `rm ${tplZipName}`, `mv cockpit-pc-tpl-master ${projName}`].join(' && ');

fetch(tplZipUrl).then(res => {
  if (res.ok) {
    return pl(res.body, fs.createWriteStream(tplZipName));
  }
  throw new Error(`[Error] Request error - ${res.statusText}`);
})
  .then(() => {
    exec(clStr, (err, stdout, stderr) => {
      if (err) {
        console.log(chalk.red(`[Error]: ${err}`));
        process.exit();
      }

      console.log(chalk.green(`[Success] Init Finished.`));
    });
  })
  .catch(err => console.log(chalk.red(err)));

