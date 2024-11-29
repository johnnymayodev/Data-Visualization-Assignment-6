import React, { Component } from "react";

class FileUpload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
    };
  }

  handleFileSubmit = (event) => {
    event.preventDefault();
    const { file } = this.state;
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const json = this.csvToJson(text);
        this.props.set_data(json); // Pass the JSON data to the parent component
      };
      reader.readAsText(file);
    }
  };

  csvToJson = (csv) => {
    const lines = csv.trim().split("\n"); // Split by new line to get rows, trim to avoid trailing empty rows
    const headers = lines[0].split(","); // Split first row to get headers
    const result = [];
    for (let i = 1; i < lines.length; i++) {
      const currentLine = lines[i].split(","); // Split each line by comma
      const obj = {};
      headers.forEach((header, index) => {
        obj[header.trim()] = currentLine[index]?.trim(); // Trim to remove spaces
      });
      // Add the row to the result if it's not empty
      if (Object.keys(obj).length && lines[i].trim()) {
        const parsedObj = {
          Date: obj.Date, // Keep Date as a string; parsing to Date handled later in D3
          "GPT-4": parseFloat(obj["GPT-4"]),
          Gemini: parseFloat(obj.Gemini),
          "PaLM-2": parseFloat(obj["PaLM-2"]),
          Claude: parseFloat(obj.Claude),
          "LLaMA-3.1": parseFloat(obj["LLaMA-3.1"]),
        };
        // Push the parsed object if numeric values are valid
        if (!isNaN(parsedObj["GPT-4"]) && !isNaN(parsedObj.Gemini) && !isNaN(parsedObj["PaLM-2"]) && !isNaN(parsedObj.Claude) && !isNaN(parsedObj["LLaMA-3.1"])) {
          result.push(parsedObj);
        }
      }
    }
    return result;
  };

  render() {
    return (
      <div style={{ backgroundColor: "#f0f0f0", padding: 20 }}>
        <h2>Upload a CSV File</h2>
        <form onSubmit={this.handleFileSubmit}>
          <input type="file" accept=".csv" onChange={(event) => this.setState({ file: event.target.files[0] })} />
          <button type="submit">Upload</button>
        </form>
      </div>
    );
  }
}

export default FileUpload;
