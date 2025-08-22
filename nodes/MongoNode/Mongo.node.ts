import { ClientSession } from 'mongodb';
import type {
	ICredentialsDecrypted,
	ICredentialTestFunctions,
	IExecuteFunctions,
	INodeCredentialTestResult,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';
import { validateAndResolveMongoCredentials } from './helper/connectionString';
import { connectMongoClient } from './helper/connectMongoClient';
import { mongoProperties } from './Mongo.properties';

export class Mongo implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Mongo Node (OG)',
		name: 'mongoNodeOg',
		icon: 'file:mongo.svg',

		group: ['transform'],
		version: 1,
		subtitle:
			'={{$parameter["collection"] || $json["collection"]}} / {{$json["op"] || $parameter["op"]}}',
		description: 'Perform MongoDB operations',
		defaults: {
			name: 'Mongo Node',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'mongoDb',
				required: true,
			},
		],
		properties: mongoProperties,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const credentials = await this.getCredentials('mongoDb');

		const { database, connectionString } = validateAndResolveMongoCredentials(credentials);

		const collectionName = this.getNodeParameter('collection', 0) as string;
		const advancedOptions = this.getNodeParameter(
			'advancedOptions',
			0,
			{},
			{ ensureType: 'json' },
		) as any;

		const runInTransaction = advancedOptions.runInTransaction ?? false;

		const client = await connectMongoClient(connectionString);

		const db = client.db(database);
		const collection = db.collection(collectionName);

		const action = async (session?: ClientSession) => {
			const tasks = items.map(async (_, i) => {
				const op = this.getNodeParameter('op', i, 'find') as string;

				switch (op) {
					case 'insertOne': {
						const doc: any = this.getNodeParameter('doc', i, '{}', { ensureType: 'json' });
						const res = await collection.insertOne(doc, { session });

						return res;
					}

					case 'insertMany': {
						const docs: any = this.getNodeParameter('docs', i, '[]', { ensureType: 'json' });
						const res = await collection.insertMany(docs, { session });

						return res;
					}

					case 'find': {
						const filter: any = this.getNodeParameter('filter', i, '{}', { ensureType: 'json' });
						const findOptions: any = this.getNodeParameter('findOptions', i, '{}', {
							ensureType: 'json',
						});

						const res = await collection.find(filter, { ...findOptions, session }).toArray();

						return res;
					}

					case 'findOne': {
						const filter: any = this.getNodeParameter('filter', i, '{}', { ensureType: 'json' });
						const findOneOptions: any = this.getNodeParameter('findOneOptions', i, '{}', {
							ensureType: 'json',
						});

						const res = await collection.findOne(filter, { ...findOneOptions, session });

						return res;
					}

					case 'findOneAndUpdate': {
						const filter: any = this.getNodeParameter('filter', i, '{}', { ensureType: 'json' });
						const update: any = this.getNodeParameter('update', i, '{}', { ensureType: 'json' });
						const findOneAndUpdateOptions: any = this.getNodeParameter(
							'findOneAndUpdateOptions',
							i,
							'{}',
							{
								ensureType: 'json',
							},
						);

						const res = await collection.findOneAndUpdate(filter, update, {
							...findOneAndUpdateOptions,
							session,
						});

						return res;
					}

					case 'aggregate': {
						const pipeline: any = this.getNodeParameter('pipeline', i, '[]', {
							ensureType: 'json',
						});

						const res = await collection.aggregate(pipeline, {
							session,
						});

						return res;
					}

					case 'updateOne': {
						const filter: any = this.getNodeParameter('filter', i, '{}', { ensureType: 'json' });
						const update: any = this.getNodeParameter('update', i, '{}', { ensureType: 'json' });
						const updateOptions: any = this.getNodeParameter('updateOptions', i, '{}', {
							ensureType: 'json',
						});

						const res = await collection.updateOne(filter, update, {
							...updateOptions,
							session,
						});

						return res;
					}

					case 'updateMany': {
						const filter: any = this.getNodeParameter('filter', i, '{}', { ensureType: 'json' });
						const update: any = this.getNodeParameter('update', i, '{}', { ensureType: 'json' });
						const updateOptions: any = this.getNodeParameter('updateOptions', i, '{}', {
							ensureType: 'json',
						});

						const res = await collection.updateMany(filter, update, {
							...updateOptions,
							session,
						});

						return res;
					}

					case 'replaceOne': {
						const filter: any = this.getNodeParameter('filter', i, '{}', { ensureType: 'json' });
						const update: any = this.getNodeParameter('update', i, '{}', { ensureType: 'json' });

						const res = await collection.replaceOne(filter, update, {
							session,
						});

						return res;
					}

					case 'deleteOne': {
						const filter: any = this.getNodeParameter('filter', i, '{}', { ensureType: 'json' });

						const res = await collection.deleteOne(filter, {
							session,
						});

						return res;
					}

					case 'deleteMany': {
						const filter: any = this.getNodeParameter('filter', i, '{}', { ensureType: 'json' });

						const res = await collection.deleteMany(filter, {
							session,
						});

						return res;
					}

					case 'countDocuments': {
						const filter: any = this.getNodeParameter('filter', i, '{}', { ensureType: 'json' });

						const res = await collection.countDocuments(filter, {
							session,
						});

						return res;
					}

					case 'estimatedDocumentCount': {
						const res = await collection.estimatedDocumentCount({
							session,
						});

						return res;
					}

					case 'distinct': {
						const field: any = this.getNodeParameter('field', i, '', {
							ensureType: 'string',
						}) as string;
						const filter: any = this.getNodeParameter('filter', i, '{}', { ensureType: 'json' });

						const res = await collection.distinct(field, filter, {
							session,
						});

						return res;
					}

					case 'bulkWrite': {
						const operations: any = this.getNodeParameter('operations', i, '[]', {
							ensureType: 'json',
						});

						const res = await collection.bulkWrite(operations, {
							session,
						});

						return res;
					}
				}

				return false;
			});

			const results = await Promise.allSettled(tasks);

			return results;
		};

		const results = await (runInTransaction
			? client.withSession((session) => session.withTransaction(() => action(session)))
			: action());

		items.forEach((x, i) => {
			const res = results[i];
			if (res.status === 'fulfilled') {
				x.json = {
					...x.json,
					result: res.value,
				};
			}

			if (res.status === 'rejected') {
				if (this.continueOnFail()) {
					x.error = new NodeOperationError(this.getNode(), res.reason);
				} else {
					throw new NodeOperationError(this.getNode(), res.reason);
				}
			}
		});

		return [items];
	}

	methods = {
		credentialTest: {
			async mongoDbCredentialTest(
				this: ICredentialTestFunctions,
				credential: ICredentialsDecrypted,
			): Promise<INodeCredentialTestResult> {
				try {
					const { connectionString } = validateAndResolveMongoCredentials(credential.data);

					await connectMongoClient(connectionString);
				} catch (error) {
					return {
						status: 'Error',
						message: (error as Error).message,
					};
				}
				return {
					status: 'OK',
					message: 'Connection successful!',
				};
			},
		},
	};
}
