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
                    <p>{ this.countIncomesAndExpenditures(transactions, context) }</p>
                )}
            </AppContext.Consumer>
        );
    }

    countIncomesAndExpenditures(transactions, context) {
        const { BLACKLISTED_COUNTERPARTY_ACCOUNT_NUMBERS } = context;
        const existAnyBlacklistedAccountNumber = BLACKLISTED_COUNTERPARTY_ACCOUNT_NUMBERS.length;

        return transactions.reduce((balanceAccumulator, transaction) => {
            if (transaction.amount) {
                if (existAnyBlacklistedAccountNumber && transaction.counterpartyAccountNumber) {
                    return !this.transactionIsWithBlacklistedAccountNumber(
                        transaction.counterpartyAccountNumber,
                        BLACKLISTED_COUNTERPARTY_ACCOUNT_NUMBERS
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
