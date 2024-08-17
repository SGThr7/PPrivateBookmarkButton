import { createApp } from 'vue';
import './style.css';
import PrivateBookmarkButton from './components/PrivateBookmarkButton.vue';

function log(...data: any[]) {
  if (!import.meta.env.DEV) return

  const msg = data.splice(0, 1)
  console.log(`[PPBookmarkButton] ${msg[0]}`, ...data)
}

// first init
window.addEventListener('load', initPpbb)

// init when page moved
const observer = new MutationObserver((records) => {
  initPpbb()
})
const observerOptions: MutationObserverInit = {
  subtree: true,
  childList: true,
}
const title = document.head.querySelector('title')
if (title != null) {
  observer.observe(title, observerOptions)
}

function initPpbb() {
  log('Initialize')

  // 個別イラストページ
  initMainArtwork()

  // 同一作者の関連作品
  initSameCreatorRecommendationArtworks()

  // その他の関連作品
  initOtherRecommendation()
}

function initMainArtwork() {
  const buttonContainer = document.querySelector<HTMLDivElement>('div.sc-181ts2x-3')
  if (buttonContainer == null) {
    return
  }

  const button = document.querySelector<HTMLButtonElement>('button.gtm-main-bookmark')

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
    relatedBookmarkButton: button
  })
  app.mount(ppbbRoot)
  

  log('Add button for main artwork', artworkId, buttonContainer)
}

function initSameCreatorRecommendationArtworks() {
  const targetContainer = document.querySelector<HTMLDivElement>('nav.sc-1nhgff6-3 > div.sc-1nhgff6-4')
  if (targetContainer != null) {
    for (const artwork of targetContainer.children) {
      applySameCreatorRecommendationArtwork(artwork)
    }

    // observe scrolling
    const observer = new MutationObserver((records, _observer) => {
      for (const record of records) {
        if (record.addedNodes.length > 0) {
          for (const addedNode of record.addedNodes) {
            if (addedNode instanceof HTMLDivElement && addedNode.classList.contains('sc-1nhgff6-0')) {
              applySameCreatorRecommendationArtwork(addedNode)
            }
          }
        }
      }
    })
    observer.observe(targetContainer, observerOptions)
  }
}

function applySameCreatorRecommendationArtwork(target: Element) {
  const button = target.querySelector('button')
  if (button == null) {
    return
  }

  const artworkLink = target.querySelector('a[data-gtm-value]')
  if (artworkLink == null) {
    return
  }

  const artworkId = artworkLink.getAttribute('data-gtm-value')
  if (artworkId == null) {
    return
  }

  const buttonContainer = artworkLink.parentElement
  if (buttonContainer == null) {
    return
  }

  // Create button root element
  const ppbbRoot = document.createElement('div')
  ppbbRoot.classList.add('ppbb-root', 'ppbb-absolute')

  // Inject
  buttonContainer.parentNode?.insertBefore(ppbbRoot, buttonContainer.nextElementSibling)

  // Mount
  const app = createApp(PrivateBookmarkButton, {
    artworkId,
    relatedBookmarkButton: button
  })
  app.mount(ppbbRoot)

  log('Add button for same creator\'s recommendation', artworkId, target)
}

function initOtherRecommendation() {
  const targetContainer = document.querySelector<HTMLUListElement>('div.gtm-illust-recommend-zone ul')
  if (targetContainer != null) {
    for (const artwork of targetContainer.children) {
      applyOtherRecommendationArtwork(artwork)
    }

    // observe scrolling
    const observer = new MutationObserver((records, _observer) => {
      for (const record of records) {
        if (record.addedNodes.length > 0) {
          for (const addedNode of record.addedNodes) {
            // addedNode.classList.contains('sc-9y4be5-2')
            // addedNode.classList.contains('sc-9y4be5-3')
            // addedNode.classList.contains('sc-1wcj34s-1')
            if (addedNode instanceof HTMLLIElement && addedNode.classList.contains('sc-9y4be5-2')) {
              applyOtherRecommendationArtwork(addedNode)
            }
          }
        }
      }
    })
    observer.observe(targetContainer, observerOptions)
  }
}

function applyOtherRecommendationArtwork(target: Element) {
  const button = target.querySelector('button')
  if (button == null) {
    return
  }

  const artworkLink = target.querySelector('a[data-gtm-value]')
  if (artworkLink == null) {
    return
  }

  const artworkId = artworkLink.getAttribute('data-gtm-value')
  if (artworkId == null) {
    return
  }

  const buttonContainer = artworkLink.parentElement
  if (buttonContainer == null) {
    return
  }

  // Create button root element
  const ppbbRoot = document.createElement('div')
  ppbbRoot.classList.add('ppbb-root', 'ppbb-absolute')

  // Inject
  buttonContainer.parentNode?.insertBefore(ppbbRoot, buttonContainer.nextElementSibling)

  // Mount
  const app = createApp(PrivateBookmarkButton, {
    artworkId,
    relatedBookmarkButton: button
  })
  app.mount(ppbbRoot)

  log('Add button for other recommendation', artworkId, target)
}
