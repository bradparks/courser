(function(win) {
  
  var testTypes = ["SRC_DEST", "DEST_SRC"];

  win.DoCourseScreen = React.createClass({
    getTestType : function() {
      var index = Math.floor(Math.random() * testTypes.length);
      return testTypes[index];
    },
    getEntry : function(entries) {
      var ids = [];
      for (var key in entries) {
        if (!entries[key].attempt_success || entries[key].attempt_success < entries[key].attempt_failure) {
          ids.push(key);
        }
      }
      if (ids.length) {
        var index = Math.floor(Math.random() * ids.length);
        return entries[ids[index]];
      }
      return {id : 0};
    },
    getInitialState : function() {
      return Object.assign({
        answer : "",
        testType : this.getTestType()
      }, this.getEntry(this.props.entries));
    },
    componentWillReceiveProps : function(nextProps) {
      this.setState(Object.assign({
        answer : "",
        testType : this.getTestType()
      }, this.getEntry(nextProps.entries)));
    },
    onSave : function() {
      var entry = Object.assign({}, this.state);
      var success = false;
      switch (this.state.testType) {
        case "SRC_DEST":
          success = entry.answer == entry.dest;
        break;
        case "DEST_SRC":
          success = entry.answer == entry.src;
        break;
      }
      delete entry.answer;
      delete entry.testType;
      this.props.store.dispatch({
        type : "REQUEST_SAVE_ANSWER",
        value : entry,
        success : success,
        forceBackToMainScreen : this.props.forceBackToMainScreen
      });
    },
    onChange : function(e) {
      this.setState({answer : e.target.value});
    },
    onBack : function() {
      if (!this.props.forceBackToMainScreen) {
        this.props.store.dispatch({
          type : "SHOW_COURSE_SCREEN"
        });
      } else {
        this.props.onMain();
      }
    },
    onReset : function() {
      this.props.store.dispatch({
        type : "REQUEST_RESET",
        value : this.props.course.id,
        forceBackToMainScreen : this.props.forceBackToMainScreen
      });
    },
    render : function() {
      if (this.state.id) {
        var editArea = null;
        switch (this.state.testType) {
          case "SRC_DEST":
            editArea = (
              <div>
                <div>SRC: {this.state.src}</div>
                <input autoFocus={true} type="text"
                  ref={function(el) {
                    if (el) {
                      el.focus();
                    }
                  }}
                  onChange={this.onChange} value={this.state.answer} />
                <button onClick={this.onSave}>Save</button>
              </div>
            );
          break;
          case "DEST_SRC":
            editArea = (
              <div>
                <div>DEST: {this.state.dest}</div>
                <input autoFocus={true} type="text"
                  ref={function(el) {
                    if (el) {
                      el.focus();
                    }
                  }}
                  onChange={this.onChange} value={this.state.answer} />
                <button onClick={this.onSave}>Save</button>
              </div>
            );
          break;
        }
        return (
          <div>
            <div>{this.props.course.title}</div>
            {editArea}
            <button onClick={this.onBack}>Back</button>
          </div>
        );
      } else {
        return (
          <div>
            <div>Course finished!</div>
            <button onClick={this.onReset}>Reset</button>
          </div>
        );
      }
    }
  });

}(window));