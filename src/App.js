import React, { Component } from 'react';
import './App.css';

const CSV_DELIMITER = ';';
const CSV_ENCODING = 'utf-8';
const DECIMAL_POINT_CHAR = ',';

const $MONA = Object.freeze({
    CSV_DELIMITER,
    CSV_ENCODING,
    DECIMAL_POINT_CHAR
});
window.$MONA = $MONA;


class App extends Component {

    constructor(props) {
        super(props);

        this._dropArea = React.createRef();
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
            <div id = "drop-area" ref = { this._dropArea }>
                <form className = "my-form">
                    <p>Upload .csv file with the file dialog or by dragging and dropping .csv file onto the dashed region
                    </p>
                    <input type = "file" id = "fileElem" accept = "*" onChange= { (e) => this.handleFiles(e.target.files) }/>
                    <label className = "button" htmlFor= "fileElem">Select .csv file</label>
                </form>
            </div>
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
                row[columnNames[j]] = this.parseData(rowData[j]);
            }

            rows.push(row);
        }

        console.log(rows);
        console.log($MONA);
    }

    parseData(data) {
        if (data) {
            let unquotedData = data.substring(1, data.length - 1);

            if (DECIMAL_POINT_CHAR === ',') {
                if (unquotedData.match(/\d+[,]\d+$/)) {
                    unquotedData = unquotedData.replace(',', '.');
                }
            }

            if (this.isNumeric(unquotedData)) {
                return parseFloat(unquotedData);
            } else {
                return unquotedData;
            }
        }

        return null;
    }

    isNumeric(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    }

    errorHandler(evt) {
        if(evt.target.error.name === 'NotReadableError') {
            alert('Can not read file !');
        }
    }
}

export default App;
