const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function queryUserByEmail(email) {
	console.log("Querying by email:", email);
	const params = {
		TableName: process.env.DYNAMO_USER_TABLE,
		IndexName: 'usersByEmail',
		KeyConditionExpression: 'email = :email',
		ExpressionAttributeValues: { ':email': email }
	};


	try {
		const data = await dynamoDb.query(params).promise();
		return data.Items;
	} catch (error) {
		console.error("Error querying DynamoDB:", error);
		throw error;
	}
}

module.exports = { queryUserByEmail };
