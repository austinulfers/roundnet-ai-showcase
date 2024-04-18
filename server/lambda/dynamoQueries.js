const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const isStripeTesting = process.env.IS_STRIPE_TESTING === 'true';

const USER_TABLE = isStripeTesting ? process.env.DYNAMO_USER_TABLE_TEST : process.env.DYNAMO_USER_TABLE;

async function queryUserByEmail(email) {
  console.log("Querying by email:", email);
  const params = {
    TableName: USER_TABLE,
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
