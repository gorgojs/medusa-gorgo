export interface IFeedProvider {
    getFeedData(feed: Record<string, any>, container: any): Promise<string>;
}