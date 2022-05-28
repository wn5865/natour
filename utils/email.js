const nodemailer = require('nodemailer');
const pug = require('pug');
let aws = require('@aws-sdk/client-ses');
let { defaultProvider } = require('@aws-sdk/credential-provider-node');
const { convert } = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Jiwon Yoon <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    const ses = new aws.SES({
      apiVersion: '2010-12-01',
      region: 'ap-northeast-2',
      defaultProvider,
    });

    // create Nodemailer SES transporter
    return nodemailer.createTransport({ SES: { ses, aws } });
  }

  send(template, subject) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };

    // 3) Create a transport and send email
    this.newTransport().sendMail(mailOptions, (err, info) => {
      if (!info || err) {
        console.log('failed to send an email');
        console.log(err);
        return;
      }
      console.log(info.envelope);
      console.log(info.messageId);
    });
  }

  sendWelcome() {
    this.send('welcome', 'Welcome to the Natours Family!');
  }

  sendPasswordReset() {
    this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }

  sendBookingSuccess() {
    this.send('bookingSuccess', 'Your tour has been successfully booked');
  }

  sendBookingFail() {
    this.send('bookingFail', 'Your booking failed');
  }
};
