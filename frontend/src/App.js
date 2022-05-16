import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Web3ReactProvider } from '@web3-react/core'
import Web3 from 'web3'
import PrivateRoute from "./utils/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";
import Dashboard from "./views/Dashboard";
import SignIn from "./views/SignIn";
import SignUp from "./views/SignUp";

import "./index.css";

function getLibrary(provider) {
  return new Web3(provider)
}

function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Router>
        <div className="flex flex-col min-h-screen overflow-hidden">
          <AuthProvider>
            <Switch>
              <PrivateRoute exact component={Dashboard} path="/" />
              {/*<PrivateRoute component={ProtectedPage} path="/protected" exact />*/}
              <Route component={SignIn} path="/login" />
              <Route component={SignUp} path="/register" />
            </Switch>
          </AuthProvider>
        </div>
      </Router>
    </Web3ReactProvider>
  );
}

export default App;