const stripePackage = require('stripe');
const https = require('https');
const { queryUserByEmail } = require('./dynamoQueries');
const isStripeTesting = process.env.IS_STRIPE_TESTING === 'true';

const API_KEY = isStripeTesting ? process.env.STRIPE_API_KEY_TEST : process.env.STRIPE_API_KEY;
const ENDPOINT_SECRET = isStripeTesting ? process.env.ENDPOINT_SECRET_TEST : process.env.ENDPOINT_SECRET;

const stripe = stripePackage(API_KEY);

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
    stripeEvent = stripe.webhooks.constructEvent(body, sig, ENDPOINT_SECRET);
  } catch (err) {
    console.log(`Webhook Error: ${err.message}`);
    return {
      statusCode: 400,
      body: `Webhook Error: ${err.message}`,
    };
  }

  switch (stripeEvent.type) {
    // Update the User's attributes with Referral Code and Email in RevenueCat
    case 'checkout.session.completed':
      const checkoutSessionCreated = stripeEvent.data.object;
      console.log('CHECKOUT COMPLETED', checkoutSessionCreated);

      const referredBy = checkoutSessionCreated.client_reference_id;
      const stripeCustomerEmail = checkoutSessionCreated.customer_details.email;

      let checkoutId = null;
      try {
        const checkoutUsers = await queryUserByEmail(stripeCustomerEmail);
        console.log("USERS FOUND: ", checkoutUsers);
        checkoutId = checkoutUsers[0].id;
      } catch (error) {
        console.error("Error querying by user email:", error);
        return {
          statusCode: 500,
          body: `Request failed: ${error.message}`,
        };
      }

      const checkoutData = JSON.stringify({
        app_user_id: checkoutId,
        attributes: {
          "Referred-By": { value: referredBy, updated_at_ms: Date.now() },
          "Stripe-Email": { value: stripeCustomerEmail, updated_at_ms: Date.now() },
        }
      });

      const checkoutOptions = {
        hostname: 'api.revenuecat.com',
        path: `/v1/subscribers/${checkoutId}/attributes`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Platform': 'stripe',
          'Authorization': `Bearer ${process.env.RC_STRIPE_PUBLIC_API_KEY}`
        },
      };

      try {
        await sendRequest(checkoutOptions, checkoutData);
      } catch (error) {
        console.error("Request failed:", error);
        return {
          statusCode: 500,
          body: `Request failed: ${error.message}`,
        };
      }


      break;

    // Create a User Purchase in RevenueCat
    case 'customer.subscription.created':
      const customerSubscriptionCreated = stripeEvent.data.object;
      console.log('SUBSCRIPTION CREATED', customerSubscriptionCreated);

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
