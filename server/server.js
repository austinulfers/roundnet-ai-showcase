// Run the server on http://localhost:4242
// Terminal 1: node server/server.js
// Terminal 2: stripe listen --forward-to localhost:4242/webhook
// Terminal 3: npm install https

const STRIPE_API_KEY_TESTING = "API_Testing_Key" // Update with your actual Stripe API key
const stripe = require('stripe')(STRIPE_API_KEY_TESTING);
const express = require('express');
const app = express();
const https = require('https');
const endpointSecret = "Secret"; // Update with your actual Stripe webhook secret

app.post('/webhook', express.raw({ type: 'application/json' }), (request, response) => {
  console.log("WEBHOOK RECEIVED");
  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const checkoutSessionCompleted = event.data.object;
      console.log("CHECKOUT COMPLETED")
      break;


    case 'customer.subscription.created':
      console.log("SUBSCRIPTION CREATED")
      const customerSubscriptionCreated = event.data.object;
      console.log(customerSubscriptionCreated);

      const subscriptionId = customerSubscriptionCreated.id;
      console.log("subscriptionId: ", subscriptionId)

      const data = JSON.stringify({
        app_user_id: "app9a8780ecd1", // Replace with the user's actual ID (see this in the lambda function)
        fetch_token: subscriptionId
      });

      const options = {
        hostname: 'api.revenuecat.com',
        path: '/v1/receipts',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Platform': 'stripe',
          'Authorization': 'Bearer XXXXXXXXXX' // Replace with your actual RevenueCat-Stripe Public API key
        }
      };

      const req = https.request(options, (res) => {
        console.log(`statusCode: ${res.statusCode}`);

        res.on('data', (d) => {
          process.stdout.write(d);
        });
      });

      req.on('error', (error) => {
        console.error(error);
      });

      req.write(data);
      req.end();

      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  response.send();
});

app.listen(4242, () => console.log('Running on port 4242'));