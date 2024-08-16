<template>
	<button type="button" class="private-bookmark-button fgVkZi" @click="privateBookmark">
    <div class="container"><span class="heart">♡</span>️<span class="lock">🔒️</span></div>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// メインページ: .sc-kgq5hw-0.fgVkZi.gtm-main-bookmark
// 同作者の別作品: .sc-kgq5hw-0.fgVkZi
// 関連作品: .sc-kgq5hw-0.fgVkZi

// ブックマーク追加/編集ページ: https://www.pixiv.net/bookmark_add.php?type=illust&illust_id=<artwork-id>

const props = defineProps({
  relatedBookmarkButton: {
    type: HTMLButtonElement,
    required: true,
  }
})

const artworkId = computed(() => findArtworkId(props.relatedBookmarkButton))
const bookmarkPageUrl = computed(() => new URL(`https://www.pixiv.net/bookmark_add.php?type=illust&illust_id=${artworkId.value}`))

function privateBookmark() {
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

    // for click animation
    props.relatedBookmarkButton.click()

    // submit
    form.requestSubmit()
  }

  // Note: `readyState === 'complete'` does not means window is loaded.
  bookmarkPageWindow?.addEventListener('load', bookmarkPageAction)
}

// #region utils

function findArtworkId(bookmarkButton: HTMLButtonElement): string | null {
  if (isMainArtwork(bookmarkButton)) {
    return findMainArtworkId()
  } else {
    return null
  }
}

function isMainArtwork(bookmarkButton: Element): boolean {
  const targetClasses = [
    'sc-kgq5hw-0',
    'fgVkZi',
    'gtm-main-bookmark',
  ]
  const buttonClassList = bookmarkButton.classList
  return targetClasses.every((val) => buttonClassList.contains(val))
}

function findMainArtworkId(): string {
  const url = new URL(window.location.href)
  const paths = url.pathname.split('/')
  if (paths[1] !== 'artworks') {
    throw new Error('Failed to find artwork id')
  }

  const mainArtworkId = paths[2]
  return mainArtworkId
}

function isRadioNodeList(target: object): target is RadioNodeList {
  return target instanceof RadioNodeList || target.toString() === '[object RadioNodeList]'
}

// #endregion utils
</script>

<style scoped>
.private-bookmark-button {
  color: inherit;
  margin-right: 13px;
  font-size: large;
  font-family: inherit;
}

.container {
  position: relative;
}

.heart {
  font-size: 150%;
}

.lock {
  font-size: 100%;
  position: absolute;
  right: -10px;
  bottom: 0px;
}
</style>