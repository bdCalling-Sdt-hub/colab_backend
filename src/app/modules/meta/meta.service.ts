import { ENUM_TRANSACTION_TYPE } from '../../utilities/enum';
import Category from '../category/category.model';
import NormalUser from '../normalUser/normalUser.model';
import Transaction from '../transaction/transaction.model';

const getDashboardMetaData = async () => {
  const totalUser = await NormalUser.countDocuments();
  const totalCategory = await Category.countDocuments();
  const totalSubscriber = await NormalUser.countDocuments({ isPremium: true });
  const total = await Transaction.aggregate([
    {
      $project: {
        adjustedAmount: {
          $cond: {
            if: {
              $or: [
                { $eq: ['$type', ENUM_TRANSACTION_TYPE.PURCHASE_SUBSCRIPTION] },
                { $eq: ['$type', ENUM_TRANSACTION_TYPE.RENEW_SUBSCRIPTION] },
              ],
            },
            then: '$amount', // Full amount for subscriptions
            else: {
              $cond: {
                if: { $eq: ['$type', ENUM_TRANSACTION_TYPE.COLLABORATION] },
                then: { $multiply: ['$amount', 0.07] }, // 7% for collaborations
                else: 0, // Ignore other transaction types
              },
            },
          },
        },
      },
    },
    {
      $group: {
        _id: null,
        totalEarning: { $sum: '$adjustedAmount' },
      },
    },
  ]);

  const totalEarning = total.length > 0 ? total[0].totalEarning : 0;

  return { totalUser, totalSubscriber, totalEarning, totalCategory };
};

const getUserChartData = async (year: number) => {
  const startOfYear = new Date(year, 0, 1);

  const endOfYear = new Date(year + 1, 0, 1);

  const chartData = await NormalUser.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startOfYear,
          $lt: endOfYear,
        },
      },
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        totalUser: { $sum: 1 },
      },
    },
    {
      $project: {
        month: '$_id',
        totalUser: 1,
        _id: 0,
      },
    },
    {
      $sort: { month: 1 },
    },
  ]);

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const data = Array.from({ length: 12 }, (_, index) => ({
    month: months[index],
    totalUser:
      chartData.find((item) => item.month === index + 1)?.totalUser || 0,
  }));

  return data;
};

const getSubscriptionChartData = async (year: number) => {
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year + 1, 0, 1);

  const chartData = await Transaction.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startOfYear,
          $lt: endOfYear,
        },
        type: {
          $in: ['Purchase Subcription', 'Review Subscription'],
        },
      },
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        totalSubscriber: { $sum: 1 },
      },
    },
    {
      $project: {
        month: '$_id',
        totalSubscriber: 1,
        _id: 0,
      },
    },
    {
      $sort: {
        month: 1,
      },
    },
  ]);

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const data = Array.from({ length: 12 }, (_, index) => ({
    month: months[index],
    totalSubscriber:
      chartData.find((item) => item.month === index + 1)?.totalSubscriber || 0,
  }));

  return data;
};

const MetaService = {
  getDashboardMetaData,
  getUserChartData,
  getSubscriptionChartData,
};

export default MetaService;
