# Simple bug reporter
*Developped by Alexis ANNEIX on January 2018*

## Description
This project is a very simple ReactJS bar allowing a user to easily send feedbacks/bugs. It could be useful for developpers working on a React application project, wanting to gather a client feedbacks/bugs easily, by email with some information to debug (message describing the bug, screenshot with annotation, Redux store state if possible).
It is now available in two languages : French and English.

## Demo

### React application with bug reporter bar
![React application demo](https://github.com/haroal/simple-bug-reporter/raw/master/gif/simple-bug-reporter_client.gif)

### Mail received containing the report
![Mail with report](https://github.com/haroal/simple-bug-reporter/raw/master/gif/simple-bug-reporter_mail.gif)

## Installation

This package needs 2 parts : the client part, which is a React component to add to your React application, and a server part which will store feedbacks/bugs into a MongoDB database and send them by email.

To install the React component for the client part : 
```bash
# In your React project
$ npm install --save simple-bug-reporter
```

To run the server part : 
```bash
$ git clone git@github.com/haroal/simple-bug-reporter.git
$ cd simple-bug-reporter/server

# Using docker (you have to enter params into the docker-compose.yml file)
$ docker-compose up
 
# OR -----------------------------------------------
 
# Without docker
$ npm install
$ MONGODB_URI=mongodb://localhost/bug-reporter MAIL_ADDRESS=receiver@email.com npm start
```

## Usage

There is two different React components : a classical one (*BugReporter*)and a Redux one (*BugReporterRedux*). If you are using Redux into your application, I recommend you to use the Redux component to add the Redux store state in the report.

### Classical
```javascript
import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { BugReporter } from 'simple-bug-reporter';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <BugReporter name="test" serverURL="http://localhost:4000/" />
      </div>
    );
  }
}

export default App;
```

### Redux
```javascript
import React, { Component } from 'react';
import { connect } from 'react-redux';
import logo from './logo.svg';
import './App.css';
import { BugReporterRedux } from 'simple-bug-reporter';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <BugReporterRedux name="test" serverURL="http://localhost:4000/" />
      </div>
    );
  }
}

export default connect()(App);
```

## Props

- **name** (required) : name of your bug reporter to identify it if your use multiple bug reporters

- **serverURL** (required) : the simple-bug-reporter server part URL

- **annotationColor** (default: 'rgba(255, 0, 0, 0.7)') : the color of the annotation used to indicate an element

- **annotationRadius** (default: 5) : the size of the point used to indicate an element

- **dev** (default: true) : boolean indicating if you are in dev mode. Set to false to hide the simple-bug-reporter bar.

- NEW: **lang** (default: 'en') : string indicating the language to use ('en' for English or 'fr' for French)

- **screenshotQuality** (default: 0.6) : quality of the JPEG screenshot (between 0 and 1, higher is better quality but increase size)
