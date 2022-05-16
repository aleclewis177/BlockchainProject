import React, { useContext } from "react";
import UserInfo from "../components/UserInfo";
import AuthContext from "../context/AuthContext";

const Home = () => {
  const { user } = useContext(AuthContext);
  return (
    <section>
      {user && <UserInfo user={user} />}
      <h1>Dashboard Page</h1>
    </section>
  );
};

export default Home;