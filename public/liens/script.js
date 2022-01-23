const socket = io()

const linksWindow = document.querySelector('.links-window')

function renderLinks(link) {
  const div = document.createElement('div')
  div.classList.add('render-message')

  div.innerHTML =
    `<div class="message">
      <span class="time">
        ${link.time}
      </span> <span>${link.text}</span>
    </div>`

  linksWindow.appendChild(div)
  linksWindow.scrollTop = - linksWindow.scrollHeight
}


socket.emit('getLinks')

socket.on('allLinks', links => {
	links.forEach(link => {
		renderLinks(link)
	})
})
