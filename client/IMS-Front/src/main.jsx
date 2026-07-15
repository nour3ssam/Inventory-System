import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom"
import { Provider } from "react-redux";
import { store } from "./store/store";

import "./styles/global.css"
import "./styles/variables.css"
import "./styles/reset.css"

import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
)
