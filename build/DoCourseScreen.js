(function (win) {

  win.DoCourseScreen = React.createClass({
    displayName: "DoCourseScreen",

    getTestType: function () {
      var testTypes = [];
      win.Constants.testTypes.forEach(function (testType) {
        if (this.props.course[testType]) {
          testTypes.push(testType);
        }
      }, this);
      var index = Math.floor(Math.random() * testTypes.length);
      return testTypes[index];
    },
    getEntry: function (entries) {
      var ids = [];
      for (var key in entries) {
        if (!entries[key].attempt_success || entries[key].attempt_success < this.props.course.test_ok_success_count || entries[key].attempt_success < entries[key].attempt_failure) {
          ids.push(key);
        }
      }
      if (ids.length) {
        var index = Math.floor(Math.random() * ids.length);
        return entries[ids[index]];
      }
      return { id: 0 };
    },
    getAnswerEntryIds: function (id, entries) {
      var i, index;
      var answerEntryIds = [];
      var ids = Object.keys(entries);
      ids.splice(ids.indexOf(id.toString()), 1);
      for (i = 0; i < 3; i++) {
        index = Math.floor(Math.random() * ids.length);
        answerEntryIds.push(ids[index]);
        ids.splice(index, 1);
      }
      var insertIndex = Math.floor(Math.random() * answerEntryIds.length + 1);
      answerEntryIds.splice(insertIndex, 0, id);
      return answerEntryIds;
    },
    getNewTest: function () {
      var entry = this.getEntry(this.props.entries);
      return Object.assign({
        answerEntryId: 0,
        entryId: entry.id,
        answerEntryIds: this.getAnswerEntryIds(entry.id, this.props.entries),
        testType: this.getTestType()
      }, entry);
    },
    getInitialState: function () {
      return { answer: "" };
    },
    componentDidMount: function () {
      // Force a rerender with first set of random item + possible answers.
      this.dispatchNewItem();
    },
    componentWillReceiveProps: function (nextProps) {
      this.setState({ answer: nextProps.answer || "" });
    },
    getSuccess: function (entry) {
      var doCourseEntry = this.props.entries[this.props.doCourseEntryId];
      switch (this.props.doCourseTestType) {
        case "SRC_DEST_CHOOSE":
          return entry.dest == doCourseEntry.dest;
          break;
        case "DEST_SRC_CHOOSE":
          return entry.src == doCourseEntry.src;
        case "SRC_DEST_WRITE":
          return this.state.answer == doCourseEntry.dest;
        case "DEST_SRC_WRITE":
          return this.state.answer == doCourseEntry.src;
          break;
      }
      return null;
    },
    onChange: function (e) {
      this.setState({ answer: e.target.value });
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
    dispatchNewItem: function () {
      this.props.store.dispatch(Object.assign(this.getNewTest(), { type: "DO_COURSE_NEW_RANDOM_ITEM",
        forceBackToMainScreen: this.props.forceBackToMainScreen }));
    },
    onReset: function () {
      var ids = Object.keys(this.props.entries);
      var newEntryId = ids[Math.floor(Math.random() * ids.length)];
      var entryIds = this.getAnswerEntryIds(newEntryId, this.props.entries);
      var testType = this.getTestType();
      this.props.store.dispatch({
        type: "REQUEST_RESET",
        entryId: newEntryId,
        entryIds: entryIds,
        testType: testType,
        forceBackToMainScreen: this.props.forceBackToMainScreen
      });
    },
    onSave: function () {
      var success = this.getSuccess();
      this.props.store.dispatch({
        type: "REQUEST_SAVE_ANSWER",
        answer: this.state.answer,
        doCourseSuccess: success,
        forceBackToMainScreen: this.props.forceBackToMainScreen
      });
    },
    answerClick: function (e) {
      var id = e.target.dataset.id;
      var answerEntry = this.props.entries[id];
      var success = this.getSuccess(answerEntry);
      this.props.store.dispatch({
        type: "REQUEST_SAVE_ANSWER",
        answerEntryId: id,
        doCourseSuccess: success,
        forceBackToMainScreen: this.props.forceBackToMainScreen
      });
    },
    render: function () {
      if (this.props.doCourseEntryId) {
        var doCourseEntry = this.props.entries[this.props.doCourseEntryId];
        var editArea = null;
        switch (this.props.doCourseTestType) {
          case "SRC_DEST_CHOOSE":
            editArea = React.createElement(
              "div",
              null,
              React.createElement(
                "div",
                null,
                "SRC: ",
                doCourseEntry.src
              ),
              React.createElement(
                "div",
                null,
                this.props.doCourseAnswerEntryIds.map(function (entryId) {
                  var cName = "";
                  if (this.props.answerEntryId) {
                    if (this.props.answerEntryId == entryId) {
                      cName = this.props.doCourseSuccess ? "success" : "wrong";
                    }
                  }
                  return React.createElement(
                    "button",
                    { className: cName,
                      key: entryId, "data-id": entryId,
                      onClick: this.answerClick },
                    this.props.entries[entryId].dest
                  );
                }, this)
              ),
              React.createElement(
                "button",
                { disabled: this.props.doCourseSuccess === null,
                  onClick: this.dispatchNewItem },
                "Next"
              )
            );
            break;
          case "DEST_SRC_CHOOSE":
            editArea = React.createElement(
              "div",
              null,
              React.createElement(
                "div",
                null,
                "DEST: ",
                doCourseEntry.dest
              ),
              React.createElement(
                "div",
                null,
                this.props.doCourseAnswerEntryIds.map(function (entryId) {
                  var cName = "";
                  if (this.props.answerEntryId) {
                    if (this.props.answerEntryId == entryId) {
                      cName = this.props.doCourseSuccess ? "success" : "wrong";
                    }
                  }
                  return React.createElement(
                    "button",
                    { className: cName,
                      key: entryId, "data-id": entryId,
                      onClick: this.answerClick },
                    this.props.entries[entryId].src
                  );
                }, this)
              ),
              React.createElement(
                "button",
                { disabled: this.props.doCourseSuccess === null,
                  onClick: this.dispatchNewItem },
                "Next"
              )
            );
            break;
          case "SRC_DEST_WRITE":
            var cName = "";
            if (this.props.doCourseSuccess === true) {
              cName = "success";
            } else if (this.props.doCourseSuccess === false) {
              cName = "wrong";
            }
            editArea = React.createElement(
              "div",
              null,
              React.createElement(
                "div",
                null,
                "SRC: ",
                doCourseEntry.src
              ),
              React.createElement("input", { className: cName, placeholder: "dest", autoFocus: true, type: "text",
                ref: function (el) {
                  if (el) {
                    el.focus();
                  }
                },
                onChange: this.onChange, value: this.state.answer }),
              React.createElement(
                "button",
                { disabled: this.state.answer.length == 0, onClick: this.onSave },
                "Save"
              ),
              React.createElement(
                "button",
                { disabled: this.props.doCourseSuccess === null,
                  onClick: this.dispatchNewItem },
                "Next"
              )
            );
            break;
          case "DEST_SRC_WRITE":
            var cName = "";
            if (this.props.doCourseSuccess === true) {
              cName = "success";
            } else if (this.props.doCourseSuccess === false) {
              cName = "wrong";
            }
            editArea = React.createElement(
              "div",
              null,
              React.createElement(
                "div",
                null,
                "DEST: ",
                doCourseEntry.dest
              ),
              React.createElement("input", { className: cName, placeholder: "dest", autoFocus: true, type: "text",
                ref: function (el) {
                  if (el) {
                    el.focus();
                  }
                },
                onChange: this.onChange, value: this.state.answer }),
              React.createElement(
                "button",
                { disabled: this.state.answer.length == 0, onClick: this.onSave },
                "Save"
              ),
              React.createElement(
                "button",
                { disabled: this.props.doCourseSuccess === null,
                  onClick: this.dispatchNewItem },
                "Next"
              )
            );
            break;
        }
        return React.createElement(
          "div",
          null,
          React.createElement(
            "div",
            null,
            this.props.course.title
          ),
          editArea,
          React.createElement(
            "button",
            { onClick: this.onBack },
            "Back"
          ),
          React.createElement(
            "button",
            {
              disabled: this.props.course.count_attempt_success == 0 && this.props.course.count_attempt_failure == 0,
              onClick: this.onReset },
            "Reset"
          )
        );
      } else {
        return React.createElement(
          "div",
          null,
          React.createElement(
            "div",
            null,
            "Course finished!"
          ),
          React.createElement(
            "button",
            {
              disabled: this.props.course.count_attempt_success == 0 && this.props.course.count_attempt_failure == 0,
              onClick: this.onReset },
            "Reset"
          )
        );
      }
    }
  });
})(window);