# @lucets/commands

Message hook which allows setting hooks for individual commands.

Designed to be used with [Luce](https://github.com/lucets/luce),
but can be used stand-alone as well.

See [@lucets/message-hooks](https://github.com/lucets/message-hooks)
for more information about how message hooks work.

## Install

```
npm i @lucets/commands
```

## Example

```ts
'use strict'

import { Server } from 'http'

import Application, { WebSocketError } from '@lucets/luce'
import Commands from './index'

const { name, version } = require('../package')

const app = new Application()
const commands = new Commands({ key: 'cmd' }) // message key, default 'cmd'
const server = new Server()

// Implement a catch-all hook
commands.use('*', async (message, ctx) => {
  return ctx.send({
    cmd: 'error',
    message: `Unknown command: ${message[commands.key]}`
  })
})

// Implement a ping command
commands.use('ping', async (message, ctx, next) => {
  await ctx.send({ cmd: 'pong' })
})

// Implement a version info command
commands.use('version-info', async (message, ctx, next) => {
  await ctx.send({
    cmd: 'version-info',
    name,
    version
  })
})

// Implement a publish command
commands.use('publish', async (message, ctx, next) => {
  if (!ctx.state.authorized) {
    // 4401 - Unauthorized
    throw new WebSocketError(4401)
  }
  return next()
}, async (message, ctx, next) => {
  if (!message.package) {
    // 4400 - Bad Request
    throw new WebSocketError(4400)
  }
  return next()
}, async (message, _ctx, next) => {
  console.log(`[publish]: now publishing ${message.package}`)
  return next()
})

// Compose the commands hook
// If the commands hook does not handle the message,
// send an error to the client
app.useMessage(commands.compose(), async (message, ctx, next) => {
  await ctx.send({
    cmd: 'error',
    message: `unknown command: ${message[commands.key] ?? 'none'}`
  })
})

// Add the upgrade method to the server
server.on('upgrade', app.onUpgrade())
server.listen(3004, () => {
  console.log('Server listening on port 3004')
})
```

## License

Copyright 2021 [Michiel van der Velde](https://michielvdvelde.nl).

This software is licensed under [the MIT License](LICENSE).
