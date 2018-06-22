import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AppContext } from '../../App'

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
                { context => (
                    <p>{ this.countBalance(transactions, context) }</p>
                )}
            </AppContext.Consumer>
        );
    }

    countBalance(transactions, blacklistedAccountNumbers) {
        const existAnyBlacklistedAccountNumber = blacklistedAccountNumbers.length;

        return transactions.reduce((balanceAccumulator, transaction) => {
            if (transaction.amount) {
                if (existAnyBlacklistedAccountNumber && transaction.counterpartyAccountNumber) {
                    return !this.transactionIsWithBlacklistedAccountNumber(
                        transaction.counterpartyAccountNumber,
                        blacklistedAccountNumbers
                    ) ?
                        balanceAccumulator + transaction.amount :
                        balanceAccumulator;
                } else {
                    return balanceAccumulator + transaction.amount;
                }
            } else {
                return balanceAccumulator;
            }
        }, 0);
    }

    transactionIsWithBlacklistedAccountNumber(accountNumber, blacklistedAccountNumbers) {
        return blacklistedAccountNumbers.includes(accountNumber);
    }
}

export default IncomesAndExpenditures;
