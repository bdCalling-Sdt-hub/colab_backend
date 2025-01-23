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
      // case 'payment_intent.succeeded': {
      //   const paymentIntent = event.data.object as Stripe.PaymentIntent;
      //   console.log(paymentIntent.metadata);
      //   // const { userId, paymentPurpose } = paymentIntent.metadata;

      //   console.log(`Payment successful for user ${paymentIntent.metadata}}`);
      //   await handlePaymentSuccess(paymentIntent.metadata);
      //   // Update subscription status in your database
      //   // E.g., Activate the subscription for the user

      //   break;
      // }
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        console.log(session.metadata);
        // const { collaborationId, purpose } = session.metadata;
        // Access the payment_intent ID (transaction ID)
        const paymentIntentId = session.payment_intent;
        console.log(`Payment Intent (Transaction) ID: ${paymentIntentId}`);

        // Optionally, retrieve more details about the payment intent (e.g., amount, status)
        const paymentIntent = await stripe.paymentIntents.retrieve(
          paymentIntentId as string,
        );
        console.log('payment intent', paymentIntent); // You can access details like payment status, transaction amount, etc.

        console.log(`Checkout completed for session: ${session.id}`);
        await handlePaymentSuccess(
          session.metadata,
          paymentIntent.id,
          paymentIntent.amount / 100,
        );
        // Perform any post-payment actions, like updating your database
        // Example: Activate the collaboration or update the status

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
