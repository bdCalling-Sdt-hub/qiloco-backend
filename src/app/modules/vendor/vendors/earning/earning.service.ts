import QueryBuilder from '../../../../builder/QueryBuilder';
import { Order } from '../../../order/order.model';

const earnings = async (query: Record<string, unknown>) => {
  const queryBuilder = new QueryBuilder(
    Order.find({ paymentStatus: 'paid' }),
    query,
  );
  query.fields = 'orderNumber,email,createdAt,totalPrice';
  const orders = await queryBuilder
    .filter()
    .sort()
    .paginate()
    .fields()
    .modelQuery.exec();

  const earnings = orders.map((order) => {
    const earning = order.totalPrice * 0.9;
    const { totalPrice, ...orderData } = order.toObject();
    return {
      ...orderData,
      earning,
    };
  });
  const pagination = await queryBuilder.countTotal();

  return {
    earnings,
    pagination,
  };
};

const getEarningById = async (id: string) => {
  const order = await Order.findById(id).select(
    'ordernumber email createdAt totalPrice',
  );
  if (!order) {
    throw new Error('Order not found');
  }
  const earning = order.totalPrice * 0.9;
  const { totalPrice, ...orderData } = order.toObject();
  return {
    ...orderData,
    earning,
  };
};
export const EarningService = { earnings, getEarningById };
