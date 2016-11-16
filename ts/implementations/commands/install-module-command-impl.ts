import {injectable, inject} from "inversify";
import {Command, CommandUtil, kernel, Spawn} from 'firmament-yargs';
import path = require('path');
import * as _ from 'lodash';

@injectable()
export class InstallModuleCommandImpl implements Command {
  aliases: string[] = [];
  command: string = '';
  commandDesc: string = '';
  //noinspection JSUnusedGlobalSymbols
  //noinspection JSUnusedLocalSymbols
  handler: (argv: any)=>void = (argv: any) => {
  };
  options: any = {};
  subCommands: Command[] = [];
  private commandUtil: CommandUtil;
  private spawn: Spawn;

  constructor(@inject('CommandUtil') _commandUtil: CommandUtil,
              @inject('Spawn') _spawn: Spawn) {
    this.buildCommandTree();
    this.commandUtil = _commandUtil;
    this.spawn = _spawn;
  }

  private buildCommandTree() {
    this.aliases = ['module'];
    this.command = '<subCommand>';
    this.commandDesc = 'Manage firmament modules';
    this.pushInstallModuleCommand();
  }

  private pushInstallModuleCommand() {
    let me = this;
    let installModuleCommand = kernel.get<Command>('CommandImpl');
    installModuleCommand.aliases = ['install', 'i'];
    installModuleCommand.commandDesc = 'Install firmament module from NPM repository';
    //noinspection ReservedWordAsName
    installModuleCommand.options = {
      name: {
        alias: 'n',
        default: '',
        type: 'string',
        desc: 'Name the firmament module'
      }
    };
    installModuleCommand.handler = (argv) => {
      const modulePrefix = 'firmament-';
      if (!argv.name) {
        me.commandUtil.processExit(1, `\nPlease provide a module name using the '--name <module_name>' switch\n`);
      }
      if (!_.startsWith(argv.name, modulePrefix)) {
        me.commandUtil.processExit(1, `\nModule names must start with '${modulePrefix}'\n`);
      }
      let prefix = path.resolve(__dirname, '../../..');
      let cmd = ['npm', 'install', '--save', '--prefix', `${prefix}`, argv.name];
      me.spawn.sudoSpawn(cmd, (err: Error) => {
        me.commandUtil.processExitWithError(err, `Looks like module '${argv.name}' installed successfully!`);
      });
    };
    me.subCommands.push(installModuleCommand);
  }
}

