import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import router from './routes';
import { Morgan } from './shared/morgen';
import globalErrorHandler from './globalErrorHandler/globalErrorHandler';
import { notFound } from './app/middleware/notFound';
import { welcome } from './utils/welcome';
import handleStripeWebhook from './helpers/handleStripeWebhook';

const app: Application = express();

//morgan
app.use(Morgan.successHandler);
app.use(Morgan.errorHandler);
//router
app.post(
  '/api/v1/stripe/webhook',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook,
);
//body parser
app.use(
  cors({
    origin: '*',
    credentials: false,
  }),
);
// app.use(
//   cors({
//     origin: ['http://10.0.60.210:3003', 'http://10.0.60.210:3004'],
//     credentials: false,
//   }),
// );
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//file retrieve
app.use(express.static('uploads'));
app.use(express.static('public'));

app.use('/api/v1', router);
//live response
app.get('/', (req: Request, res: Response) => {
  res.send(welcome());
});

//global error handle
app.use(globalErrorHandler);

//handle not found route;
app.use(notFound);

export default app;
