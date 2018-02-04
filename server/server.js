const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

if (!process.env.MONGODB_URI || !process.env.MAIL_ADDRESS) {
  throw new Error('Missing environment variable(s) : MONGODB_URI and MAIL_ADDRESS must be defined.')
}

mongoose.connect(process.env.MONGODB_URI, (err) => {
  if (err) { throw err }
})

const reportSchema = new mongoose.Schema({
  clientName: String,
  message: String,
  screenshot: String,
  reduxStore: String,
  createdAt: { type: Date, default: Date.now }
})

const ReportModel = mongoose.model('reports', reportSchema)

const app = express()
app.set('port', process.env.PORT || 4000)

app.use(bodyParser.json({ limit: '5mb' }))
app.use(helmet())

const allowCrossDomain = (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')
  res.setHeader('Access-Control-Allow-Credentials', true)

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204)
  } else {
    next()
  }
}

app.use(allowCrossDomain)

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sender.email@gmail.com',
    pass: 'password'
  }
})

app.post('/', (req, res) => {
  const report = new ReportModel({
    clientName: req.body.clientName,
    message: req.body.message
  })

  if (req.body.screenshot) {
    report.screenshot = req.body.screenshot
  }

  if (req.body.reduxStore) {
    report.reduxStore = req.body.reduxStore
  }

  report.save((err, savedReport) => {
    if (err) {
      return res.status(500).end('Error while saving data into the MongoDB database.')
    }

    console.log(`[${savedReport.createdAt}] Report from ${savedReport.clientName} saved.`)
  })

  const mailOptions = {
    from: 'bug-reporter@node.com',
    to: process.env.MAIL_ADDRESS,
    subject: `${report.clientName} - Bug reported`,
    html: `
      <h3>Bug reported for "${report.clientName}"</h3>
      <p>Message: ${report.message}</p>
      <img src="cid:screenshot@bug-reporter.com" alt="Screenshot"/>
      <p>Store redux : ${report.reduxStore ? report.reduxStore : '-'}</p>
    `,
    attachments: [{
      filename: 'screenshot.jpeg',
      path: report.screenshot,
      cid: 'screenshot@bug-reporter.com'
    }]
  }

  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      console.log('ERROR', err)
    } else {
      console.log('Mail sent')
    }
  })

  return res.sendStatus(201)
})

app.all('*', (req, res) => {
  return res.sendStatus(404)
})

app.listen(app.get('port'), () => {
  console.log(`Bug reporter server on port #${app.get('port')}`) // eslint-disable-line no-console
})

module.exports = app;
