import { PContent } from './pixiv/artwork'

export { PContent }

export function collectContents(container: ParentNode): PContent[] {
	return Iterator.from(collectFavButtons(container).values())
		.map(PContent.tryFromFavButton)
		.filter(val => val != null)
		.toArray()
}

function collectFavButtons(container: ParentNode) {
	return container.querySelectorAll<HTMLButtonElement>(PContent.favButtonQuery)
}

interface PBookmarkPayload {
	comment: string,
	illust_id: string,
	restrict: number,
	tags: any[],
}
interface PBookmarkResponse {
	error: boolean,
	message: string,
	body: [],
}

export async function bookmarkAsPrivate(id: string) {
	const url = new URL('https://www.pixiv.net/ajax/illusts/bookmarks/add')
	const payload: PBookmarkPayload = {
		illust_id: id,
		restrict: 1,
		comment: '',
		tags: [],
	}
	const req = new Request(url, {
		method: 'POST',
		headers: {
			accept: 'application/json',
			'content-type': 'application/json; charset=UTF-8',
			'x-csrf-token': findToken() ?? '',
		},
		body: JSON.stringify(payload),
		credentials: 'same-origin',
	})

	const res = await fetch(req)
	const body: PBookmarkResponse = await res.json()
	if (!res.ok) {
		console.error('Response', body.message, res)
	}
}

interface PNextData {
	props?: {
		pageProps?: {
			serverSerializedPreloadedState?: string,
		},
	},
}

interface PServerState {
	api?: {
		token?: string,
	},
}

function findToken() {
	// const nextDataRaw = document.getElementById('__NEXT_DATA__')?.textContent
	// if (nextDataRaw == null) return undefined
	// const nextData: PNextData = JSON.parse(nextDataRaw)

	// @ts-expect-error
	const nextData: PNextData = window.__NEXT_DATA__
	if (nextData == null) return undefined

	const serverStateRaw = nextData.props?.pageProps?.serverSerializedPreloadedState
	if (serverStateRaw == null) return undefined
	const serverState: PServerState = JSON.parse(serverStateRaw)

	const token = serverState.api?.token
	return token
}
