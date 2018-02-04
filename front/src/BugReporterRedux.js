import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import html2canvas from 'html2canvas';
import axios from 'axios';

import './bug-reporter.css';

class BugReporter extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      message: '',
      screenshotChecked: true,
      selectElementMode: false,
      element: null,
      loading: false
    };

    this.onMessageChange = this.onMessageChange.bind(this);
    this.onScreenshotCheck = this.onScreenshotCheck.bind(this);
    this.registerClick = this.registerClick.bind(this);
    this.setSelectElementMode = this.setSelectElementMode.bind(this);
    this.submit = this.submit.bind(this);
    this.cancel = this.cancel.bind(this);
  }

  onMessageChange(event) {
    this.setState({
      message: event.target.value
    });
  }

  onScreenshotCheck(event) {
    this.setState({
      screenshotChecked: event.target.checked
    });
  }

  setSelectElementMode() {
    this.setState({
      selectElementMode: true
    });
  }

  registerClick(event) {
    this.setState({
      selectElementMode: false,
      element: {
        x: event.nativeEvent.clientX,
        y: event.nativeEvent.clientY
      }
    });
  }

  async submit() {
    const { message, element } = this.state;
    let dataScreenshot;

    this.setState({
      loading: true
    });

    try {
      if (this.state.screenshotChecked) {
        const canvas = await html2canvas(document.body);
        if (element) {
          const context = canvas.getContext('2d');
          context.beginPath();
          context.arc(element.x, element.y, this.props.annotationRadius, 0, 2 * Math.PI, false);
          context.fillStyle = this.props.annotationColor;
          context.fill();
        }

        dataScreenshot = canvas.toDataURL('image/jpeg', this.props.screenshotQuality);
      }

      const reduxStore = JSON.stringify(this.props.store);

      await axios.post(this.props.serverURL, {
        clientName: this.props.name,
        message,
        screenshot: dataScreenshot,
        reduxStore
      });

      alert('Rapport envoyé.');

    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue lors de l'envoi du rapport de bug.");
    }

    this.setState({
      message: '',
      screenshotChecked: true,
      element: null,
      loading: false
    });
  }

  cancel() {
    this.setState({
      message: '',
      screenshotChecked: true,
      element: null
    });
  }

  render() {
    if (!this.props.dev) {
      return null;
    }

    return (
      <div id="bug-reporter" className={classNames({ 'bug-reporter-loader': this.state.loading })}>
        <div className="title">
          Bug reporter
        </div>

        <div className="field-group message-input">
          <label htmlFor="message">Message</label>
          <textarea
            type="text"
            id="message"
            name="message"
            rows="1"
            value={this.state.message}
            onChange={this.onMessageChange}
          />
        </div>

        <div className="field-group screenshot-input">
          <input
            type="checkbox"
            id="screenshot"
            name="screenshot"
            disabled={this.state.message === ''}
            checked={this.state.screenshotChecked}
            onChange={this.onScreenshotCheck}
          />
          <label htmlFor="screenshot">
            Inclure une capture d&apos;écran
          </label>
        </div>

        <div className="field-group select-input">
          <button
            type="button"
            disabled={this.state.message === '' || !this.state.screenshotChecked}
            onClick={this.setSelectElementMode}
          >
            { this.state.element ? "Modifier l'élément" : 'Indiquer un élément' }
          </button>
        </div>

        <div className="buttons-group">
          <div className="field-group submit-input">
            <button
              type="button"
              disabled={this.state.message === ''}
              onClick={this.submit}
            >
              Envoyer
            </button>
          </div>

          <div className="field-group cancel-input">
            <button
              type="button"
              onClick={this.cancel}
            >
              Annuler
            </button>
          </div>
        </div>

        <div
          className={classNames('overlay', { hidden: !this.state.selectElementMode })}
          onClick={this.registerClick}
          role="presentation"
        >
          <div className="overlay-text">
            Cliquer sur l&apos;élément
          </div>
        </div>
      </div>
    );
  }

}

BugReporter.defaultProps = {
  annotationColor: 'rgba(255, 0, 0, 0.7)',
  annotationRadius: 5,
  dev: true,
  screenshotQuality: 0.6
};

BugReporter.propTypes = {
  annotationColor: PropTypes.string,
  annotationRadius: PropTypes.number,
  dev: PropTypes.bool,
  name: PropTypes.string.isRequired,
  screenshotQuality: PropTypes.number,
  serverURL: PropTypes.string.isRequired,
  store: PropTypes.object.isRequired
};

function mapStateToProps(state) {
  return {
    store: state
  };
}

export default connect(mapStateToProps)(BugReporter);
