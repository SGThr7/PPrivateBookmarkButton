import { findStyles, iterElementStack, testNodeGen } from "../util"

type ContentId = string
type ContentType = 'artworks' | 'novel'
type OnChangedFav = (isFav: boolean) => void

const baseUrl = new URL('https://www.pixiv.net/')

export class PContent {
	private _id: ContentId
	private _type: ContentType

	private _baseFavButtonContainer: HTMLElement
	private _toggleFavButton: HTMLButtonElement
	private _toggleFavSvg: SVGElement | null

	private _onChangedFav: Map<string, OnChangedFav>
	private _isFavCache: boolean
	private _observers: MutationObserver[]

	// MARK: accessor

	get id() { return this._id }

	get type() { return this._type }

	get url(): URL {
		const relativeUrl = PContent.makeContentUrl(this.type, this.id)
		const fullUrl = new URL(relativeUrl, baseUrl)
		return fullUrl
	}

	get favButton(): HTMLElement { return this._baseFavButtonContainer }

	get isFavCache() { return this._isFavCache }

	private set isFavCache(value: boolean) {
		if (this._isFavCache !== value) {
			this._isFavCache = value
			// observe events
			Iterator.from(this._onChangedFav.values())
				.forEach(fn => fn(this._isFavCache))
		}
	}

	// MARK: constructor

	constructor(id: ContentId, type: ContentType, baseFavButtonContainer: HTMLElement, toggleFavButton: HTMLButtonElement) {
		this._id = id
		this._type = type

		this._baseFavButtonContainer = baseFavButtonContainer
		this._toggleFavButton = toggleFavButton

		this._toggleFavSvg = this._toggleFavButton.getElementsByTagName('svg').item(0)

		this._onChangedFav = new Map()
		this._isFavCache = this.testIsFav()

		this._observers = []
		{
			const observer = new MutationObserver((records) => {
				const newIsFavValue = Iterator.from(records.values())
					.map(record => record.target)
					.filter(testNodeGen(Element))
					.map(el => PContent.testIsFav(el))
					.reduce((prev, cur) => cur, this._isFavCache)
				this.isFavCache = newIsFavValue
			})
			observer.observe(this._toggleFavButton, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] })
			this._observers.push(observer)
		}
	}

	static tryFromFavButton(favButtonElement: HTMLElement) {
		const contentLinkElement = PContent.findRelatedContentAnchorWithFavButton(favButtonElement)
		if (contentLinkElement == null) return undefined

		const containerElement = favButtonElement.parentElement
		if (containerElement == null) return undefined

		const info = PContent.findInfoFromLinkElement(contentLinkElement)
		if (info == null) return undefined
		const { type, id } = info

		const testIsButton = testNodeGen(HTMLButtonElement)

		// Find toggle fav button. Note that main artwork fav button cannot unfav content by click event.
		const toggleFavButton = PContent.testIsMainArtworkFavButton(favButtonElement)
			? PContent.findFavButtonWithId(document, id)
			: favButtonElement
		if (toggleFavButton == null || !testIsButton(toggleFavButton)) return undefined

		return new PContent(id, type, favButtonElement, toggleFavButton)
	}

	// MARK: Edit contents

	toggleFav() {
		this._toggleFavButton.click()
	}

	testIsFav(): boolean {
		return this._toggleFavSvg != null ? PContent.testIsFav(this._toggleFavSvg) : false
	}

	registerOnChangedFav(fn: OnChangedFav): string | undefined {
		const uuid = self.crypto.randomUUID()
		if (this._onChangedFav.has(uuid)) {
			return undefined
		}

		this._onChangedFav.set(uuid, fn)
		return uuid
	}

	unregisterOnChangedFav(id: string) {
		if (this._onChangedFav.has(id)) {
			this._onChangedFav.delete(id)
			return true
		} else {
			return false
		}
	}

	// MARK: Static fn

	static get favButtonQuery() {
		return ':is(button,a[href^="/bookmark_add.php"]):has(> svg[width="32"][height="32"] path+path)'
	}

	static findFavButton(container: Element) {
		return container.querySelector<HTMLElement>(PContent.favButtonQuery)
	}

	static makeToggleFavButtonQuery(id: ContentId) {
		return `div:has(> a img[src*="${id}"]) button`
	}

	static findFavButtonWithId(container: ParentNode, id: ContentId): HTMLButtonElement | null {
		return container.querySelector<HTMLButtonElement>(PContent.makeToggleFavButtonQuery(id))
	}

	// static get mainContentFavButtonQuery() {
	// 	return ':is(button.gtm-main-bookmark,a[href^="/bookmark_add.php"]):has(> svg[width="32"][height="32"] path+path)'
	// }

	static testIsMainArtworkFavButton(favButton: HTMLElement) {
		const isAnchor = testNodeGen(HTMLAnchorElement)
		return favButton.classList.contains('gtm-main-bookmark')
			|| (favButton.tagName === HTMLAnchorElement.toString() && isAnchor(favButton))
	}

	static get childContentAnchorQuery() {
		return ':is(a[href^="/artworks/"],a[href^="/novel/"],a[href*="i.pximg.net"]):has(img)'
	}

	static findChildContentAnchor(container: Element) {
		return container.querySelector<HTMLAnchorElement>(PContent.childContentAnchorQuery)
	}

	static findRelatedContentAnchorWithFavButton(favButton: HTMLElement) {
		return iterElementStack(favButton)
			// .take(7)
			.map(PContent.findChildContentAnchor)
			.find(val => val != null)
	}

	static findInfoFromLinkElement(imageAnchor: HTMLAnchorElement): { type: ContentType, id: ContentId } | undefined {
		const imageDom = imageAnchor.getElementsByTagName('img')[0]
		const imageSrc = imageDom.src
		if (imageSrc.includes('img-master') || imageSrc.includes('custom-thumb')) {
			const id = imageSrc.split('/').at(-1)?.split('_').at(0)
			if (id != null) {
				return { type: 'artworks', id }
			}
		} else if (imageSrc.includes('novel-cover-master')) {
			const id = imageSrc.split('/').at(-1)?.split('_').at(0)?.slice('ci'.length)
			if (id != null) {
				return { type: 'novel', id }
			}
		}

		return undefined
	}

	static makeContentUrl(type: ContentType, id: ContentId): URL {
		switch (type) {
			case 'artworks': {
				return new URL(`/artworks/${id}`)
			}
			case 'novel': {
				return new URL(`/novel/show.php?id=${id}`)
			}
		}
	}

	static get favButtonColor() {
		return 'rgb(255, 64, 96)'
	}

	static testIsFav(el: Element): boolean {
		const favColor = PContent.favButtonColor
		const isFav = Iterator.from(el.classList.values())
			.flatMap(className => findStyles(`.${className}`))
			.map(rule => rule.style.getPropertyValue('color'))
			.filter(val => val !== '')
			.some(val => val === favColor)
		return isFav
	}

}
