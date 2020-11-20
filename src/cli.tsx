import yargs from 'yargs';
import { publish } from './index';

// eslint-disable-next-line babel/no-unused-expressions
yargs
  .command('publish', 'Publish packages to the registry', {}, publish)
  .demandCommand()
  .recommendCommands()
  .strict().argv;
