// Regex to check link (not mine of course 🤡)
const MAXI_REGEX = /^(http(s)?:\/\/)?(www.)?([a-zA-Z0-9])+([\-\.]{1}[a-zA-Z0-9]+)*\.[a-zA-Z]{2,5}(:[0-9]{1,5})?(\/[^\s]*)?$/gm

// Format date in javascript is 𝔉𝔘𝔑
export function formatDate(date) {
  return `${date.toLocaleString('fr-FR',{month: 'numeric', day: 'numeric'})}|${date.toLocaleString('fr-FR',{hour: 'numeric', minute: 'numeric', second: 'numeric'})}`
}

// Check if it's a link, then add a <a>
export function urlToLink(message) {
  return message.replace(MAXI_REGEX, function (url) {
    let link = url;
    if (!link.match('^https?:\/\/')) {
      link = 'http://' + link;
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
  notifications.appendChild(notification)
  setTimeout(() => {
    notification.innerHTML = ''
    notification.classList.add('hidden')
    notification.remove()
  }, time || 3000)
}

// Trim & check if there's a link in the message
export function formatMessage(message) {
  let cleanMessage = message.replaceAll(/<[^>]*>/g, '')
  let arrayMsg = cleanMessage.split(' ')
  let linkArray = []
  arrayMsg.forEach(w => {
    if (MAXI_REGEX.test(w)) {
      linkArray.push(urlToLink(w).trim())
    } else {
      linkArray.push(w.trim())
    }
  })

  return linkArray.join(' ')
}

export function setCookie(name, value, days = 7, path = '/') {
    const expires = new Date(Date.now() + days * 864e5).toUTCString()
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=' + path
}