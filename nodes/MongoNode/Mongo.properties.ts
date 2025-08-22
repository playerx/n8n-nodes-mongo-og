import { INodeProperties } from 'n8n-workflow';

export const mongoProperties: INodeProperties[] = [
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
		options: [
			// create
			{ name: 'insertOne', value: 'insertOne', action: 'insertOne' },
			{ name: 'insertMany', value: 'insertMany', action: 'insertMany' },

			// read
			{ name: 'find', value: 'find', action: 'find' },
			{ name: 'findOne', value: 'findOne', action: 'findOne' },
			{ name: 'findOneAndUpdate', value: 'findOneAndUpdate', action: 'findOneAndUpdate' },
			{ name: 'aggregate', value: 'aggregate', action: 'aggregate' },

			// update
			{ name: 'updateOne', value: 'updateOne', action: 'updateOne' },
			{ name: 'updateMany', value: 'updateMany', action: 'updateMany' },
			{ name: 'replaceOne', value: 'replaceOne', action: 'replaceOne' },

			// delete
			{ name: 'deleteOne', value: 'deleteOne', action: 'deleteOne' },
			{ name: 'deleteMany', value: 'deleteMany', action: 'deleteMany' },

			// other
			{ name: 'countDocuments', value: 'countDocuments', action: 'countDocuments' },
			{
				name: 'estimatedDocumentCount',
				value: 'estimatedDocumentCount',
				action: 'estimatedDocumentCount',
			},
			{ name: 'distinct', value: 'distinct', action: 'distinct' },
			{ name: 'bulkWrite', value: 'bulkWrite', action: 'bulkWrite' },
		],
		default: 'find',
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
		default: '{ "$set": {} }',
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
				default: '{ "_id": 0 }',
			},
			{
				displayName: 'Sort',
				name: 'sort',
				type: 'json',
				default: '{ "_id": -1 }',
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
				default: '{ "_id": 0 }',
			},
			{
				displayName: 'Sort',
				name: 'sort',
				type: 'json',
				default: '{ "_id": -1 }',
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
];
