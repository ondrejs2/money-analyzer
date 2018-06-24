import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './barChart.css';
import { AppContext } from '../../App';
import { CZECH_MONTH_NAMES } from '../../utils/constants';

const BALANCE = 'balance';
const EXPENDITURES = 'expenditures';
const INCOMES = 'incomes';
const MAX_MONTHLY_EXPENDITURES = 'maxMonthlyExpenditures';
const MAX_MONTHLY_INCOMES = 'maxMonthlyIncomes';
const META = 'meta';
const MONTHS = 'months';

class IncomesAndExpenditures extends Component {
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
                { Object.keys(groupedIaE).map(year => this.renderYearlyIaE(year, groupedIaE)) }
            </div>
        );
    }

    renderYearlyIaE(year, groupedIaE) {
        return (
            <div
                className = "bar-chart"
                key = { year }
            >
                { Object.keys(groupedIaE[year][MONTHS]).map(month => {
                    const maxValue = Math.max(
                        groupedIaE[year][META][MAX_MONTHLY_INCOMES],
                        groupedIaE[year][META][MAX_MONTHLY_EXPENDITURES]
                    );
                    const monthIncomes = groupedIaE[year][MONTHS][month][INCOMES];
                    const monthExpenditures = groupedIaE[year][MONTHS][month][EXPENDITURES];
                    const monthBalance = groupedIaE[year][MONTHS][month][BALANCE];

                    return (
                        <div
                            className = "bar-chart__section"
                            key = { `${year}_${month}` }
                        >
                            <div className = "bar-chart__negative-side">
                                <h2 className = "bar-chart__label bar-chart__label--negative-side">
                                    { month }
                                </h2>
                            </div>
                            <div className = "bar-chart__positive-side">
                                <h2 className = "bar-chart__label bar-chart__label--positive-side">
                                    { CZECH_MONTH_NAMES[month - 1] }
                                </h2>
                                <div
                                    className = "bar-chart__bar bar-chart__bar--is-green"
                                    style = { { width: `${(monthIncomes / maxValue) * 100}%` } }>
                                    <h3 className = "bar-chart__bar-value">{ monthIncomes }</h3>
                                </div>
                                <div
                                    className = "bar-chart__bar bar-chart__bar--is-red"
                                    style = { { width: `${(monthExpenditures / maxValue) * 100}%` } }>
                                    <h3 className = "bar-chart__bar-value">{ monthExpenditures }</h3>
                                </div>
                                <div
                                    className = "bar-chart__bar bar-chart__bar--is-blue"
                                    style = { { width: `${(monthBalance / maxValue) * 100}%` } }>
                                    <h3 className = "bar-chart__bar-value">{ monthBalance }</h3>
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
                            [BALANCE]: 0,
                            [EXPENDITURES]: 0,
                            [INCOMES]: 0
                        },
                        [MONTHS]: {},
                    };
                }
                if (!groupedIaE[year][MONTHS][month]) {
                    groupedIaE[year][MONTHS][month] = {
                        [BALANCE]: 0,
                        [EXPENDITURES]: 0,
                        [INCOMES]: 0
                    };
                }

                if (amount < 0) {
                    groupedIaE[year][MONTHS][month][EXPENDITURES] += Math.abs(amount);
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
            let yearMaxMonthlyExpenditures = 0;

            Object.keys(groupedIaE[year][MONTHS]).forEach(month => {
                const monthIncomes = Math.round(groupedIaE[year][MONTHS][month][INCOMES]);
                const monthExpenditures = Math.round(groupedIaE[year][MONTHS][month][EXPENDITURES]);

                groupedIaE[year][MONTHS][month][INCOMES] = monthIncomes;
                groupedIaE[year][MONTHS][month][EXPENDITURES] = monthExpenditures;
                groupedIaE[year][MONTHS][month][BALANCE] = monthIncomes - monthExpenditures;

                if (monthIncomes > yearMaxMonthlyIncomes) {
                    yearMaxMonthlyIncomes = monthIncomes;
                }
                if (monthExpenditures > yearMaxMonthlyExpenditures) {
                    yearMaxMonthlyExpenditures = monthExpenditures;
                }
            });

            groupedIaE[year][META][MAX_MONTHLY_INCOMES] = yearMaxMonthlyIncomes;
            groupedIaE[year][META][MAX_MONTHLY_EXPENDITURES] = yearMaxMonthlyExpenditures;
        });
    }

    countYearlyIaE(groupedIaE) {
        Object.keys(groupedIaE).forEach(year => {
           groupedIaE[year][META][INCOMES] = Object.values(groupedIaE[year][MONTHS]).reduce(
               (yearlyIncomes, month) => yearlyIncomes + month[INCOMES]
           , 0);

            groupedIaE[year][META][EXPENDITURES] = Object.values(groupedIaE[year][MONTHS]).reduce(
                (yearlyExpenditures, month) => yearlyExpenditures + month[EXPENDITURES]
            , 0);

            groupedIaE[year][META][BALANCE] = groupedIaE[year][META][INCOMES] - groupedIaE[year][META][EXPENDITURES];
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

export default IncomesAndExpenditures;
