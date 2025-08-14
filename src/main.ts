import { createApp } from 'vue'
import PrivateBookmarkButton from './components/PrivateBookmarkButton.vue'
import './style.css'

import { makeLogGroupCollapsedFn, testNodeGen } from './lib/util'
import { collectContents } from './lib/pixiv'
import { PContent } from './lib/pixiv/artwork'

init()

function init() {
	console.groupCollapsed('Initial insert')

	const contents = collectContents(document)
	Iterator.from(contents.values())
		.forEach(insertButton)

	const observerConfig: MutationObserverInit = { childList: true, subtree: true }
	const observer = new MutationObserver(records => {
		const { beginLogGroup, endLogGroup, isGrouping } = makeLogGroupCollapsedFn('Detect new contents loaded', `len=${records.length}`)

		records.forEach(record => {
			// Disable while inserting button
			observer.disconnect()

			Iterator.from(record.addedNodes.values())
				.filter(testNodeGen(Element))
				.map(PContent.findFavButton)
				.filter(val => val != null)
				.map(PContent.tryFromFavButton)
				.filter(val => val != null)
				.filter(() => {
					// Group logs if any content detected
					beginLogGroup()
					return true
				})
				.forEach(insertButton)

			// Re-enable observing
			observer.observe(document, observerConfig)
		})

		if (isGrouping()) {
			console.log(records)
		}

		endLogGroup()
	})
	observer.observe(document, observerConfig)

	console.groupEnd()
}

// MARK: Make button

function insertButton(content: PContent) {
	console.groupCollapsed('insertButton', content.id)
	console.log('content', content)

	const favContainer = content.favButton.parentElement
	if (favContainer == null) {
		console.error('Failed to find parent element of fav button', content.favButton)
		return
	}

	const { appElement } = makeButton(content)
	favContainer.insertBefore(appElement, content.favButton)
	console.log('Insert private fav button', appElement)

	console.groupEnd()
}

function makeButton(content: PContent) {
	const appElement = document.createElement('div')
	appElement.classList.add('ppbb-root', ...content.favButton.classList)
	const app = createApp(PrivateBookmarkButton, { content })
	app.mount(appElement)

	return { app, appElement }
}
