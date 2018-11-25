import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './barChart.css';
import { AppContext } from '../../App';
import { CZECH_MONTH_NAMES } from '../../utils/constants';
import formatNumber, { FORMAT_TYPE } from '../../utils/formatNumber';
import IncomesAndExpensesSummaryTable from './IncomesAndExpensesSummaryTable';

export const AVERAGES = 'averages';
export const BALANCE = 'balance';
export const EXPENSES = 'expenses';
export const INCOMES = 'incomes';
const MAX_MONTHLY_EXPENSES = 'maxMonthlyExpenses';
const MAX_MONTHLY_INCOMES = 'maxMonthlyIncomes';
const META = 'meta';
const MONTHS = 'months';
export const TOTALS = 'totals';

class IncomesAndExpenses extends Component {
    static propTypes = {
        transactions: PropTypes.arrayOf(PropTypes.shape({
            amount: PropTypes.number,
            date: PropTypes.instanceOf(Date).isRequired,
            counterpartyAccountNumber: PropTypes.string
        })).isRequired
    };

    render() {
        const { transactions } = this.props;

        if (!transactions || !transactions.length) {
            return (
                <p>no data</p>
            );
        }

        return (
            <AppContext.Consumer>
                { context => this.renderIaE(context) }
            </AppContext.Consumer>
        );
    }

    renderIaE(context) {
        const { BLACKLISTED_COUNTERPARTY_ACCOUNT_NUMBERS } = context;
        let groupedIaE = this.groupIaE(BLACKLISTED_COUNTERPARTY_ACCOUNT_NUMBERS);

        return (
            <div>
                { Object.keys(groupedIaE).map((year, index) => {
                    return (
                        <div key = { index }>
                            { this.renderYearlyIaE(year, groupedIaE) }
                            <IncomesAndExpensesSummaryTable
                                averages = { groupedIaE[year][META][AVERAGES] }
                                totals = { groupedIaE[year][META][TOTALS] }
                            />
                        </div>
                    );
                }) }
            </div>
        );
    }

    renderYearlyIaE(year, groupedIaE) {
        return (
            <div
                className = "bar-chart"
                key = { year }
            >
                <h1 className = "bar-chart__main-label-wrapper">
                    <span className = "bar-chart__main-label">{ year }</span>
                </h1>
                <div className = "bar-chart__start-point-wrapper">
                    <span className = "bar-chart__start-point" />
                </div>
                { Object.keys(groupedIaE[year][MONTHS]).map(month => {
                    const maxValue = Math.max(
                        groupedIaE[year][META][MAX_MONTHLY_INCOMES],
                        groupedIaE[year][META][MAX_MONTHLY_EXPENSES]
                    );
                    const monthIncomes = groupedIaE[year][MONTHS][month][INCOMES];
                    const monthExpenses = groupedIaE[year][MONTHS][month][EXPENSES];
                    const monthBalance = groupedIaE[year][MONTHS][month][BALANCE];

                    return (
                        <div
                            className = "bar-chart__section"
                            key = { `${year}_${month}` }
                        >
                            <div className = "bar-chart__negative-side">
                                <h2 className = "bar-chart__label bar-chart__label--negative-side">
                                    { formatNumber(month, FORMAT_TYPE.TWO_DIGITS) }
                                </h2>
                            </div>
                            <div className = "bar-chart__positive-side">
                                <h2 className = "bar-chart__label bar-chart__label--positive-side">
                                    { CZECH_MONTH_NAMES[month - 1] }
                                </h2>
                                <div
                                    className = "bar-chart__bar bar-chart__bar--is-green"
                                    style = { { width: `${(monthIncomes / maxValue) * 100}%` } }>
                                    <h3 className = "bar-chart__bar-value bar-chart__bar-value--is-green">
                                        { formatNumber(monthIncomes, FORMAT_TYPE.SEPARATE_THOUSANDS) }&nbsp;Kč
                                    </h3>
                                </div>
                                <div
                                    className = "bar-chart__bar bar-chart__bar--is-red"
                                    style = { { width: `${(monthExpenses / maxValue) * 100}%` } }>
                                    <h3 className = "bar-chart__bar-value bar-chart__bar-value--is-red">
                                        { formatNumber(monthExpenses, FORMAT_TYPE.SEPARATE_THOUSANDS) }&nbsp;Kč
                                    </h3>
                                </div>
                                <div
                                    className = "bar-chart__bar bar-chart__bar--is-purple"
                                    style = { { width: `${(monthBalance / maxValue) * 100}%` } }>
                                    <h3 className = "bar-chart__bar-value bar-chart__bar-value--is-purple">
                                        { formatNumber(monthBalance, FORMAT_TYPE.SEPARATE_THOUSANDS) }&nbsp;Kč
                                    </h3>
                                </div>
                            </div>
                        </div>
                    );
                }) }
            </div>
        );
    }

