# Simple bug reporter

[![npm version](https://badge.fury.io/js/simple-bug-reporter.svg)](https://badge.fury.io/js/simple-bug-reporter)

## Description
This project is a very simple ReactJS bar allowing a user to easily send feedbacks/bugs. It could be useful for
developpers working on a React application project, wanting to gather a client feedbacks/bugs easily, by email with some
information to debug (message describing the bug, screenshot with annotation, variables).
It is now available in two languages : French and English.

## Demo

### React application with bug reporter bar
![React application demo](https://github.com/haroal/simple-bug-reporter/raw/master/gif/simple-bug-reporter_client.gif)

### Mail received containing the report
![Mail with report](https://github.com/haroal/simple-bug-reporter/raw/master/gif/simple-bug-reporter_mail.gif)

## Installation

This package needs 2 parts : the client part, which is a React component to add to your React application, and a server
part which will store feedbacks/bugs into a MongoDB database and send them by email.

To install the React component for the client part : 
```bash
# In your React project
$ npm install --save simple-bug-reporter
```

To run the server part : 
```bash
$ git clone git@github.com/haroal/simple-bug-reporter.git
$ cd simple-bug-reporter/server
$ cp .env.example .env
# Fill your information into the .env file

# Using docker
$ docker-compose up
 
# OR -----------------------------------------------
 
# Without docker
$ npm install
$ npm start
```

**WARNING**: If you use a Gmail to send the emails, be sure you have allowed third-party application to use it (cf
https://nodemailer.com/usage/using-gmail/)

## Usage

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
        <BugReporter name="test" serverURL="http://localhost:4000/" data={{ "store": {}, "props": this.props, "state": {} }} />
      </div>
    );
  }
}

export default App;
```

## Props

- **name** (required) : name of your bug reporter to identify it if your use multiple bug reporters

- **serverURL** (required) : the simple-bug-reporter server part URL

- **annotationColor** (default: 'rgba(255, 0, 0, 0.7)') : the color of the annotation used to indicate an element

- **annotationRadius** (default: 5) : the size of the point used to indicate an element

- **dev** (default: true) : boolean indicating if you are in dev mode. Set to false to hide the simple-bug-reporter bar.

- **lang** (default: 'en') : string indicating the language to use ('en' for English or 'fr' for French)

- **screenshotQuality** (default: 0.6) : quality of the JPEG screenshot (between 0 and 1, higher is better quality but increase size)

- NEW: **data** (default: {}) : any data object that you want to send with the report (ie. the Redux store or the component props)
