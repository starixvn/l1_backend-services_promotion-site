const { React, ReactDOM } = window;

const App = () => {
  return (
    <div>
      <h1>{AppInitialState.message}</h1>
      <p>This is a React component rendered within a Handlebars template.</p>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);