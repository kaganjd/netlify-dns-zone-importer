import React, { useState, useEffect } from "react";
import NetlifyAPI from "netlify";
import { csrfToken, parseHash, removeHash } from "./utils/auth";
import loginButton from "./assets/netlify-login-button.svg";
import "./App.css";
import ZoneForm from "./ZoneForm";

const App = (props) => {
  // authed response is a hashed url from auth-callback that includes:
  // - email
  // - full_name
  // - avatar
  // - csrf
  // - token
  const response = parseHash(window.location.hash);
  console.log("response: ", response);
  removeHash();

  const [accountSlug, setAccountSlug] = useState(null);
  const [user, setUser] = useState(response);
  // const [zones, setZones] = useState([])

  useEffect(() => {
    async function netlifyFetch() {
      const client = new NetlifyAPI(window.atob(user.token));
      // const zoneResponse = await client.getDnsZones({
      //   filter: 'all'
      // })
      // setZones(zoneResponse)
      const accountsResponse = await client.listAccountsForUser();
      setAccountSlug(accountsResponse[0].slug);
    }

    if (user) {
      if (!localStorage.getItem(user.csrf)) {
        alert("Token invalid. Please try to login again.");
        setUser(null);
        return;
      } else {
        localStorage.removeItem(user.csrf);
        netlifyFetch();
      }
    }
  }, [user]);

  const handleAuth = (e) => {
    e.preventDefault();
    const state = csrfToken();
    const { location, localStorage } = window;
    localStorage.setItem(state, "true");
    const redirectTo = `${location.origin}${location.pathname}`;
    window.location.href = `/.netlify/functions/auth-start?url=${redirectTo}&csrf=${state}`;
  };

  const handleLogout = (e) => {
    e.preventDefault();
    window.location.href = `/`;
  };

  /* Not logged in. Show login button */
  if (!user) {
    return (
      <div className="app">
        <h1>Netlify Zone File Uploader</h1>
        <button onClick={handleAuth}>
          <img
            alt="login to netlify"
            className="login-button"
            src={loginButton}
          />
        </button>
      </div>
    );
  }

  return (
    <div className="app">
      <h1>
        <span className="title-inner">
          Hi {user.full_name || "Friend"}
          <button className="primary-button" onClick={handleLogout}>
            Logout
          </button>
        </span>
      </h1>
      <div className="contents">
        <ZoneForm accountSlug={accountSlug} user={user} />
      </div>
    </div>
  );
};

export default App;
