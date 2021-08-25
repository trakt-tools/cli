declare interface StreamingService {
	name: string;
	id: string;
	homePage: string;
	hostPatterns: string[];
	hasScrobbler: boolean;
	hasSync: boolean;
	hasAutoSync: boolean;
	limitations?: string[];
}

declare type CreateStreamingServiceOptions = Omit<StreamingService, 'hostPatterns'>;

declare interface UpdateStreamingServiceOptions {
	id: string;
	addScrobbler: boolean;
	addSync: boolean;
}
