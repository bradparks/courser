(function (win) {

  var invalidity = {
    invalidSrc: false,
    invalidDest: false,
    showCreate: false,
    showMore: false
  };

  var emptyEntry = {
    id: 0,
    source: "",
    destination: "",
    phone: "",
    attempt_success: 0,
    attempt_failure: 0
  };

  win.EntriesScreen = React.createClass({
    displayName: "EntriesScreen",

    getInitialState: function () {
      return Object.assign({}, emptyEntry, invalidity, this.props.entry);
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
        value: entry,
        forceBackToMainScreen: this.props.forceBackToMainScreen
      });
    },
    onSrcChange: function (e) {
      this.setState({
        invalidSrc: e.target.value.length == 0,
        source: e.target.value
      });
    },
    onDestChange: function (e) {
      this.setState({
        invalidDest: e.target.value.length == 0,
        destination: e.target.value
      });
    },
    onPhoneChange: function (e) {
      this.setState({
        phone: e.target.value
      });
    },
    selectEntry: function (id) {
      this.props.store.dispatch({
        type: "SELECT_ENTRY",
        value: id,
        forceBackToMainScreen: this.props.forceBackToMainScreen
      });
    },
    onActivate: function (e) {
      this.selectEntry(e.currentTarget.dataset.id);
    },
    onBack: function () {
      if (!this.props.forceBackToMainScreen) {
        this.props.store.dispatch({
          type: "SHOW_COURSE_SCREEN"
        });
      } else {
        this.props.onMain();
      }
    },
    onDelete: function () {
      this.props.store.dispatch({
        type: "REQUEST_DELETE_ENTRY",
        forceBackToMainScreen: this.props.forceBackToMainScreen
      });
    },
    onCancel: function () {
      this.props.store.dispatch({
        type: "SELECT_ENTRY",
        forceBackToMainScreen: this.props.forceBackToMainScreen
      });
    },
    onMore: function () {
      this.setState({
        showMore: !this.state.showMore
      });
    },
    dispatchOrder: function (orderValue) {
      this.props.store.dispatch({
        type: "ENTRIES_ORDER",
        value: orderValue,
        forceBackToMainScreen: this.props.forceBackToMainScreen
      });
    },
    onOrderChangeALPHABETIC_SOURCE_DESC: function () {
      this.dispatchOrder("ALPHABETIC_SOURCE_DESC");
    },
    onOrderChangeALPHABETIC_SOURCE_ASC: function () {
      this.dispatchOrder("ALPHABETIC_SOURCE_ASC");
    },
    onOrderChangeALPHABETIC_DESTINATION_DESC: function () {
      this.dispatchOrder("ALPHABETIC_DESTINATION_DESC");
    },
    onOrderChangeALPHABETIC_DESTINATION_ASC: function () {
      this.dispatchOrder("ALPHABETIC_DESTINATION_ASC");
    },
    onOrderChangeID_ASC: function () {
      this.dispatchOrder("ID_ASC");
    },
    onOrderChangeID_DESC: function () {
      this.dispatchOrder("ID_DESC");
    },
    onKeyDown: function (e) {
      switch (e.keyCode) {
        case 13:
          // ENTER
          e.preventDefault();
          if (this.state.source.length && this.state.destination.length) {
            this.onSave();
          }
          break;
        case 27:
          // ESC
          e.preventDefault();
          if (this.state.id || this.state.showCreate) {
            this.onCancel();
          } else {
            this.onBack();
          }
          break;
        case 40:
          // DOWN
          e.preventDefault();
          if (this.state.id) {
            var ids = Object.keys(this.props.entries);
            var index = ids.indexOf(this.state.id.toString());
            if (index + 1 == ids.length) {
              this.onCancel();
            } else {
              this.selectEntry(ids[index + 1]);
            }
          }
          break;
        case 38:
          // UP
          e.preventDefault();
          var ids = Object.keys(this.props.entries);
          if (ids.length) {
            if (this.state.id) {
              var index = ids.indexOf(this.state.id.toString());
              if (index > 0) {
                this.selectEntry(ids[index - 1]);
              }
            } else {
              this.selectEntry(ids[ids.length - 1]);
            }
          }
          break;
      }
    },
    onCreateEntry: function () {
      this.setState(Object.assign({}, emptyEntry, invalidity, { showCreate: true }));
    },
    render: function () {
      var me = this;
      var propsEntry = this.props.entry || {};
      var editOrCreateRow = propsEntry.id || this.state.showCreate ? React.createElement(
        "li",
        { key: propsEntry.id || 0 },
        React.createElement(
          "div",
          { className: "row formLabelInputPair" },
          React.createElement("input", { type: "text",
            autoFocus: true,
            ref: function (el) {
              // autofocus does not work after saving a new item...
              // not sure why
              if (el && !me.state.source.length && !me.state.destination.length && !me.state.phone.length) {
                el.focus();
              }
            },
            onKeyDown: this.onKeyDown,
            placeholder: this.props.course.source_title,
            required: !!propsEntry.id || this.state.destination.length,
            onChange: this.onSrcChange,
            value: this.state.source })
        ),
        React.createElement(
          "div",
          { className: "row formLabelInputPair" },
          React.createElement("input", { type: "text",
            placeholder: this.props.course.destination_title,
            required: !!propsEntry.id || this.state.source.length,
            onChange: this.onDestChange,
            onKeyDown: this.onKeyDown,
            value: this.state.destination })
        ),
        React.createElement(
          "div",
          { className: "row formLabelInputPair" },
          React.createElement("input", { type: "text",
            placeholder: "Phonetic",
            onChange: this.onPhoneChange,
            onKeyDown: this.onKeyDown,
            value: this.state.phone })
        ),
        React.createElement(
          "div",
          { className: "row buttonbar buttonbar-3" },
          React.createElement(
            "button",
            {
              disabled: !(this.state.source.length && this.state.destination.length),
              onClick: this.onSave },
            "Save"
          ),
          React.createElement(
            "button",
            { onClick: this.onCancel },
            "Cancel"
          ),
          this.state.id ? React.createElement(
            "span",
            null,
            React.createElement(
              "button",
              { className: "deleteButton", onClick: this.onDelete },
              "Delete"
            )
          ) : null
        )
      ) : "";
      return React.createElement(
        "div",
        { id: "screen" },
        React.createElement(
          "div",
          { id: "navbar" },
          React.createElement(
            "div",
            { className: "navbarButtonContainer", id: "navbarLeft" },
            React.createElement(
              "button",
              { onClick: this.onBack },
              "<"
            )
          ),
          React.createElement(
            "div",
            { id: "navbarTitle" },
            "Entries"
          ),
          React.createElement(
            "div",
            { className: "navbarButtonContainer", id: "navbarRight" },
            React.createElement(
              "button",
              { onClick: this.onMore },
              ":"
            )
          )
        ),
        React.createElement(
          "div",
          { id: "main" },
          React.createElement(
            "ul",
            { className: "listView entriesList" },
            this.props.entryIds.map(function (entryId) {
              var entry = this.props.entries[entryId];
              var row = this.state.id == entryId ? editOrCreateRow : React.createElement(
                "li",
                { onClick: this.onActivate, "data-id": entryId, key: entryId },
                React.createElement(
                  "a",
                  null,
                  React.createElement(
                    "div",
                    null,
                    entry.source
                  ),
                  React.createElement(
                    "div",
                    null,
                    entry.destination
                  ),
                  entry.phone ? React.createElement(
                    "div",
                    null,
                    React.createElement(
                      "em",
                      null,
                      entry.phone
                    )
                  ) : ""
                )
              );
              return row;
            }, this),
            this.state.showCreate ? editOrCreateRow : ""
          )
        ),
        !this.state.showCreate && !this.state.id ? React.createElement(
          "button",
          { className: "floatingButton", id: "floatingBottomButton", onClick: this.onCreateEntry },
          "+"
        ) : "",
        this.state.showMore ? React.createElement(
          "ul",
          { id: "popup", className: "listView" },
          React.createElement(
            "li",
            null,
            React.createElement(
              "label",
              { htmlFor: "orderIdAsc" },
              React.createElement("input", { name: "order", type: "radio",
                checked: this.props.entriesOrder == "ID_ASC",
                id: "orderIdAsc",
                onChange: this.onOrderChangeID_ASC }),
              React.createElement(
                "span",
                null,
                "Order from old to new"
              )
            )
          ),
          React.createElement(
            "li",
            null,
            React.createElement(
              "label",
              { htmlFor: "orderIdDesc" },
              React.createElement("input", { name: "order", type: "radio",
                checked: this.props.entriesOrder == "ID_DESC",
                id: "orderIdDesc",
                onChange: this.onOrderChangeID_DESC }),
              React.createElement(
                "span",
                null,
                "Order from new to old"
              )
            )
          ),
          React.createElement(
            "li",
            null,
            React.createElement(
              "label",
              { htmlFor: "orderAlphabeticSourceAsc" },
              React.createElement("input", { name: "order", type: "radio",
                id: "orderAlphabeticSourceAsc",
                checked: this.props.entriesOrder == "ALPHABETIC_SOURCE_ASC",
                onChange: this.onOrderChangeALPHABETIC_SOURCE_ASC }),
              React.createElement(
                "span",
                null,
                "Order ",
                this.props.course.source_title,
                " alphabetically up"
              )
            )
          ),
          React.createElement(
            "li",
            null,
            React.createElement(
              "label",
              { htmlFor: "orderAlphabeticSourceDesc" },
              React.createElement("input", { name: "order", type: "radio",
                id: "orderAlphabeticSourceDesc",
                checked: this.props.entriesOrder == "ALPHABETIC_SOURCE_DESC",
                onChange: this.onOrderChangeALPHABETIC_SOURCE_DESC }),
              React.createElement(
                "span",
                null,
                "Order ",
                this.props.course.source_title,
                " alphabetically down"
              )
            )
          ),
          React.createElement(
            "li",
            null,
            React.createElement(
              "label",
              { htmlFor: "orderAlphabeticDestinationAsc" },
              React.createElement("input", { name: "order", type: "radio",
                id: "orderAlphabeticDestinationAsc",
                checked: this.props.entriesOrder == "ALPHABETIC_DESTINATION_ASC",
                onChange: this.onOrderChangeALPHABETIC_DESTINATION_ASC }),
              React.createElement(
                "span",
                null,
                "Order ",
                this.props.course.destination_title,
                " alphabetically up"
              )
            )
          ),
          React.createElement(
            "li",
            null,
            React.createElement(
              "label",
              { htmlFor: "orderAlphabeticDestinationDesc" },
              React.createElement("input", { name: "order", type: "radio",
                id: "orderAlphabeticDestinationDesc",
                checked: this.props.entriesOrder == "ALPHABETIC_DESTINATION_DESC",
                onChange: this.onOrderChangeALPHABETIC_DESTINATION_DESC }),
              React.createElement(
                "span",
                null,
                "Order ",
                this.props.course.destination_title,
                " alphabetically down"
              )
            )
          )
        ) : ""
      );
    }
  });
})(window);