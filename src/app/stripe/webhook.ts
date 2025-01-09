/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from 'stripe';
import config from '../config';
import { Request, Response } from 'express';
import handlePaymentSuccess from './handlePaymentSuccess';

const stripe = new Stripe(config.stripe.stripe_secret_key as string);
const handleWebhook = async (req: Request, res: Response) => {
  const endpointSecret =
    'whsec_f05875eb42dd8051fbc20bcdb538e22c499ecd114bde7eea65bb0602b1730562';
  const sig = req.headers['stripe-signature'];

  try {
    // Verify the event
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      endpointSecret,
    );

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { userId, paymentPurpose } = paymentIntent.metadata;

        console.log(
          `Payment successful for user ${userId}, subscription ${userId}`,
        );
        await handlePaymentSuccess(userId, paymentPurpose);
        // Update subscription status in your database
        // E.g., Activate the subscription for the user

        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { userId, subscriptionId } = paymentIntent.metadata;

        console.log(
          `Payment failed for user ${userId}, subscription ${subscriptionId}`,
        );

        // Notify the user about the failure
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).send('Success');
  } catch (err: any) {
    console.error('Webhook error:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

export default handleWebhook;
