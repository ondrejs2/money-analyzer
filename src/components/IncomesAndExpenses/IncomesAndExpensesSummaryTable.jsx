import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './barChartTable.css';
import formatNumber, { FORMAT_TYPE } from '../../utils/formatNumber';
import { AVERAGES, BALANCE, EXPENSES, INCOMES, TOTALS } from './IncomesAndExpenses';

class IncomesAndExpensesSummaryTable extends Component {
    static propTypes = {
        [AVERAGES]: PropTypes.shape({
            [BALANCE]: PropTypes.number,
            [EXPENSES]: PropTypes.number,
            [INCOMES]: PropTypes.number
        }).isRequired,
        [TOTALS]: PropTypes.shape({
            [BALANCE]: PropTypes.number,
            [EXPENSES]: PropTypes.number,
            [INCOMES]: PropTypes.number
        }).isRequired
    };

    render() {
        const averages = this.props[AVERAGES];
        const totals = this.props[TOTALS];

        if (!averages && !totals) {
            return null;
        }

        return (
            <div>
                { this.renderData(totals, TOTALS) }
                { this.renderData(averages, AVERAGES) }
            </div>
        );
    }

    renderData(data, dataType) {
        if (!data) {
            return null;
        }

        return (
            <table className = "bar-chart-table">
                <thead>
                    <tr>
                        <th colSpan = "2">{ dataType === TOTALS ? 'CELKEM' : 'PRŮMĚRNĚ'}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            { dataType === TOTALS ? 'Celkové roční příjmy' : 'Průměrné měsíční příjmy'}
                        </td>
                        <td className = { data[INCOMES] > 0 ? 'bar-chart-table--is-green' : 'bar-chart-table--is-red' }>
                            { formatNumber(data[INCOMES], FORMAT_TYPE.SEPARATE_THOUSANDS) }
                        </td>
                    </tr>
                    <tr>
                        <td>
                            { dataType === TOTALS ? 'Celkové roční výdaje' : 'Průměrné měsíční výdaje'}
                        </td>
                        <td className = { data[EXPENSES] > 0 ? 'bar-chart-table--is-green' : 'bar-chart-table--is-red' }>
                            { formatNumber(data[EXPENSES], FORMAT_TYPE.SEPARATE_THOUSANDS) }
                        </td>
                    </tr>
                    <tr>
                        <td>
                            { dataType === TOTALS ? 'Celková roční bilance' : 'Průměrná měsíční bilance'}
                        </td>
                        <td className = { data[BALANCE] > 0 ? 'bar-chart-table--is-green' : 'bar-chart-table--is-red' }>
                            { formatNumber(data[BALANCE], FORMAT_TYPE.SEPARATE_THOUSANDS) }
                        </td>
                    </tr>
                </tbody>
            </table>
        );
    }
}

export default IncomesAndExpensesSummaryTable;
