const socket = io()
import {formatDate} from '../utils.js'

const linksWindow = document.querySelector('.links-window')

function renderLinks(link) {
  const div = document.createElement('div')
  const formatedDate = formatDate(link.time)
  div.classList.add('render-message')

  div.innerHTML =
    `<div class="message">
      <span class="time">
        ${formatedDate}
      </span> <span>${link.text}</span>
    </div>`

  linksWindow.appendChild(div)
}


socket.emit('getLinks')

socket.on('allLinks', links => {
  links.reverse().forEach(link => {
    renderLinks(link)
  })
})
