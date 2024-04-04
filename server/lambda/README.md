# Lambda Function for Stripe-RevenueCat Integration

This repository contains the source code for the Lambda function designed to bridge the `subscribe.js` file's connectivity between Stripe and RevenueCat services. This function plays a crucial role in managing subscription events, ensuring seamless synchronization between Stripe's payment processing and RevenueCat's subscription management features.

## Updating the Lambda Function

To update the Lambda function within AWS:

1. Make the necessary changes to the code in this repository.
2. Compress the modified files into a ZIP file. Run this in this directory: `zip -r deploy.zip ./`
3. Log in to the AWS Management Console and navigate to the Lambda service.
4. Find the Lambda function, select it, and then choose "Upload from" under the Function code section.
5. Choose the ZIP file you prepared and upload it to update the function.
