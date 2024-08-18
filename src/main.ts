import { createApp } from 'vue';
import './style.css';
import PrivateBookmarkButton from './components/PrivateBookmarkButton.vue';
import { isElement, log, LogVerbosity } from './lib/util';

const globalObserver = new MutationObserver((records, _observer) => {
  records.forEach((record) => {
    if (record.addedNodes.length <= 0) {
      return
    }
    if (Array.from(record.addedNodes).some((node) => isElement(node) && Array.from(node.classList).some((className) => className.startsWith('ppbb')))) {
      return
    }

    log(LogVerbosity.Debug, '[GlobalObserver] Begin container test', record)

    // single container
    log(LogVerbosity.Debug, '[GlobalObserver] Test single container')
    Array.from(record.addedNodes)
      .filter(isElement)
      .filter(
        (el) => el.querySelectorAll('button.sc-kgq5hw-0').length === 1
          && el.querySelector('div.ppbb-root') == null
      )
      .forEach(applyThumbnailArtwork)
    // container list
    log(LogVerbosity.Debug, '[GlobalObserver] Test container list')
    if (record.addedNodes.length === 1) {
      const maybeContainersOwner = record.addedNodes[0]
      if (isElement(maybeContainersOwner)) {
        const artworkContainersList = maybeContainersOwner.querySelectorAll(':is(ul, div.sc-1nhgff6-4) > :is(div, li):has(button.sc-kgq5hw-0)')
        artworkContainersList.forEach((artworkContainers) => {
          log(LogVerbosity.Debug, '[GlobalObserver] Found container gird', artworkContainers, maybeContainersOwner)
          Array.from(artworkContainers.children)
            .filter((el) => el.querySelector('div.ppbb-root') == null)
            .forEach(applyThumbnailArtwork)
        })
      }
    }

    log(LogVerbosity.Debug, '[GlobalObserver] End container test')
  })
})
const globalObserverOption: MutationObserverInit = {
  childList: true,
  subtree: true,
}

function init() {
  // initial injection
  log(LogVerbosity.Debug, 'init: Begin initial injection')
  const initialArtworkContainers = document.querySelectorAll('div:has(a[data-gtm-value]):has(div:nth-child(2) button.sc-kgq5hw-0)')
  initialArtworkContainers.forEach((el) => {
    if (
      el.querySelectorAll('button.sc-kgq5hw-0').length === 1
      && el.querySelector('div.ppbb-root') == null
    ) {
      applyThumbnailArtwork(el);
    }
  })

  // bind events
  log(LogVerbosity.Debug, 'init: Bind events')
  window.addEventListener('load', onLoad)

  // observe dynamic loaded artworks
  log(LogVerbosity.Debug, 'init: Run global observer')
  globalObserver.observe(document, globalObserverOption)

  // observe page title
  log(LogVerbosity.Debug, 'init: Run page title observer')
  const titleObserver = new MutationObserver((records, _observer) => {
    initMainArtwork()
  })
  const title = document.head.querySelector('title')
  if (title != null) {
    titleObserver.observe(title, {
      childList: true,
      subtree: true,
    })
  }
}

function onLoad() {
  // 個別イラストページ
  initMainArtwork()
}

init()

function initMainArtwork() {
  const buttonContainer = document.querySelector<HTMLDivElement>('div.sc-181ts2x-3')
  if (buttonContainer == null) {
    return
  }

  const url = new URL(window.location.href)
  const artworkPageRegex = /^\/(?:en\/)?artworks\/(\d+)$/
  const regexResult = url.pathname.match(artworkPageRegex)
  if (regexResult == null || regexResult.length <= 1) {
    return
  }
  const artworkId = regexResult[1]

  // Create button root element
  const ppbbRoot = document.createElement('div')
  ppbbRoot.classList.add('ppbb-root', 'ppbb-main')

  // Inject
  buttonContainer.parentNode?.insertBefore(ppbbRoot, buttonContainer.nextElementSibling)

  // Mount
  const app = createApp(PrivateBookmarkButton, {
    artworkId,
    relatedBookmarkButtonContainer: buttonContainer,
  })
  app.mount(ppbbRoot)
  
  log(LogVerbosity.Verbose, 'Add button for main artwork', artworkId, buttonContainer)
}

function applyThumbnailArtwork(target: Element) {
  const artworkLink = target.querySelector('a[data-gtm-value]')
  if (artworkLink == null) {
    log(LogVerbosity.Debug, 'applyThumbnailArtwork: Returned artwork link is not found', target)
    return
  }

  const artworkId = artworkLink.getAttribute('data-gtm-value')
  if (artworkId == null) {
    log(LogVerbosity.Debug, 'applyThumbnailArtwork: Returned artwork cannot extracted', artworkLink, target)
    return
  }

  const button = target.querySelector('button')
  if (button == null) {
    log(LogVerbosity.Debug, 'applyThumbnailArtwork: Returned button is not found', target)
    return
  }

  const buttonContainer = button.parentElement?.parentElement
  if (buttonContainer == null) {
    log(LogVerbosity.Debug, 'applyThumbnailArtwork: Returned artwork link has not container', button, target)
    return
  }

  // Create button root element
  const ppbbRoot = document.createElement('div')
  ppbbRoot.classList.add('ppbb-root', 'ppbb-absolute')

  // Inject
  buttonContainer.appendChild(ppbbRoot)

  // Mount
  const app = createApp(PrivateBookmarkButton, {
    artworkId,
    relatedBookmarkButtonContainer: button.parentElement,
  })
  app.mount(ppbbRoot)

  log(LogVerbosity.Verbose, 'Add button for recommendation', artworkId, target)
}
