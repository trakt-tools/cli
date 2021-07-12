/**
 * Please remove all generated comments before submitting a PR.
 */
// @ts-expect-error
import { ServiceApi } from '@apis/ServiceApi';
// fragment ^import %str%import
// @ts-expect-error
import { Requests } from '@common/Requests';
// fragment
// @ts-expect-error
import { Item } from '@models/Item';
// @ts-expect-error
import { SyncTemplateService } from '@/sync-template/SyncTemplateService';

// fragment ^class %str%\nclass
export interface TemplateHistoryItem {}
// fragment

// Define any types you need here

/**
 * This class should communicate with the service API, in order to retrieve the necessary information for syncing.
 *
 * Keep in mind that some services might have hidden APIs that you can use (you can usually find them by watching your network requests when using the service).
 */
class _SyncTemplateApi extends ServiceApi {
	// Define any properties you need here

	constructor() {
		super(SyncTemplateService.id);
	}

	// fragment ^}\n\nexport\sconst \n%str%}\n\nexport\sconst
	/**
	 * This method should load more history items.
	 *
	 * It should also set `hasReachedHistoryEnd` to true when there are no more history items to load.
	 */
	async loadNextHistoryPage(): Promise<TemplateHistoryItem[]> {
		// Example implementation:

		let historyItems: TemplateHistoryItem[] = [];

		// Retrieve the history items
		const responseText = await Requests.send({
			url: '...',
			method: 'GET',
		});
		const responseJson = JSON.parse(responseText);
		historyItems = responseJson?.items ?? [];

		// Check if it has reached the history end
		// @ts-expect-error
		this.hasReachedHistoryEnd = historyItems.length === 0;

		return historyItems;
	}

	/**
	 * This method should check if a history item is new.
	 */
	isNewHistoryItem(historyItem: TemplateHistoryItem, lastSync: number, lastSyncId: string) {
		// Example implementation:

		// @ts-expect-error
		return historyItem.date > lastSync;
	}

	/**
	 * This method should transform history items into items.
	 */
	convertHistoryItems(historyItems: TemplateHistoryItem[]) {
		// Example implementation:

		const items = historyItems.map(
			(historyItem) =>
				new Item({
					// @ts-expect-error
					serviceId: this.id,
					// @ts-expect-error
					id: historyItem.videoId,
					// @ts-expect-error
					type: historyItem.type,
					// @ts-expect-error
					title: historyItem.title,
				})
		);

		return Promise.resolve(items);
	}
	// fragment

	// Define any methods you need here
}

export const SyncTemplateApi = new _SyncTemplateApi();
