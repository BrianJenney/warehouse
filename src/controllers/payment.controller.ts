// This is your test secret API key.
import Stripe from 'stripe';
import { Request, Response } from 'express';
import { handleErrorResponse, handleSuccessResponse } from '../apiHelpers';
import { PspxSpaceModel } from '../models/pspxSpace';
// Replace this endpoint secret with your endpoint's unique secret
// If you are testing with the CLI, find the secret by running 'stripe listen'
// If you are using an endpoint defined with the API or dashboard, look in your webhook settings
// at https://dashboard.stripe.com/webhooks
import { config } from 'dotenv';
config();

const endpointSecret = process.env.STRIPE_SECRET;
const stripePayment = new Stripe(process.env.STRIPE_API_KEY, {
    apiVersion: '2020-08-27',
});

const _addSubscriptionToSpace = async (
    spaceId: string,
    billingId: string,
    hasSubscription?: boolean | true
): Promise<void> => {
    await PspxSpaceModel.findOneAndUpdate(
        { spaceId },
        {
            billingId,
            hasSubscription,
        }
    );
};

const createCheckOutSession = async (
    req: Request,
    res: Response
): Promise<void> => {
    const isProd: boolean = process.env.NODE_ENV === 'production';
    const callBackUrl: string = isProd
        ? 'https://pspxapp.com/account'
        : 'http://localhost:3000/account';
    try {
        const { priceId, userId, spaceId } = req.body;

        const session = await stripePayment.checkout.sessions.create({
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            subscription_data: {
                metadata: {
                    userId,
                    spaceId,
                },
            },
            mode: 'subscription',
            success_url: callBackUrl,
            cancel_url: callBackUrl,
        });

        handleSuccessResponse(res, { sessionUrl: session.url });
    } catch (e) {
        handleErrorResponse(e, res);
    }
};

const handlePayments = async (req: Request, res: Response): Promise<void> => {
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
            handleErrorResponse(err, res);
        }
    }

    let stripeObj: Record<string, any>;

    if (!eventObject) {
        handleErrorResponse({}, res);
    }
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
            await _addSubscriptionToSpace(
                stripeObj.metadata.spaceId,
                stripeObj.id,
                true
            );
            // Then define and call a function to handle the event customer.subscription.created
            break;
        case 'customer.subscription.deleted':
            stripeObj = eventObject.data.object;
            // Then define and call a function to handle the event customer.subscription.deleted
            break;
        case 'customer.subscription.updated':
            stripeObj = eventObject.data.object;
            // Then define and call a function to handle the event customer.subscription.updated
            await _addSubscriptionToSpace(
                stripeObj.metadata.spaceId,
                stripeObj.id,
                true
            );
            break;
        default:
            // Unexpected event type
            console.log(`Unhandled event type ${eventObject.type}.`);
    }

    // Return a 200 response to acknowledge receipt of the event
    handleSuccessResponse(res, {});
};

export { handlePayments, createCheckOutSession };
