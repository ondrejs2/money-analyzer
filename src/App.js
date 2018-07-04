import React, { Component } from 'react';
import './App.css';
import isNumeric from './utils/isNumeric';
import IncomesAndExpenses from './components/IncomesAndExpenses/IncomesAndExpenses';

const CSV_ENCODING = 'utf-8';
const CSV_DELIMITER = ';';
const CSV_DECIMAL_POINT_CHAR = ',';
const CSV_COLUMN_MAPPING = Object.freeze({
    amount: 'Částka v měně účtu',
    counterpartyAccountNumber: 'Číslo účtu protistrany',
    date: 'Datum provedení'
});

let reversedColumns = {};
Object.keys(CSV_COLUMN_MAPPING).forEach(key => {
    reversedColumns[CSV_COLUMN_MAPPING[key]] = key;
});
const CSV_REVERSED_COLUMN_MAPPING = Object.freeze(reversedColumns);

const BLACKLISTED_COUNTERPARTY_ACCOUNT_NUMBERS = ['1195516035/3030', '1195516027/3030'];

const $MONA = Object.freeze({
    CSV_ENCODING,
    CSV_DELIMITER,
    CSV_DECIMAL_POINT_CHAR,
    CSV_COLUMN_MAPPING,
    CSV_REVERSED_COLUMN_MAPPING,
    BLACKLISTED_COUNTERPARTY_ACCOUNT_NUMBERS
});
window.$MONA = $MONA;

export const AppContext = React.createContext();

class App extends Component {

    constructor(props) {
        super(props);

        this._dropArea = React.createRef();

        this.state = {
            $MONA: $MONA,
            transactions: []
        };
    }

    componentDidMount() {
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this._dropArea.current.addEventListener(eventName, (e) => this.preventDefaults(e), false);
            document.body.addEventListener(eventName, (e) => this.preventDefaults(e), false);
        });

        // Highlight drop area when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            this._dropArea.current.addEventListener(eventName, () => this.highlight(), false);
        });
        ['dragleave', 'drop'].forEach(eventName => {
            this._dropArea.current.addEventListener(eventName, () => this.unhighlight(), false);
        });

        // Handle dropped files
        this._dropArea.current.addEventListener('drop', (e) => this.handleDrop(e), false);
    }

    componentWillUnmount() {
        //TODO remove event listeners
    }

    render() {
        return (
            <AppContext.Provider value = { this.state.$MONA }>
                <div
                    id = "drop-area"
                    ref = { this._dropArea }
                >
                    <form className = "my-form">
                        <p>
                            Upload .csv file with the file dialog or by dragging and dropping .csv file onto the dashed region
                        </p>
                        <input
                            accept = "*"
                            id = "fileElem"
                            onChange = { (event) => this.handleFiles(event.target.files) }
                            type = "file"
                        />
                        <label
                            className = "button"
                            htmlFor = "fileElem"
                        >
                            Select .csv file
                        </label>
                    </form>
                </div>
                { this.state.transactions && this.state.transactions.length ?
                    <IncomesAndExpenses transactions = { this.state.transactions }/> :
                    null
                }
            </AppContext.Provider>
        );
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    highlight() {
        this._dropArea.current.classList.add('highlight');
    }

    unhighlight() {
        this._dropArea.current.classList.remove('active');
    }

    handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;

        this.handleFiles(files);
    }

    handleFiles(files) {
        files = [...files];
        files.forEach((file) => this.getAsText(file));
    }

    getAsText(fileToRead) {
        const reader = new FileReader();
        // Read file into memory as UTF-8
        reader.readAsText(fileToRead, CSV_ENCODING);
        // Handle errors load
        reader.onload = (e) => this.loadHandler(e);
        reader.onerror = (e) => this.errorHandler(e);
    }

    loadHandler(event) {
        const csv = event.target.result;
        this.parseCSV(csv);
    }

    parseCSV(csv) {
        const allRows = csv.split(/\r\n|\r|\n/);
        const columnNames = allRows[0].split(CSV_DELIMITER);
        let rows = [];

        for (let i = 1; i < allRows.length; i++) {
            const rowData = allRows[i].split(CSV_DELIMITER);
            let row = {};

            for (let j = 0; j < rowData.length; j++) {
                const unquotedColumnName = this.unquoteValue(columnNames[j]);
                const mappedColumnName = CSV_REVERSED_COLUMN_MAPPING[unquotedColumnName];

                if (mappedColumnName) {
                    row[mappedColumnName] = this.parseData(rowData[j]);
                }
            }

            rows.push(row);
        }

        this.setState({
            transactions: rows
        });
    }

    parseData(data) {
        if (data) {
            let unquotedData = this.unquoteValue(data);

            if (CSV_DECIMAL_POINT_CHAR === ',') {
                if (unquotedData.match(/\d+[,]\d+$/)) {
                    unquotedData = unquotedData.replace(',', '.');
                }
            }

            if (isNumeric(unquotedData)) {
                return parseFloat(unquotedData);
            } else if (this.isDate(unquotedData)) {
                return this.parseDate(unquotedData);
            } else {
                return unquotedData;
            }
        }

        return null;
    }

    isDate(value) {
        return value.match(/^\d+[/]\d+[/]\d+/);
    }

    parseDate(value) {
        return new Date(value.replace(/^(\d+)[/](\d+)[/](\d+)/, '$3-$2-$1'));
    }

    unquoteValue(value) {
        return value.substring(1, value.length - 1);
    }

    errorHandler(evt) {
        if(evt.target.error.name === 'NotReadableError') {
            alert('Can not read file !');
        }
    }
}

export default App;
