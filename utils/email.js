const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Jiwon Yoon <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
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
      if (err) return console.log(err);
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
