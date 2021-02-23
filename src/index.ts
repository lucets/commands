'use strict'

import { DefaultContext, DefaultMessage, DefaultState } from '@lucets/luce'
import MessageHooks, { MessageHook } from '@lucets/message-hooks'

/** Commands options */
export interface CommandsOptions {
  /** The message key to use as the command key */
  key?: string
}

export default class Commands<
  TMessage extends DefaultMessage = DefaultMessage,
  TState extends DefaultState = DefaultState
> {
  #key: string
  #messageHooks: Map<string, MessageHook<TMessage, DefaultContext<TMessage, TState>>[]> = new Map()

  public constructor ({ key }: CommandsOptions = {}) {
    this.#key = key ?? 'cmd'
  }

  /**
   * Use one or more message hooks for the given command.
   * @param cmd The command name
   * @param hooks One or more message hooks
   */
  public use (cmd: string, ...hooks: MessageHook<TMessage, DefaultContext<TMessage, TState>>[]): this {
    if (!hooks.length) {
      throw new TypeError('use() expects at least one hook')
    }

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
      if (!message[this.#key]) {
        // Hand off to the next hook
        return next()
      }

      const hooks = this.#messageHooks.get(message[this.#key])

      if (!hooks) {
        // Hand off to the next hook
        return next()
      }

      // Compose and execute the hooks
      const composed = MessageHooks.compose(...hooks)
      return composed(message, ctx, async () => {})
    }
  }
}
