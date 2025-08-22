import { MongoClient } from 'mongodb';
import { IDataObject } from 'n8n-workflow';

let clientCache: MongoClient;

export async function connectMongoClient(connectionString: string, credentials: IDataObject = {}) {
	if (clientCache) {
		return clientCache;
	}

	let client: MongoClient;

	// TODO implement credentials

	client = await MongoClient.connect(connectionString);

	clientCache = client;

	return client;
}
