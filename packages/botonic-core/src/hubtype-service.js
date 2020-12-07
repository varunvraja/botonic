import axios from 'axios'
import Pusher from 'pusher-js'

const PUSHER_KEY = process.env.WEBCHAT_PUSHER_KEY || '434ca667c8e6cb3f641c'
const HUBTYPE_API_URL = process.env.HUBTYPE_API_URL || 'https://api.hubtype.com'

export class HubtypeService {
  constructor({
    appId,
    user,
    lastMessageId,
    lastMessageUpdateDate,
    onEvent,
    unsentInputs,
  }) {
    this.appId = appId
    this.user = user || {}
    this.lastMessageId = lastMessageId
    this.lastMessageUpdateDate = lastMessageUpdateDate
    this.onEvent = onEvent
    this.unsentInputs = unsentInputs
    if (user.id && (lastMessageId || lastMessageUpdateDate)) {
      this.init()
      this.resendUnsentInputs()
    }
  }

  /**
   * @returns {Promise<void>}
   */
  init(user, lastMessageId, lastMessageUpdateDate) {
    if (user) this.user = user
    if (lastMessageId) this.lastMessageId = lastMessageId
    if (lastMessageUpdateDate)
      this.lastMessageUpdateDate = lastMessageUpdateDate
    if (this.pusher) return Promise.resolve()
    if (!this.user.id || !this.appId) {
      // TODO recover user & appId somehow
      return Promise.reject('No User or appId. Clear cache and reload')
    }
    this.pusher = new Pusher(PUSHER_KEY, {
      cluster: 'eu',
      authEndpoint: `${HUBTYPE_API_URL}/v1/provider_accounts/webhooks/webchat/${this.appId}/auth/`,
      forceTLS: true,
      auth: {
        headers: this.constructHeaders(),
        params: null,
      },
    })
    this.channel = this.pusher.subscribe(this.pusherChannel)
    const connectionPromise = new Promise((resolve, reject) => {
      const cleanAndReject = msg => {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        clearTimeout(connectTimeout)
        if (this.pusher) this.pusher.connection.unbind()
        if (this.channel) this.channel.unbind()
        this.pusher = null
        reject(msg)
      }
      const connectTimeout = setTimeout(
        () => cleanAndReject('Connection Timeout'),
        10000
      )
      if (!this.pusher || !this.channel) {
        reject('Cannot bind pusher because connection was reset')
        return
      }
      this.channel.bind('pusher:subscription_succeeded', () => {
        clearTimeout(connectTimeout)
        resolve()
      })
      this.pusher.connection.bind('error', error => {
        const errorMsg =
          error.error && error.error.data
            ? error.error.data.code || error.data.message
            : 'Connection error'
        cleanAndReject(`Pusher error (${errorMsg})`)
      })
    })
    this.channel.bind('botonic_response', data => this.onPusherEvent(data))
    this.channel.bind('update_message_info', data => this.onPusherEvent(data))
    return connectionPromise
  }

  constructHeaders() {
    const headers = {}
    if (this.user && this.user.id) headers['X-BOTONIC-USER-ID'] = this.user.id
    if (this.lastMessageId)
      headers['X-BOTONIC-LAST-MESSAGE-ID'] = this.lastMessageId
    if (this.lastMessageUpdateDate)
      headers['X-BOTONIC-LAST-MESSAGE-UPDATE-DATE'] = this.lastMessageUpdateDate
    return headers
  }

  onPusherEvent(event) {
    if (this.onEvent && typeof this.onEvent === 'function') this.onEvent(event)
  }

  get pusherChannel() {
    return `private-encrypted-${this.appId}-${this.user.id}`
  }

  handleSentInput(message) {
    this.onEvent({
      action: 'update_message_info',
      message: { id: message.id, ack: 1 },
    })
  }

  handleUnsentInput(message) {
    this.onEvent({
      action: 'update_message_info',
      message: { id: message.id, ack: 0, unsentInput: message },
    })
  }

  async postMessage(user, message) {
    try {
      await this.init(user)
      return axios
        .post(
          `${HUBTYPE_API_URL}/v1/provider_accounts/webhooks/webchat/${this.appId}/`,
          {
            sender: this.user,
            message: message,
          }
        )
        .then(res => {
          if (res && res.status === 200) this.handleSentInput(message)
          return
        })
        .catch(() => this.handleUnsentInput(message))
    } catch (e) {
      this.handleUnsentInput(message)
      return Promise.resolve()
    }
  }

  static async getWebchatVisibility({ appId }) {
    return axios.get(
      `${HUBTYPE_API_URL}/v1/provider_accounts/${appId}/visibility/`
    )
  }

  async resendUnsentInputs() {
    for (const message of this.unsentInputs()) {
      message.unsentInput &&
        (await this.postMessage(this.user, message.unsentInput))
    }
  }
}