    groupIaE(blacklistedAccountNumbers = []) {
        const { transactions } = this.props;
        let groupedIaE = {};

        transactions.forEach(transaction => {
            const { amount, counterpartyAccountNumber, date } = transaction;

            if (date && amount && !this.transactionIsBlacklisted(blacklistedAccountNumbers, counterpartyAccountNumber)) {
                const year = date.getFullYear();
                const month = date.getMonth() + 1;

                if (!groupedIaE[year]) {
                    groupedIaE[year] = {
                        meta: {
                            [AVERAGES]: {
                                [BALANCE]: 0,
                                [EXPENSES]: 0,
                                [INCOMES]: 0
                            },
                            [TOTALS]: {
                                [BALANCE]: 0,
                                [EXPENSES]: 0,
                                [INCOMES]: 0
                            }
                        },
                        [MONTHS]: {},
                    };
                }
                if (!groupedIaE[year][MONTHS][month]) {
                    groupedIaE[year][MONTHS][month] = {
                        [BALANCE]: 0,
                        [EXPENSES]: 0,
                        [INCOMES]: 0
                    };
                }

                if (amount < 0) {
                    groupedIaE[year][MONTHS][month][EXPENSES] += Math.abs(amount);
                } else {
                    groupedIaE[year][MONTHS][month][INCOMES] += amount;
                }
            }
        });

        this.countMonthlyBalance(groupedIaE);
        this.countYearlyIaE(groupedIaE);

        console.log(groupedIaE);

        return groupedIaE;
    }

    countMonthlyBalance(groupedIaE) {
        Object.keys(groupedIaE).forEach(year => {
            let yearMaxMonthlyIncomes = 0;
            let yearMaxMonthlyExpenses = 0;

            Object.keys(groupedIaE[year][MONTHS]).forEach(month => {
                const monthIncomes = Math.round(groupedIaE[year][MONTHS][month][INCOMES]);
                const monthExpenses = Math.round(groupedIaE[year][MONTHS][month][EXPENSES]);

                groupedIaE[year][MONTHS][month][INCOMES] = monthIncomes;
                groupedIaE[year][MONTHS][month][EXPENSES] = monthExpenses;
                groupedIaE[year][MONTHS][month][BALANCE] = monthIncomes - monthExpenses;

                if (monthIncomes > yearMaxMonthlyIncomes) {
                    yearMaxMonthlyIncomes = monthIncomes;
                }
                if (monthExpenses > yearMaxMonthlyExpenses) {
                    yearMaxMonthlyExpenses = monthExpenses;
                }
            });

            groupedIaE[year][META][MAX_MONTHLY_INCOMES] = yearMaxMonthlyIncomes;
            groupedIaE[year][META][MAX_MONTHLY_EXPENSES] = yearMaxMonthlyExpenses;
        });
    }

    countYearlyIaE(groupedIaE) {
        Object.keys(groupedIaE).forEach(year => {
            const totalIncomes = Object.values(groupedIaE[year][MONTHS]).reduce(
                (yearlyIncomes, month) => yearlyIncomes + month[INCOMES]
                , 0
            );
            const totalExpenses = Object.values(groupedIaE[year][MONTHS]).reduce(
                (yearlyExpenses, month) => yearlyExpenses + month[EXPENSES]
                , 0
            );
            const totalBalance = totalIncomes - totalExpenses;
            const monthsCount = Object.keys(groupedIaE[year][MONTHS]).length;

            groupedIaE[year][META][TOTALS][INCOMES] = totalIncomes;
            groupedIaE[year][META][TOTALS][EXPENSES] = totalExpenses;
            groupedIaE[year][META][TOTALS][BALANCE] = totalBalance;

            groupedIaE[year][META][AVERAGES][INCOMES] = Math.round(totalIncomes / monthsCount);
            groupedIaE[year][META][AVERAGES][EXPENSES] = Math.round(totalExpenses / monthsCount);
            groupedIaE[year][META][AVERAGES][BALANCE] = Math.round(totalBalance / monthsCount);
        });
    }

    transactionIsBlacklisted(blacklistedAccountNumbers, counterpartyAccountNumber) {
        const existAnyBlacklistedAccountNumber = blacklistedAccountNumbers.length;

        if (!existAnyBlacklistedAccountNumber || !counterpartyAccountNumber) {
            return false;
        }

        return this.IsWithBlacklistedAccountNumber(blacklistedAccountNumbers, counterpartyAccountNumber);
    }

    IsWithBlacklistedAccountNumber(blacklistedAccountNumbers, accountNumber) {
        return blacklistedAccountNumbers.includes(accountNumber);
    }
}

export default IncomesAndExpenses;
