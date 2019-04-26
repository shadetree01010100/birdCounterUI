import React from 'react';
import { Navbar } from '@nio/ui-kit';

import '../assets/app.scss';
import Routes from './routes';

const App = () => (
  <div>
    <Navbar id="app-nav" dark fixed="top" expand="md">
      <div className="navbar-brand">
        <div id="logo" />
      </div>
    </Navbar>
    <div id="app-container">
      <Routes />
    </div>
  </div>
);

export default App;
