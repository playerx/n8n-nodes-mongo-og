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
		properties: [
			{
				displayName: 'Collection',
				name: 'collection',
				type: 'string',
				required: true,
				default: '',
			},
			{
				displayName: 'Operation',
				name: 'op',
				type: 'options',
				required: true,
				options: [
					// create
					{ name: 'insertOne', value: 'insertOne' },
					{ name: 'insertMany', value: 'insertMany' },

					// read
					{ name: 'find', value: 'find' },
					{ name: 'findOne', value: 'findOne' },
					{ name: 'findOneAndUpdate', value: 'findOneAndUpdate' },
					{ name: 'aggregate', value: 'aggregate' },

					// update
					{ name: 'updateOne', value: 'updateOne' },
					{ name: 'updateMany', value: 'updateMany' },
					{ name: 'replaceOne', value: 'replaceOne' },

					// delete
					{ name: 'deleteOne', value: 'deleteOne' },
					{ name: 'deleteMany', value: 'deleteMany' },

					// other
					{ name: 'countDocuments', value: 'countDocuments' },
					{ name: 'estimatedDocumentCount', value: 'estimatedDocumentCount' },
					{ name: 'distinct', value: 'distinct' },
					{ name: 'bulkWrite', value: 'bulkWrite' },
				],
				default: 'find',
				description: 'If not set per item via `item.JSON.op`, this will be used',
			},

			{
				displayName: 'Field Name',
				name: 'field',
				type: 'string',
				placeholder: '',
				default: '',
				displayOptions: {
					show: {
						op: ['distinct'],
					},
				},
			},

			{
				displayName: 'Filter',
				name: 'filter',
				type: 'json',
				placeholder: '{ _id: ..., status: "..." }',
				default: '{}',
				displayOptions: {
					show: {
						op: [
							'updateOne',
							'updateMany',
							'replaceOne',
							'deleteOne',
							'deleteMany',
							'find',
							'findOne',
							'countDocuments',
							'distinct',
						],
					},
				},
			},

			{
				displayName: 'Pipeline',
				name: 'pipeline',
				type: 'json',
				placeholder: '[{ ... }, { ... }]',
				default: '[{ }]',
				displayOptions: {
					show: {
						op: ['aggregate'],
					},
				},
			},

			{
				displayName: 'Document',
				name: 'doc',
				type: 'json',
				placeholder: 'document',
				default: '{}',
				displayOptions: {
					show: {
						op: ['insertOne'],
					},
				},
			},

			{
				displayName: 'Documents',
				name: 'docs',
				type: 'json',
				placeholder: 'documents',
				default: '[{}]',
				displayOptions: {
					show: {
						op: ['insertMany'],
					},
				},
			},

			{
				displayName: 'Update',
				name: 'update',
				type: 'json',
				placeholder: 'update',
				default: '{ $set: {} }',
				displayOptions: {
					show: {
						op: ['updateOne', 'updateMany', 'findOneAndUpdate'],
					},
				},
			},

			{
				displayName: 'Replacement',
				name: 'replacement',
				type: 'json',
				placeholder: 'replacement',
				default: '{}',
				displayOptions: {
					show: {
						op: ['replaceOne'],
					},
				},
			},

			{
				displayName: 'Operations',
				name: 'operations',
				type: 'json',
				placeholder: 'operations',
				default: '[{}]',
				displayOptions: {
					show: {
						op: ['bulkWrite'],
					},
				},
			},

			{
				displayName: 'Options',
				name: 'findOneOptions',
				type: 'collection',
				default: {},
				displayOptions: {
					show: {
						op: ['findOne'],
					},
				},
				options: [
					{
						displayName: 'Projection',
						name: 'projection',
						type: 'json',
						default: '{ _id: 0 }',
					},
					{
						displayName: 'Sort',
						name: 'sort',
						type: 'json',
						default: '{ _id: -1 }',
					},
					{
						displayName: 'Hint',
						hint: 'Force Index',
						name: 'hint',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Collation',
						name: 'collation',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Batch Size',
						name: 'batchSize',
						hint: 'Number of docs per batch',
						type: 'number',
						default: 50,
					},
				],
			},

			{
				displayName: 'Options',
				name: 'findOptions',
				type: 'collection',
				default: {},
				displayOptions: {
					show: {
						op: ['find'],
					},
				},
				options: [
					{
						displayName: 'Projection',
						name: 'projection',
						type: 'json',
						default: '{ _id: 0 }',
					},
					{
						displayName: 'Sort',
						name: 'sort',
						type: 'json',
						default: '{ _id: -1 }',
					},
					{
						displayName: 'Skip',
						name: 'skip',
						type: 'number',
						default: 0,
					},
					{
						displayName: 'Limit',
						name: 'limit',
						type: 'number',
						typeOptions: {
							minValue: 1,
						},
						description: 'Max number of results to return',
						default: 50,
					},
					{
						displayName: 'Hint',
						hint: 'Force Index',
						name: 'hint',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Collation',
						name: 'collation',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Batch Size',
						name: 'batchSize',
						hint: 'Number of docs per batch',
						type: 'number',
						default: 50,
					},
				],
			},

			{
				displayName: 'Options',
				name: 'updateOptions',
				type: 'collection',
				default: {},
				displayOptions: {
					show: {
						op: ['updateOne', 'updateMany'],
					},
				},
				options: [
					{
						displayName: 'Projection',
						name: 'projection',
						type: 'json',
						default: '{ _id: 0 }',
					},
					{
						displayName: 'Sort',
						name: 'sort',
						type: 'json',
						default: '{ _id: -1 }',
					},
					{
						displayName: 'ArrayFilters',
						name: 'arrayFilters',
						type: 'number',
						default: 0,
					},
					{
						displayName: 'Hint',
						hint: 'Force Index',
						name: 'hint',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Upsert',
						name: 'upsert',
						type: 'boolean',
						default: false,
					},
				],
			},

			{
				displayName: 'Options',
				name: 'findOneAndUpdateOptions',
				type: 'collection',
				default: {},
				displayOptions: {
					show: {
						op: ['findOneAndUpdate'],
					},
				},
				options: [
					{
						displayName: 'Projection',
						name: 'projection',
						type: 'json',
						default: '{ _id: 0 }',
					},
					{
						displayName: 'Sort',
						name: 'sort',
						type: 'json',
						default: '{ _id: -1 }',
					},
					{
						displayName: 'ArrayFilters',
						name: 'arrayFilters',
						type: 'number',
						default: 0,
					},
					{
						displayName: 'ReturnDocument',
						name: 'returnDocument',
						type: 'options',
						options: [
							{ name: 'Before', value: 'before' },
							{ name: 'After', value: 'after' },
						],
						default: 'after',
					},
					{
						displayName: 'Hint',
						hint: 'Force Index',
						name: 'hint',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Upsert',
						name: 'upsert',
						type: 'boolean',
						default: false,
					},
				],
			},

			// {
			// 	displayName: 'Advanced',
			// 	name: 'advancedOptions',
			// 	type: 'collection',
			// 	default: {},
			// 	options: [
			// 		{
			// 			displayName: 'Run in Single Transaction',
			// 			name: 'runInTransaction',
			// 			hint: 'Can be used only with replica-set',
			// 			type: 'boolean',
			// 			default: false,
			// 		},
			// 	],
			// },
		],
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
