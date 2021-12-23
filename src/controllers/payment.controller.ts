// This is your test secret API key.
import Stripe from 'stripe';
import { Request, Response } from 'express';
// Replace this endpoint secret with your endpoint's unique secret
// If you are testing with the CLI, find the secret by running 'stripe listen'
// If you are using an endpoint defined with the API or dashboard, look in your webhook settings
// at https://dashboard.stripe.com/webhooks
const endpointSecret = process.env.STRIPE_SECRET;

const handlePayments = async (req: Request, res: Response): Promise<void> => {
    const stripePayment = new Stripe(process.env.STRIPE_API_KEY, {
        apiVersion: '2020-08-27',
    });

    let eventObject: Record<string, any>;

    // Only verify the event if you have an endpoint secret defined.
    // Otherwise use the basic event deserialized with JSON.parse
    if (endpointSecret) {
        // Get the signature sent by Stripe
        const signature = req.headers['stripe-signature'];
        try {
            eventObject = stripePayment.webhooks.constructEvent(
                req.body,
                signature,
                endpointSecret
            );
        } catch (err) {
            console.log(
                `⚠️  Webhook signature verification failed.`,
                err.message
            );
            res.status(400).send({});
        }
    }

    let stripeObj: Record<string, any>;
    // Handle the event
    switch (eventObject.type) {
        case 'payment_intent.succeeded':
            stripeObj = eventObject.data.object;
            console.log(
                `PaymentIntent for ${eventObject.amount} was successful!`
            );
            // Then define and call a method to handle the successful payment intent.
            // handlePaymentIntentSucceeded(paymentIntent);
            break;
        case 'payment_method.attached':
            stripeObj = eventObject.data.object;
            // Then define and call a method to handle the successful attachment of a PaymentMethod.
            // handlePaymentMethodAttached(paymentMethod);
            break;
        case 'customer.subscription.created':
            stripeObj = eventObject.data.object;
            // Then define and call a function to handle the event customer.subscription.created
            break;
        case 'customer.subscription.deleted':
            stripeObj = eventObject.data.object;
            // Then define and call a function to handle the event customer.subscription.deleted
            break;
        case 'customer.subscription.updated':
            stripeObj = eventObject.data.object;
            // Then define and call a function to handle the event customer.subscription.updated
            break;
        default:
            // Unexpected event type
            console.log(`Unhandled event type ${eventObject.type}.`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.status(200).send({});
};

export { handlePayments };
