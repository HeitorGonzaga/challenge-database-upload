import { getCustomRepository, useContainer, getRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface TransactionDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: TransactionDTO): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    if (type === 'outcome') {
      const { total } = await transactionsRepository.getBalance();
      if (total < value) {
        throw new AppError('Saldo insuficiente para realizar a transação', 400);
      }
    }
    let categoryTransaction = await categoriesRepository.findOne({
      where: {
        title: category,
      },
    });
    if (!categoryTransaction) {
      categoryTransaction = categoriesRepository.create({
        title: category,
      });

      await categoriesRepository.save(categoryTransaction);
    }
    const transaction = transactionsRepository.create({
      title,
      type,
      value,
      category: categoryTransaction,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
