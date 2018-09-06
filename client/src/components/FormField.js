import React, { Component } from "react";

class FormField extends Component {
  state = {
    value: "",
    error: false
  };

  render() {
    return (
      <div>
        <input name={this.props.name} />
      </div>
    );
  }
}

export default FormField;
