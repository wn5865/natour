<h1 align="center">
  <br>
  <a href="https://natours-jiwon.herokuapp.com/">
    <img src="https://github.com/wn5865/natour/blob/main/public/img/logo-green-round.png" alt="Natours" width="100">
  </a>
  Natours
</h1>

<h4 align="center">An awesome tour booking site built on top of <a href="https://nodejs.org/en/" target="_blank">NodeJS</a>.</h4>

<p align="center">
 <a href="#deployed-version">Demo</a> •
 <a href="#key-features">Key Features</a> •
 <a href="#demonstration">Demonstration</a> •
 <a href="#how-to-use">How To Use</a> •
 <a href="#api-usage">API Usage</a> •
 <a href="#deployment">Deployment</a> •
 <a href="#build-with">Build With</a> •
 <a href="#to-do">To-do</a> •
 <a href="#installation">Installation</a> • 
 <a href="#known-bugs">Known Bugs</a> • 
 <a href="#future-updates">Future Updates</a> • 
 <a href="#acknowledgement">Acknowledgement</a>
</p>

## Acknowledgement

- This project is part of the online course by Jonas Schmedtmann on Udemy, which
  is definitely one of the best lectures I've ever taken. Many thanks to his
  well-organized and passionate lectures. Link to the course: [Node.js, Express,
  MongoDB & More: The Complete Bootcamp
  2019](https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/)

- The project in this repo was built upon the final product of the course. I
  supplemented by adding features that was proposed by the challenges given at the
  end of Jonas' course.

## Overview

- Natours is a full stack web application where users can purchase, review, and
  bookmark tour packages. Administators can manage tours and users through admin
  pages restricted to them.

## Deployed Version

Link to Natours deployed on Heroku 👉 https://natours-jiwon.herokuapp.com/

## Built With

- Natours was built by using Node.js, Express, MongoDB on the back-end and
  JavaScript, Pug on the front-end. All the tools used to build this website
  are as below:

- Backend

  - [Node.js](https://nodejs.org/en/) - JS runtime environment
  - [Express](http://expressjs.com/) - The web framework used

- DB

  - [Mongoose](https://mongoosejs.com/) - Object Data Modelling (ODM) library
  - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - Cloud database service

- Frontend

  - [Pug](https://pugjs.org/api/getting-started.html) - High performance template engine

- Security

  - [JSON Web Token](https://jwt.io/) - Security token

- Others
  - [Axios](https://axios-http.com/) - Promise based HTTP client for the browser and Node.js
  - [ParcelJS](https://parceljs.org/) - Blazing fast, zero configuration web application bundler
  - [Postman](https://www.getpostman.com/) - API platform
  - [Stripe](https://stripe.com/) - Online payment API
  - [Mapbox GL JS](https://www.mapbox.com/mapbox-gljs) - JavaScript library for vector maps on the web
  - [Mailtrap](https://mailtrap.io/) - Email delivery platform
  - [Heroku](https://www.heroku.com/) - Cloud platform

## Key Features

- Authentication and Authorization
  - Sign up, login and logout
  - Role-based athorization to APIs and pages
- Tour
  - Provide detailed information about tours
  - Purchase and review tours
  - Manage your bookings and bookmarks
- User profile
  - Update username, photo, email, and password
- Credit card payment powered by Stripe

## Demonstration

#### Home Page :

![natoursHomePageonline-video-cutt](https://user-images.githubusercontent.com/58518192/72606801-7ebe0680-3949-11ea-8e88-613f022a64e5.gif)

#### Tour Details :

![tourOverviewonline-video-cutterc](https://user-images.githubusercontent.com/58518192/72606859-a0b78900-3949-11ea-8f0d-ef44c789957b.gif)

#### Payment Process :

![paymentprocess-1-ycnhrceamp4-7fW](https://user-images.githubusercontent.com/58518192/72606973-d9eff900-3949-11ea-9a2e-f84a6581bef3.gif)

#### Booked Tours :

![rsz_bookedtours](https://user-images.githubusercontent.com/58518192/72607747-6a7b0900-394b-11ea-8b9f-5330531ca2eb.png)

#### User Profile :

![rsz_userprofile](https://user-images.githubusercontent.com/58518192/72607635-44edff80-394b-11ea-8943-64c48f6f19aa.png)

#### Admin Profile :

![rsz_adminprofile](https://user-images.githubusercontent.com/58518192/72607648-4d463a80-394b-11ea-972f-a73160cfaa5b.png)

## How To Use

### Sign up and log in

- First sign up and login to Natours
- You're gonna get a welcome email from Natours if your email address is valid
- You can go to user profile page through the link in the email

### Book a tour

- Decide what tour you want to purchase
- Select a date when the tours starts
- Book a tour
- Proceed to the checkout page
- Enter the payment details (no actual transaction occurs):
  ```
  - Card No. : 4242 4242 4242 4242 (valid card number for test mode)
  - Expiry date: any future dates
  - CVV: any 3-digit numbers
  ```
- Check your email to confirm that the booking was successful

### Manage your booking

- Check the tour you have booked in "My Bookings" page.
- You'll be automatically redirected to this page after you have completed the booking.

### Leave a review

- Once you've booked a tour, write a review on the tour in "My Bookings" page
- You can edit or delete your reviews
- Your reviews will be shown in the middle of tour details pages

### Bookmark tours

- In tour details pages, click bookmark button on the top
- Go to your account profile
- Check your bookmarks in 'My Bookmarks' page

### Update your profile

- You can update your own username, profile photo, email and password.

## API Usage

- Natours API is authorized based on user roles: 'user', 'guide', 'lead-guide', 'admin'
- Most GET requests for tours are available without authentication
- Mostly, POST and DELTE request are restricted to admin user
- Some featured APIs are as follows:

<b> API Features: </b>

Tours List 👉 https://natours-jiwon.herokuapp.com/api/v1/tours

Tour Stats By Difficulty 👉 https://natours-jiwon.herokuapp.com/api/v1/tours/tour-stats

Get Top 5 (Cheapest and Highest-reated) Tours 👉 https://natours-jiwon.herokuapp.com/api/v1/tours/top-5-cheap

Get Tours Within Radius (Tours within 200 miles from (lat 34, lng -118)) 👉 https://natours-jiwon.herokuapp.com/api/v1/tours/tours-within/200/center/34,-118/unit/mi

For more information, check [Natours API Documentation](https://documenter.getpostman.com/view/8689170/SVmzvwpY?version=latest).

## To-do

- Searching
  - Allow users to search tours based on tour name, price, tour date, etc.
  - Allow admins to search users using name and email.
- Pagination
  - Although pagination already exists as an API feature, it's not being utilized on the frontend
- Admin pages
  - Currently, administrators can CRUD (create, read, update, delete) tours and users in "Manage Tours" and "Manage Users" pages
  - For administrators, implement “Manage” pages, where they can CRUD reviews and bookings
- Advanced authentication features
  - Confirm user email, login with refresh token, two-factor authentication
