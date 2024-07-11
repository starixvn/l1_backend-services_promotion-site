const {
  React,
  ReactDOM
} = window;
const App = () => {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", null, AppInitialState.message), /*#__PURE__*/React.createElement("p", null, "This is a React component rendered within a Handlebars template."));
};
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render( /*#__PURE__*/React.createElement(App, null));