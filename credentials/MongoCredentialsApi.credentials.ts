import { Icon, ICredentialType, INodeProperties } from 'n8n-workflow';

export class MongoCredentialsApi implements ICredentialType {
	name = 'mongoDbOg';
	displayName = 'MongoDB';
	documentationUrl = 'https://docs.mongodb.com/';
	icon = 'file:mongo.svg' as Icon;

	properties: INodeProperties[] = [
		{
			displayName: 'Connection String',
			name: 'connectionString',
			type: 'string',
			typeOptions: {},
			default: 'mongodb://localhost:27017',
			placeholder: 'mongodb://username:password@host:port/database',
			required: true,
		},
	];
}
