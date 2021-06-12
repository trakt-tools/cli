declare interface StreamingService {
	name: string;
	id: string;
	homePage: string;
	hostPatterns: string[];
	hasScrobbler: boolean;
	hasSync: boolean;
	hasAutoSync: boolean;
}

declare type CreateStreamingServiceOptions = Omit<StreamingService, 'hostPatterns'>;

declare interface UpdateStreamingServiceOptions {
	id: string;
	addScrobbler: boolean;
	addSync: boolean;
}
