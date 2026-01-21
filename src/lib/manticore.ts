import { ManticoreApiClient } from 'manticoresearch';

const client = new ManticoreApiClient.IndexApi();

// Configure the client directly if needed, but defaults usually work for localhost:9308
// The SDK might need specific configuration injection depending on version.
// For the generated SDK 'manticoresearch', we typically use it like this:

const config = new ManticoreApiClient.Configuration({
    basePath: "http://127.0.0.1:9308"
});
const indexApi = new ManticoreApiClient.IndexApi(config);
const searchApi = new ManticoreApiClient.SearchApi(config);
const utilsApi = new ManticoreApiClient.UtilsApi(config);

export const manticoreClient = {
    index: indexApi,
    search: searchApi,
    utils: utilsApi
};

export const INDEX_NAME = 'products';
