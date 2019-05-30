const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

if (!process.env.MONGODB_URI
  || !process.env.RECEIVER_MAIL_ADDRESS
  || !process.env.SENDER_MAIL_SMTP_SERVER
  || !process.env.SENDER_MAIL_SMTP_PORT
  || !process.env.SENDER_MAIL_SECURE
  || !process.env.SENDER_MAIL_USER
  || !process.env.SENDER_MAIL_PASSWORD) {
  throw new Error('Missing environment variable(s).')
}

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true }, (err) => {
  if (err) { throw err }
})

const reportSchema = new mongoose.Schema({
  clientName: String,
  message: String,
  screenshot: String,
  data: String,
  createdAt: { type: Date, default: Date.now }
})

const ReportModel = mongoose.model('reports', reportSchema)

const app = express()
app.set('port', process.env.PORT || 4000)

app.use(bodyParser.json({ limit: '10mb' }))
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
  host: process.env.SENDER_MAIL_SMTP_SERVER,
  port:  process.env.SENDER_MAIL_SMTP_PORT,
  secureConnection: process.env.SENDER_MAIL_SECURE,
  auth: {
    user: process.env.SENDER_MAIL_USER,
    pass: process.env.SENDER_MAIL_PASSWORD
  }
})

app.post('/', (req, res) => {
  const report = new ReportModel({
    clientName: req.body.clientName,
    message: req.body.message,
    data: req.body.data
  })

  if (req.body.screenshot) {
    report.screenshot = req.body.screenshot
  }

  report.save((err, savedReport) => {
    if (err) {
      return res.status(500).end('Error while saving data into the MongoDB database.')
    }

    console.log(`[${savedReport.createdAt}] Report from ${savedReport.clientName} saved.`)
  })

  const mailOptions = {
    from: 'bug-reporter@node.com',
    to: process.env.RECEIVER_MAIL_ADDRESS,
    subject: `${report.clientName} - Bug reported`,
    html: `
      <h3>Bug reported for "${report.clientName}"</h3>
      <p>Message: ${report.message}</p>
      <p>Data : ${report.data}</p>
      <img src="cid:screenshot@bug-reporter.com" alt="Screenshot"/>
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
