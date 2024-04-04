const stripePackage = require('stripe');
const https = require('https');
const { queryUserByEmail } = require('./dynamoQueries');

const stripe = stripePackage(process.env.STRIPE_API_KEY_TEST);
const endpointSecret = process.env.ENDPOINT_SECRET_TEST;

// Wrap the HTTPS request in a Promise
const sendRequest = (options, data) => {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      console.log(`STATUSCODE: ${res.statusCode}`);
      let responseBody = '';
      res.on('data', (d) => {
        responseBody += d;
      });
      res.on('end', () => {
        console.log(`Response: ${responseBody}`);
        resolve(responseBody); // Resolve the promise when the response ends
      });
    });

    req.on('error', (error) => {
      console.error("ERROR:", error);
      reject(error); // Reject the promise on error
    });

    req.write(data);
    req.end();
  });
};

exports.handler = async (event) => {
  console.log('WEBHOOK RECEIVED', event);
  const sig = event.headers['Stripe-Signature'] || event.headers['stripe-signature'];
  const body = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString() : event.body;

  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.log(`Webhook Error: ${err.message}`);
    return {
      statusCode: 400,
      body: `Webhook Error: ${err.message}`,
    };
  }

  // Handle the event
  switch (stripeEvent.type) {
    case 'checkout.session.completed':
      console.log('CHECKOUT COMPLETED');
      // Logic for handling checkout session completed
      break;

    case 'customer.subscription.created':
      const customerSubscriptionCreated = stripeEvent.data.object;
      console.log('SUBSCRIPTION CREATED', customerSubscriptionCreated);

      // Get the Customer Email and fetch the User ID from DynamoDB
      const customerId = customerSubscriptionCreated.customer;
      const customer = await stripe.customers.retrieve(customerId);
      const customerEmail = customer.email;
      console.log("Customer Email:", customerEmail);

      let userId = null;

      try {
        const users = await queryUserByEmail(customerEmail);
        console.log("USERS FOUND: ", users);
        userId = users[0].id;
      } catch (error) {
        console.error("Error querying by user email:", error);
        return {
          statusCode: 500,
          body: `Request failed: ${error.message}`,
        };
      }

      const data = JSON.stringify({
        app_user_id: userId,
        fetch_token: customerSubscriptionCreated.id,
      });

      const options = {
        hostname: 'api.revenuecat.com',
        path: '/v1/receipts',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Platform': 'stripe',
          'Authorization': `Bearer ${process.env.RC_STRIPE_PUBLIC_API_KEY}`
        },
      };

      try {
        await sendRequest(options, data);
      } catch (error) {
        console.error("Request failed:", error);
        return {
          statusCode: 500,
          body: `Request failed: ${error.message}`,
        };
      }
      break;
    default:
      console.log(`Unhandled event type ${stripeEvent.type}`);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ received: true }),
  };
};
