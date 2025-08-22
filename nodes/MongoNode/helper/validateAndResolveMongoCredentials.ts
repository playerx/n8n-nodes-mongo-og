import {
	ICredentialDataDecryptedObject,
	IExecuteFunctions,
	NodeOperationError,
} from 'n8n-workflow';

export function validateAndResolveMongoCredentials(
	self: IExecuteFunctions,
	credentials?: ICredentialDataDecryptedObject,
): IMongoCredentials {
	if (credentials === undefined) {
		throw new NodeOperationError(self.getNode(), 'No credentials got returned!');
	} else {
		return buildMongoConnectionParams(self, credentials as unknown as IMongoCredentialsType);
	}
}

function buildMongoConnectionParams(
	self: IExecuteFunctions,
	credentials: IMongoCredentialsType,
): IMongoCredentials {
	const sanitizedDbName =
		credentials.database && credentials.database.trim().length > 0
			? credentials.database.trim()
			: '';
	if (credentials.configurationType === 'connectionString') {
		if (credentials.connectionString && credentials.connectionString.trim().length > 0) {
			return {
				connectionString: credentials.connectionString.trim(),
				database: sanitizedDbName,
			};
		} else {
			throw new NodeOperationError(
				self.getNode(),
				'Cannot override credentials: valid MongoDB connection string not provided ',
			);
		}
	} else {
		return {
			connectionString: buildParameterizedConnString(credentials),
			database: sanitizedDbName,
		};
	}
}

function buildParameterizedConnString(credentials: IMongoParametricCredentials): string {
	if (credentials.port) {
		return `mongodb://${credentials.user}:${credentials.password}@${credentials.host}:${credentials.port}`;
	} else {
		return `mongodb+srv://${credentials.user}:${credentials.password}@${credentials.host}`;
	}
}

type IMongoCredentials = {
	database: string;
	connectionString: string;
};

interface IMongoParametricCredentials {
	configurationType: 'values';

	host: string;
	database: string;
	user: string;
	password: string;
	port?: number;
}

interface IMongoOverrideCredentials {
	configurationType: 'connectionString';
	connectionString: string;
	database: string;
}

type IMongoCredentialsType = IMongoParametricCredentials | IMongoOverrideCredentials;
