'use strict'

import { DefaultContext, DefaultMessage, DefaultState } from '@lucets/luce'
import MessageHooks, { MessageHook } from '@lucets/luce/dist/lib/MessageHooks'

export default class Commands<
  TMessage extends DefaultMessage = DefaultMessage,
  TState extends DefaultState = DefaultState
> {
  #messageHooks: Map<string, MessageHook<TMessage, DefaultContext<TMessage, TState>>[]> = new Map()

  /**
   * Use one or more message hooks for the given command.
   * @param cmd The command name
   * @param hooks One or more message hooks
   */
  public use (cmd: string, ...hooks: MessageHook<TMessage, DefaultContext<TMessage, TState>>[]): this {
    const arr = this.#messageHooks.get(cmd) ?? []

    if (!arr.length) {
      this.#messageHooks.set(cmd, arr)
    }

    for (const hook of hooks) {
      arr.push(hook)
    }

    return this
  }

  /**
   * Compose the combined message hook.
   */
  public compose (): MessageHook<TMessage, DefaultContext<TMessage, TState>> {
    return async (message, ctx, next) => {
      if (!message.cmd) {
        // Hand off to the next hook
        return next()
      }

      const hooks = this.#messageHooks.get(message.cmd)

      if (!hooks) {
        // Hand off to the next hook
        return next()
      }

      // Comppse and execute the hooks
      const composed = MessageHooks.compose(...hooks)
      return composed(message, ctx, async () => {})
    }
  }
}
