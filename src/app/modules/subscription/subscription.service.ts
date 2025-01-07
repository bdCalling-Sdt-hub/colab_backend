import httpStatus from "http-status";
import AppError from "../../error/appError";
import { ENUM_PAYMENT_PURPOSE } from "../../utilities/enum";
import NormalUser from "../normalUser/normalUser.model";
import Stripe from 'stripe';
import config from "../../config";
const stripe = new Stripe(config.stripe.stripe_secret_key as string);
const purchaseSubscription = async(profileId:string)=>{
    const normalUser = await NormalUser.findById(profileId);
    if(!normalUser){
        throw new AppError(httpStatus.NOT_FOUND,"User not found")
    }
    const paymentIntent = await stripe.paymentIntents.create({
        amount: 2000, 
        currency: 'usd',
        payment_method_types: ['card'],
        metadata: {
          paymentPurpose: ENUM_PAYMENT_PURPOSE.PURCHASE_SUBSCRIPTION,
          customerName: normalUser.name,
          email: normalUser.email,
          userId:profileId
        }
      });

      return {
        client_secret:paymentIntent.client_secret
      };
}


const SubscriptionService = {
    purchaseSubscription
}


export default SubscriptionService;