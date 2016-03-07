(function (win) {

  var App = React.createClass({
    displayName: "App",

    propTypes: {
      store: React.PropTypes.shape({
        dispatch: React.PropTypes.func,
        subscribe: React.PropTypes.func,
        getState: React.PropTypes.func
      })
    },
    componentWillMount: function () {
      var me = this;
      this.props.store.subscribe(function () {
        me.setState(me.props.store.getState());
      });
    },
    componentDidMount: function () {
      this.props.store.dispatch({
        type: "SELECT_COURSES"
      });
    },
    getInitialState: function () {
      return this.props.store.getState();
    },
    onMain: function () {
      this.props.store.dispatch({
        type: "SELECT_COURSES"
      });
    },
    render: function () {
      var screen = null;
      var course = this.state.courseId ? this.state.courses[this.state.courseId] : {};
      var entry = this.state.entryId ? this.state.entries[this.state.entryId] : {};
      var progressSpinner = this.state.inRequest ? React.createElement(
        "div",
        { id: "inProgress" },
        "Busy!"
      ) : "";
      var errorDialog = this.state.error ? React.createElement(ErrorDialog, {
        error: this.state.error,
        store: this.props.store }) : "";
      var successDialog = this.state.success ? React.createElement(SuccessDialog, {
        success: this.state.success,
        store: this.props.store }) : "";
      switch (this.state.screen) {
        case "ENTRIES_SCREEN":
          screen = React.createElement(EntriesScreen, {
            forceBackToMainScreen: this.state.forceBackToMainScreen,
            store: this.props.store,
            course: course,
            entry: entry,
            onMain: this.onMain,
            entries: this.state.entries });
          break;
        case "COURSE_SCREEN":
          screen = React.createElement(CourseScreen, {
            onMain: this.onMain,
            store: this.props.store,
            course: course });
          break;
        case "DO_COURSE_SCREEN":
          screen = React.createElement(DoCourseScreen, {
            answer: this.state.answer,
            doCourseEntryId: this.state.doCourseEntryId,
            doCourseAnswerEntryIds: this.state.doCourseAnswerEntryIds,
            doCourseTestType: this.state.doCourseTestType,
            answerEntryId: this.state.answerEntryId,
            doCourseSuccess: this.state.doCourseSuccess,
            forceBackToMainScreen: this.state.forceBackToMainScreen,
            store: this.props.store,
            onMain: this.onMain,
            entries: this.state.entries,
            success: this.state.success,
            implicitCourseId: this.state.implicitCourseId,
            course: course });
          break;
        default:
          screen = React.createElement(CoursesList, {
            store: this.props.store,
            courses: this.state.courses });
          break;
      }
      return React.createElement(
        "div",
        null,
        screen,
        progressSpinner,
        errorDialog,
        successDialog
      );
    }
  });

  win.StorageDB.ready().then(function () {
    win.initStore(win.StorageDB);
    ReactDOM.render(React.createElement(App, { store: win.Store }), win.document.getElementById("app"));
  }).catch(function (error) {
    alert(error);
  });
})(window);