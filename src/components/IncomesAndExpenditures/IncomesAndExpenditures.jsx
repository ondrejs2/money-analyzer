import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AppContext } from '../../App'

const EXPENDITURES = 'expenditures';
const INCOMES = 'incomes';
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
            <div>just something</div>
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
                            [EXPENDITURES]: 0,
                            [INCOMES]: 0
                        },
                        [MONTHS]: {},
                    };
                }
                if (!groupedIaE[year][MONTHS][month]) {
                    groupedIaE[year][MONTHS][month] = {
                        [EXPENDITURES]: 0,
                        [INCOMES]: 0
                    };
                }

                if (amount < 0) {
                    groupedIaE[year][MONTHS][month][EXPENDITURES] += amount;
                } else {
                    groupedIaE[year][MONTHS][month][INCOMES] += amount;
                }
            }
        });

        this.countYearlyIaE(groupedIaE);

        console.log(groupedIaE);

        return groupedIaE;
    }

    countYearlyIaE(groupedIaE) {
        Object.keys(groupedIaE).forEach(year => {
           groupedIaE[year][META][INCOMES] = Object.values(groupedIaE[year][MONTHS]).reduce(
               (yearlyIncomes, month) => yearlyIncomes + month[INCOMES]
           , 0);

            groupedIaE[year][META][EXPENDITURES] = Object.values(groupedIaE[year][MONTHS]).reduce(
                (yearlyExpenditures, month) => yearlyExpenditures + month[EXPENDITURES]
            , 0);
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
