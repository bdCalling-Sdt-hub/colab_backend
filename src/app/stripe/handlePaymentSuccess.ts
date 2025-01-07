/* eslint-disable no-console */
import { ENUM_PAYMENT_PURPOSE } from '../utilities/enum';

const handlePaymentSuccess = async (userId: string, paymentPurpose: string) => {
  if (paymentPurpose == ENUM_PAYMENT_PURPOSE.PURCHASE_SUBSCRIPTION) {
    await handleSubcriptionPurchaseSuccess(userId);
  } else if (paymentPurpose == ENUM_PAYMENT_PURPOSE.RENEW_SUBSCRIPTION) {
    await handleSubscriptionRenewSuccess(userId);
  } else if (paymentPurpose == ENUM_PAYMENT_PURPOSE.COLLABRATE_PAYMENT) {
    await handleCollabratePaymentSuccess(userId);
  }
};

const handleSubcriptionPurchaseSuccess = async (userId: string) => {
  console.log(userId);
};

const handleSubscriptionRenewSuccess = async (userid: string) => {
  console.log(userid);
};

const handleCollabratePaymentSuccess = async (userId: string) => {
  console.log(userId);
};

export default handlePaymentSuccess;
