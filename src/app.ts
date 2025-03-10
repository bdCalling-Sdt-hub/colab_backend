/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import router from './app/routes';
import notFound from './app/middlewares/notFound';
const app: Application = express();
import sendContactUsEmail from './app/helper/sendContactUsEmail';
import handleWebhook from './app/stripeManager/webhook';
import Category from './app/modules/category/category.model';
import Collaboration from './app/modules/collaboration/collaboration.model';
import handleConnectedAccountWebhook from './app/stripeManager/connectedAccountWebhook';
// web hook
app.post(
  '/colab-app/webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook,
);
app.post(
  '/connected-account/webhook',
  express.raw({ type: 'application/json' }),
  handleConnectedAccountWebhook,
);

// parser
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://10.0.60.137:3001',
      'http://10.0.60.137:3001',
      'http://143.110.241.146:4175',
    ],
    credentials: true,
  }),
);
app.use('/uploads', express.static('uploads'));
// application routers ----------------
app.use('/', router);
app.post('/contact-us', sendContactUsEmail);

app.get('/nice', async (req, res) => {
  res.send({ message: 'nice to meet you' });
});
// app.get('/all-categories', async (req, res) => {
//   const result = await Category.find();
//   res.send({ data: result });
// });

// global error handler
app.use(globalErrorHandler);
// not found
app.use(notFound);

export default app;
