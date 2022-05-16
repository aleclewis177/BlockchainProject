import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import PrivateRoute from "./utils/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";
import Home from "./views/homePage";
import SignIn from "./views/SignIn";
import SignUp from "./views/SignUp";

import "./index.css";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen overflow-hidden">
        <AuthProvider>
          <Switch>
            <Route exact component={Home} path="/" />
            {/*<PrivateRoute component={ProtectedPage} path="/protected" exact />*/}
            <Route component={SignIn} path="/login" />
            <Route component={SignUp} path="/register" />
          </Switch>
        </AuthProvider>
      </div>
    </Router>
  );
}

export default App;