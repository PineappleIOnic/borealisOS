import './styles/notificationService.scss'

export default class NotificationService {
  constructor () {
    this.currentNotifications = []

    this.notificationContainer = document.getElementById('notification-container')

    if (!this.notificationContainer) {
      this.notificationContainer = document.createElement('div')
      this.notificationContainer.id = 'notification-container'
      this.notificationContainer.className = 'borealisNotificationContainer'
      document.body.appendChild(this.notificationContainer)
    }
  }

  createNotification (title, message, icon, duration = 5000) {
    const notificationPromise = new Promise(async (resolve, reject) => {
      const notification = this.createNotificationElement(title, message, icon)

      this.notificationContainer.appendChild(notification)
      notification.className = 'borealisNotification slideIn'

      await new Promise(resolve => setTimeout(resolve, 500))

      notification.className = 'borealisNotification'

      await new Promise(resolve => setTimeout(resolve, duration - 500))

      notification.className = 'borealisNotification slideOut'

      await new Promise(resolve => setTimeout(resolve, 1000))

      this.notificationContainer.removeChild(notification)
      resolve()
    })

    this.currentNotifications.push(notificationPromise)
  }

  createNotificationElement (title, message, icon) {
    // TODO: Sanitize title and message and add support for icon

    const notification = document.createElement('div')
    notification.className = 'borealisNotification'

    notification.innerHTML = `
        <div class="icon">
          <svg
            viewBox="0 0 364 364"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g>
              <path
                id="svg_1"
                d="m223.864,272.729l-38.608,-97.848l-56.603,89.184l-35.487,0l79.052,-127.654l-8.875,-25.229l-30.781,0l0,-30.062l52.691,0l60.521,153.899l26.608,-8.668l8.867,29.813l-57.385,16.565z"
                fill="currentColor"
              ></path>
              <path
                id="svg_2"
                d="m337.623,182.198c0,85.579 -69.363,154.934 -154.934,154.934c-85.571,0 -154.936,-69.354 -154.936,-154.934c0,-85.569 69.363,-154.933 154.936,-154.933c85.57,0 154.934,69.364 154.934,154.933z"
                stroke-width="34"
                stroke="currentColor"
                fill="none"
              ></path>
            </g>
          </svg>
        </div>
        <div class="message">
          <h2>
            ${title}
          </h2>
          <p>
            ${message}
          </p>
        </div>
      `

    return notification
  }

  cleanup () {
    this.currentNotifications = []

    document.removeChild(this.notificationContainer)
  }
}
