(function (win) {

  var invalidity = {
    invalidSrc: false,
    invalidDest: false
  };

  var emptyEntry = {
    id: 0,
    src: "",
    dest: "",
    phone: "",
    attempt_success: 0,
    attempt_failure: 0
  };

  win.EntriesScreen = React.createClass({
    displayName: "EntriesScreen",

    getInitialState: function () {
      return Object.assign({}, emptyEntry, this.props.entry);
    },
    componentWillReceiveProps: function (nextProps) {
      this.setState(Object.assign({}, invalidity, emptyEntry, nextProps.entry));
    },
    onSave: function () {
      var entry = Object.assign({}, this.state);
      Object.keys(invalidity).forEach(function (key) {
        delete entry[key];
      });
      this.props.store.dispatch({
        type: "REQUEST_SAVE_ENTRY",
        value: entry
      });
    },
    onSrcChange: function (e) {
      this.setState({
        invalidSrc: e.target.value.length == 0,
        src: e.target.value
      });
    },
    onDestChange: function (e) {
      this.setState({
        invalidDest: e.target.value.length == 0,
        dest: e.target.value
      });
    },
    onPhoneChange: function (e) {
      this.setState({
        phone: e.target.value
      });
    },
    onActivate: function (e) {
      this.props.store.dispatch({
        type: "SELECT_ENTRY",
        value: e.currentTarget.dataset.id
      });
    },
    onBack: function () {
      if (this.props.course.id) {
        this.props.store.dispatch({
          type: "SHOW_COURSE_SCREEN"
        });
      } else {
        this.props.onMain();
      }
    },
    onDelete: function () {
      this.props.store.dispatch({
        type: "REQUEST_DELETE_ENTRY"
      });
    },
    onCancel: function () {
      this.props.store.dispatch({
        type: "SELECT_ENTRY"
      });
    },
    render: function () {
      var me = this;
      var editOrCreateRow = React.createElement(
        "tr",
        { key: this.props.entry.id || 0 },
        React.createElement(
          "td",
          null,
          React.createElement("input", { type: "text",
            autoFocus: true,
            ref: function (el) {
              // autofocus does not work after saving a new item...
              // not sure why
              if (el && !me.state.src.length && !me.state.dest.length && !me.state.phone.length) {
                el.focus();
              }
            },
            required: !!this.props.entry.id || this.state.dest.length,
            onChange: this.onSrcChange,
            value: this.state.src })
        ),
        React.createElement(
          "td",
          null,
          React.createElement("input", { type: "text",
            required: !!this.props.entry.id || this.state.src.length,
            onChange: this.onDestChange,
            value: this.state.dest })
        ),
        React.createElement(
          "td",
          null,
          React.createElement("input", { type: "text",
            onChange: this.onPhoneChange,
            value: this.state.phone })
        ),
        React.createElement(
          "td",
          null,
          React.createElement(
            "button",
            { disabled: !(this.state.src.length && this.state.dest.length),
              onClick: this.onSave },
            "Save"
          ),
          this.props.entry.id ? React.createElement(
            "span",
            null,
            React.createElement(
              "button",
              { onClick: this.onDelete },
              "Delete"
            ),
            React.createElement(
              "button",
              { onClick: this.onCancel },
              "Cancel"
            )
          ) : null
        )
      );
      return React.createElement(
        "div",
        null,
        React.createElement(
          "table",
          null,
          React.createElement(
            "thead",
            null,
            React.createElement(
              "tr",
              null,
              React.createElement(
                "th",
                null,
                "Source"
              ),
              React.createElement(
                "th",
                null,
                "Destination"
              ),
              React.createElement(
                "th",
                null,
                "Phonetic"
              ),
              React.createElement("th", null)
            )
          ),
          React.createElement(
            "tbody",
            null,
            Object.keys(this.props.entries).map(function (entryId) {
              var entry = this.props.entries[entryId];
              var row = this.props.entry.id == entryId ? editOrCreateRow : React.createElement(
                "tr",
                { onClick: this.onActivate, "data-id": entryId, key: entryId },
                React.createElement(
                  "td",
                  null,
                  entry.src
                ),
                React.createElement(
                  "td",
                  null,
                  entry.dest
                ),
                React.createElement(
                  "td",
                  null,
                  entry.phone
                ),
                React.createElement(
                  "td",
                  null,
                  entry.attempt_success,
                  " / ",
                  entry.attempt_failure
                )
              );
              return row;
            }, this),
            this.props.entry.id ? React.createElement(
              "tr",
              null,
              React.createElement("td", null),
              React.createElement("td", null),
              React.createElement("td", null),
              React.createElement("td", null)
            ) : editOrCreateRow
          )
        ),
        React.createElement(
          "button",
          { onClick: this.onBack },
          "Back"
        )
      );
    }
  });
})(window);