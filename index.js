#!/usr/bin/env node

const program = require('commander');
const fetch = require('node-fetch');
const fs = require('fs');
const util = require('util');
const exec = require('child_process').exec;
const chalk = require('chalk');
const log = require('single-line-log').stdout;

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
    let p = 0;
    const total = parseInt(res.headers.get('content-length'));
    res.body.on('data', chunk => {
      p += chunk.length;
      const pStr = (p / total * 100).toFixed(2).replace(/.00$/, '') + '%';
      log(makeProgress(p, total) + ' ' + chalk.white(pStr) + '\n'); // 生成进度条和进度
    });

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

      log.clear();
      log('');
      console.log(chalk.green(`[Success] Init Finished.`));
    });
  })
  .catch(err => console.log(chalk.red(err)));

function makeProgress(p, t) {
  const len = 50;
  const solidLen = Math.floor(len * p / t);
  let solidStr = '', blankStr = '';

  for (let i = 0; i < solidLen; i += 1) {
    solidStr += ' ';
  }
  for (let i = 0; i < len - solidLen; i += 1) {
    blankStr += ' ';
  }

  return chalk.bgGreen(solidStr) + chalk.bgRgb(200, 200, 200)(blankStr);
}