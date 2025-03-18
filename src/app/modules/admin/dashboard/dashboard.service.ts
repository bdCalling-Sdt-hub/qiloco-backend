import { StatusCodes } from 'http-status-codes';
import { Order } from '../../order/order.model';
import { User } from '../../user/user.model';
import AppError from '../../../../errors/AppError';
import QueryBuilder from '../../../builder/QueryBuilder';

const getTotalUser = async () => {
  const totalShops = await User.countDocuments();
  return totalShops;
};

// total admin revenue
const totalRevenue = async (): Promise<number> => {
  const result = await Order.aggregate([
    {
      $match: { paymentStatus: 'paid' },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: { $multiply: ['$totalPrice', 0.1] } },
      },
    },
  ]);

  return result.length > 0 ? result[0].totalRevenue : 0;
};
// Get Total Revenue Chart Data for monthly

const productOverview = async (year: number) => {
  const startDate = new Date(`${year}-01-01T00:00:00Z`);
  const endDate = new Date(`${year + 1}-01-01T00:00:00Z`);

  // Aggregate revenue data for the year
  const revenueChart = await Order.aggregate([
    {
      $match: {
        paymentStatus: 'paid',
        createdAt: { $gte: startDate, $lt: endDate },
      },
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        totalRevenue: { $sum: '$totalPrice' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Months of the year
  const monthsOfYear = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  let previousMonthRevenue = 0;
  let firstNonZeroMonthRevenue = 0;
  let lastNonZeroMonthRevenue = 0;
  let totalRevenueForYear = 0;
  let isFirstNonZeroMonth = true;
  let totalGrowth = 0; // To store total growth for the year

  const formattedRevenueChart = monthsOfYear.map((month, index) => {
    const monthData = revenueChart.find((item) => item._id === index + 1);
    const totalRevenue = monthData ? monthData.totalRevenue : 0;

    let growth = 0;

    // Calculate monthly growth if previous month has revenue
    if (previousMonthRevenue > 0 && totalRevenue > 0) {
      growth =
        ((totalRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;
    }

    // If the previous month had zero revenue, set growth to 100%
    if (previousMonthRevenue === 0 && totalRevenue > 0) {
      growth = 100; // Growth is 100% for the first month with non-zero revenue
    }

    // Track the first non-zero month revenue
    if (totalRevenue > 0 && isFirstNonZeroMonth) {
      firstNonZeroMonthRevenue = totalRevenue;
      isFirstNonZeroMonth = false;
    }

    // Track the last non-zero month revenue
    if (totalRevenue > 0) {
      lastNonZeroMonthRevenue = totalRevenue;
    }

    // Calculate total revenue for the entire year
    totalRevenueForYear += totalRevenue;

    // Update previous month's revenue for the next iteration
    previousMonthRevenue = totalRevenue;

    return {
      month,
      totalRevenue,
    };
  });

  if (firstNonZeroMonthRevenue > 0 && lastNonZeroMonthRevenue > 0) {
    totalGrowth =
      ((lastNonZeroMonthRevenue - firstNonZeroMonthRevenue) /
        firstNonZeroMonthRevenue) *
      100;
  }

  return {
    formattedRevenueChart,
    totalGrowth: totalGrowth.toFixed(2), // Total growth percentage for the year
    year: year,
  };
};

const earningOverviewChart = async (year: number) => {
  const startDate = new Date(`${year}-01-01T00:00:00Z`);
  const endDate = new Date(`${year + 1}-01-01T00:00:00Z`);

  // Aggregate the earnings data for the given year (monthly earnings)
  const earningsData = await Order.aggregate([
    {
      $match: {
        paymentStatus: 'paid',
        createdAt: {
          $gte: startDate,
          $lt: endDate,
        },
      },
    },
    {
      $project: {
        month: { $month: '$createdAt' },
        totalPrice: 1,
      },
    },
    {
      $group: {
        _id: '$month',
        totalEarnings: { $sum: { $multiply: ['$totalPrice', 0.1] } },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);
  // Map the months to their names
  const monthsOfYear = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const monthlyEarnings = monthsOfYear.map((month, index) => {
    const monthData = earningsData.find((item) => item._id === index + 1);
    return {
      month: month,
      earnings: monthData ? monthData.totalEarnings : 0,
    };
  });
  let firstMonthEarnings = 0;
  let lastMonthEarnings = 0;

  if (earningsData.length > 0) {
    firstMonthEarnings = earningsData[0].totalEarnings;
    lastMonthEarnings = earningsData[earningsData.length - 1].totalEarnings;
  }

  let yearlyGrowth = 0;

  if (firstMonthEarnings > 0) {
    yearlyGrowth =
      ((lastMonthEarnings - firstMonthEarnings) / firstMonthEarnings) * 100;
  }
  return { monthlyEarnings, yearlyGrowth };
};

const resentSellingProduct = async (query: Record<string, unknown>) => {
  const queryBuilder = new QueryBuilder(
    Order.find({ paymentStatus: 'paid' }),
    query,
  );

  queryBuilder.filter().sort().paginate();

  query.fields = 'serial,productName,email,createdAt,totalPrice';
  queryBuilder.fields();
  const earning = await queryBuilder.modelQuery.lean().exec();
  const pagination = await queryBuilder.countTotal();

  return {
    earnings: earning,
    pagination: pagination,
  };
};
const getSingleResentProduct = async (id: string) => {
  const order = await Order.findById(id).select(
    'serial productName email createdAt totalPrice',
  );
  if (!order)
    throw new AppError(
      StatusCodes.NOT_FOUND,
      'No recent selling product found',
    );
  return order;
};

export const AdminDashboardService = {
  getTotalUser,
  totalRevenue,
  productOverview,
  earningOverviewChart,
  resentSellingProduct,
  getSingleResentProduct,
};
