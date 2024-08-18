<template>
	<button type="button" class="ppbb-button fgVkZi" @click="privateBookmark">
    <div class="container"><span class="heart heart-fill" :class="{ bookmarked: isBookmarked}">♥</span><span class="heart heart-outline">♡</span>️<span class="lock">🔒️</span></div>
  </button>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';

// メインページ: .sc-kgq5hw-0.fgVkZi.gtm-main-bookmark
// 同作者の別作品: .sc-kgq5hw-0.fgVkZi
// 関連作品: .sc-kgq5hw-0.fgVkZi

// ブックマーク追加/編集ページ: https://www.pixiv.net/bookmark_add.php?type=illust&illust_id=<artwork-id>

const props = defineProps({
  artworkId: {
    type: String,
    required: true,
    validator: (val: string) => {
      const validatorRegex = /^\d+$/
      return validatorRegex.test(val)
    },
  },
  relatedBookmarkButtonContainer: {
    type: Element,
    required: false,
  }
})

const getBookmarkButton = () => props.relatedBookmarkButtonContainer?.querySelector<HTMLButtonElement | HTMLAnchorElement>(':is(button, a:has(> svg))')

const isBookmarked = ref(parseIsBookmarked())

function parseIsBookmarked(): boolean {
  const styleElementClass = 'sc-j89e3c-1'
  const styleElement = props.relatedBookmarkButtonContainer?.querySelector(`.${styleElementClass}`)

  const bookmarkedClassName = 'bXjFLc'
  return styleElement?.classList.contains(bookmarkedClassName) ?? false
}

if (props.relatedBookmarkButtonContainer != null) {
  const observer = new MutationObserver(() => {
    isBookmarked.value = parseIsBookmarked()
  })
  observer.observe(props.relatedBookmarkButtonContainer, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] })
}

const bookmarkPageUrl = computed(() => new URL(`https://www.pixiv.net/bookmark_add.php?type=illust&illust_id=${props.artworkId}`))

function privateBookmark() {
  // for click animation
  getBookmarkButton()?.click()

  if (isBookmarked.value) {
    return
  }

  const bookmarkPageWindow = window.open(bookmarkPageUrl.value, '_blank', 'popup,width=1,height=1,top=0,left=0')

  const bookmarkPageAction = () => {
    if (bookmarkPageWindow == null) {
      throw new Error('Failed to get bookmark page window')
    }

    const bookmarkPageDocument = bookmarkPageWindow.document
    if (bookmarkPageDocument == null) {
      throw new Error('Failed to get bookmark page document')
    }

    const form = bookmarkPageDocument.querySelector<HTMLFormElement>('section.bookmark-detail-unit>form')
    if (form == null) {
      throw new Error('Failed to find bookmark form')
    }

    const restrictRadio = form.elements.namedItem('restrict')
    if (restrictRadio == null || !isRadioNodeList(restrictRadio)) {
      throw new Error('Failed to get restrict radio button')
    }

    // set to private
    restrictRadio.value = '1'

    // close popup when finished private bookmark 
    const finishedEventName = 'pagehide'
    const onBookmarkedAction = () => {
      // do action once
      bookmarkPageWindow.removeEventListener(finishedEventName, onBookmarkedAction)

      // close bookmark window
      bookmarkPageWindow.close()
    }
    bookmarkPageWindow.addEventListener(finishedEventName, onBookmarkedAction)

    // submit
    form.requestSubmit()
  }

  // Note: `readyState === 'complete'` does not means window is loaded.
  bookmarkPageWindow?.addEventListener('load', bookmarkPageAction)
}

function isRadioNodeList(target: object): target is RadioNodeList {
  return target instanceof RadioNodeList || target.toString() === RadioNodeList.prototype.toString()
}
</script>

<style scoped>
.private-bookmark-button {
  color: inherit;
  font-size: large;
  font-family: inherit;
}

.container {
  position: relative;
}

.heart {
  font-size: 200%;
}

.heart-fill {
  color: inherit;
}

.heart-outline {
  position: absolute;
  right: 0px;
  bottom: 0px;
  color: black;
}

.bookmarked {
  color: rgb(255, 64, 96);
}

.lock {
  font-size: 100%;
  position: absolute;
  right: -5px;
  bottom: 1px;
}
</style>