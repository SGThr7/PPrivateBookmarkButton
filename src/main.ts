import { createApp } from 'vue';
import './style.css';
import PrivateBookmarkButton from './components/PrivateBookmarkButton.vue';

const observer = new MutationObserver((mutations) => {
  console.log('detected')
  for (const mutation of mutations) {
    console.log(mutation.target)
  }
})
const observerOptions: MutationObserverInit = {
  subtree: true,
  childList: true,
};

// // 初回更新
// updatePpbbElements()

// 個別イラストページ
// FIXME: たまに登録失敗する
const artworksBookmarkButton = document.querySelector<HTMLButtonElement>('button.gtm-main-bookmark')
const artworksBookmarkParent = artworksBookmarkButton?.parentElement
if (artworksBookmarkButton != null && artworksBookmarkParent != null) {
  console.log('[PPBookmarkButton] Add button for main artwork', artworksBookmarkParent)
  injectPpbbButton(artworksBookmarkButton, (root) => {
    // insert after
    artworksBookmarkParent.parentNode?.insertBefore(root, artworksBookmarkParent.nextElementSibling)
  })
}

// // 関連作品
// const recommendedGrid = document.querySelector('ul.sc-9y4be5-1.jtUPOE')
// if (recommendedGrid != null) {
//   console.log('grid', recommendedGrid)
//   observer.observe(recommendedGrid, observerOptions)
// }

// function updatePpbbElements() {
//   const artworksBookmarkButton = document.querySelector('.sc-181ts2x-3.cXSAgn')
//   console.log('artworksBookmarkButton', artworksBookmarkButton)
//   injectPpbbButton((root) => {
//     // insert after
//     artworksBookmarkButton?.parentNode?.insertBefore(root, artworksBookmarkButton.nextElementSibling)
//   })
//   // const defaultBookmarkButtons = document.querySelectorAll('.sc-iasfms-4.iHfghO')
//   // for (const defaultBookmarkButton of defaultBookmarkButtons) {
//   //   injectPpbbButton((root) => {
//   //     defaultBookmarkButton.parentNode?.insertBefore(root, defaultBookmarkButton.nextElementSibling)
//   //   })
//   // }
// }

function injectPpbbButton(relatedBookmarkButton: HTMLButtonElement, injectCallback: (buttonRootElement: HTMLElement) => void) {
  // Create button element
  const ppbbRoot = document.createElement('div')
  ppbbRoot.classList.add('ppbb-root')

  // Inject
  injectCallback(ppbbRoot)

  // Mount
  const app = createApp(PrivateBookmarkButton, {
    relatedBookmarkButton
  })
  app.mount(ppbbRoot)
}
