// Regex to check link (not mine of course 🤡)
const MAXI_REGEX = /^(http(s)?:\/\/)?(www.)?([a-zA-Z0-9])+([\-\.]{1}[a-zA-Z0-9]+)*\.[a-zA-Z]{2,5}(:[0-9]{1,5})?(\/[^\s]*)?$/gm

// Format date in javascript is 𝔉𝔘𝔑
export function formatDate(rawDate) {
  const date = new Date(rawDate)
  return `${date.toLocaleString('fr-FR', {month: 'numeric', day: 'numeric'})}|${date.toLocaleString('fr-FR', {hour: 'numeric', minute: 'numeric', second: 'numeric'})}`
}

// https://css-tricks.com/snippets/javascript/htmlentities-for-javascript/ ❤️
export function cleanHTML(string) {
  return String(string)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// Check if it's a link, then add a <a>
export function urlToLink(message) {
  return message.replace(MAXI_REGEX, url => {
    let link = url
    if (!link.match('^https?://')) {
      link = 'http://' + link
    }

    return `<a href="${link}" target="_blank">${url}</a>`
  })
}

/*##########################################################################
# Notification function                                                     #
# Need .notification css class                                              #
# -> string: message to display                                             #
# -> time: how much time displaying notification, default: 3000             #
# -> container: container to display notification, default: document.body   #
 ##########################################################################*/

export function sendNotification(string, time, container) {
  const notification = document.createElement('div')
  const notifications = container || document.body
  notification.classList.add('notification')
  notification.innerHTML = (string)
  notifications.append(notification)
  setTimeout(() => {
    notification.innerHTML = ''
    notification.classList.add('hidden')
    notification.remove()
  }, time || 3000)
}

// Trim & check if there's a link in the message
export function formatMessage(message) {
  const cleanMessage = cleanHTML(message)
  const arrayMsg = cleanMessage.split(' ')
  const linkArray = []

  arrayMsg.forEach(w => {
    if (MAXI_REGEX.test(w)) {
      linkArray.push(urlToLink(w).trim())
    } else {
      linkArray.push(w.trim())
    }
  })

  return linkArray.join(' ')
}

// Render message line with date and name
export function renderMessage(message) {
  const div = document.createElement('div')
  const formatedDate = formatDate(message.time)
  div.classList.add('render-message')
  div.innerHTML = `<div class="message">
                    <span class="time">
                      ${formatedDate}
                    </span> ◀︎<span class="pseudo"> ${message.name} </span>▶︎ <span>${message.text}</span>
                  </div>`

  return div
}
