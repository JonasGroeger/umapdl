oclif-hello-world
=================

oclif example Hello World CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/oclif-hello-world.svg)](https://npmjs.org/package/oclif-hello-world)
[![CircleCI](https://circleci.com/gh/oclif/hello-world/tree/main.svg?style=shield)](https://circleci.com/gh/oclif/hello-world/tree/main)
[![Downloads/week](https://img.shields.io/npm/dw/oclif-hello-world.svg)](https://npmjs.org/package/oclif-hello-world)
[![License](https://img.shields.io/npm/l/oclif-hello-world.svg)](https://github.com/oclif/hello-world/blob/main/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g umapdl
$ umapdl COMMAND
running command...
$ umapdl (--version)
umapdl/1.1.0 linux-x64 node-v16.14.0
$ umapdl --help [COMMAND]
USAGE
  $ umapdl COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`umapdl download [DOMAIN] [MAPID]`](#umapdl-download-domain-mapid)
* [`umapdl help [COMMAND]`](#umapdl-help-command)

## `umapdl download [DOMAIN] [MAPID]`

Downloads a map from uMap using the id of the map. Example: download fr 726257

```
USAGE
  $ umapdl download [DOMAIN] [MAPID] [-r]

FLAGS
  -r, --resolveRemoteLayers

DESCRIPTION
  Downloads a map from uMap using the id of the map. Example: download fr 726257

EXAMPLES
  $ umapdl download fr 726257
```

_See code: [dist/commands/download.ts](https://github.com/JonasGroeger/umapdl/blob/v1.1.0/dist/commands/download.ts)_

## `umapdl help [COMMAND]`

Display help for umapdl.

```
USAGE
  $ umapdl help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for umapdl.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.11/src/commands/help.ts)_
<!-- commandsstop -->
