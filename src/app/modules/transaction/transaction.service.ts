import QueryBuilder from '../../builder/QueryBuilder';
import Transaction from './transaction.model';

const getAllTransaction = async (query: Record<string, unknown>) => {
  const transactionQuery = new QueryBuilder(Transaction.find(), query)
    .search(['incidentType'])
    .fields()
    .filter()
    .paginate()
    .sort();

  const result = await transactionQuery.modelQuery;
  const meta = await transactionQuery.countTotal();
  return {
    meta,
    result,
  };
};

const TransactionService = {
  getAllTransaction,
};

export default TransactionService;
