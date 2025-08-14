<template>
  <button type="button" class="ppbb-button" @click="privateBookmark" v-if="!isFav">
    <div class="container">
      <div v-html="favImg"></div>
      <span class="lock-icon">🔒️</span>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed, customRef, onBeforeUnmount, onUnmounted, ref } from 'vue';
import { PContent } from '../lib/pixiv/artwork';
import { bookmarkAsPrivate } from '../lib/pixiv';

// ブックマーク追加/編集ページ: https://www.pixiv.net/bookmark_add.php?type=illust&illust_id=<artwork-id>

const props = defineProps({
  content: {
    type: PContent,
    required: true
  },
})

const contentId = computed(() => props.content.id)
const originalFavSvg = computed(() => props.content.favButton.querySelector('svg'))
const favImg = computed(() => originalFavSvg.value?.outerHTML ?? '♥')
const favColor = PContent.favButtonColor
let onChangedFavHandler: string | undefined
const isFav = makeIsFavRef()

function makeIsFavRef() {
  const retRef = customRef((track, trigger) => {
    onChangedFavHandler = props.content.registerOnChangedFav(trigger)
    return {
      get() {
        track()
        return props.content.testIsFav()
      },
      // no setter
      set() { }
    }
  })

  return retRef
}

function privateBookmark() {
  props.content.toggleFav()
  // FIXME: send after click event
  setTimeout(() => {
    bookmarkAsPrivate(contentId.value)
      .then(() => {
        // FIXME: apply private icon to button
        // setTimeout(() => {
        //   props.content.toggleFav()
        // }, 100)
      })
  }, 100)
  return
}

onBeforeUnmount(() => {
  if (onChangedFavHandler != null) {
    props.content.unregisterOnChangedFav(onChangedFavHandler)
  }
})
</script>

<style scoped>
.ppbb-button {
  color: inherit;
  font-size: large;
  font-family: inherit;
  padding: 0;
}

.container {
  position: relative;
}

.bookmarked {
  color: v-bind(favColor);
}

.lock-icon {
  font-size: 100%;
  position: absolute;
  right: -5px;
  bottom: 1px;
}
</style>
