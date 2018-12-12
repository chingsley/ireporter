# ireporter Africa
[![Build Status](https://travis-ci.com/chingsley/ireporter.svg?branch=develop)](https://travis-ci.com/chingsley/ireporter)

[![Coverage Status](https://coveralls.io/repos/github/chingsley/ireporter/badge.svg?branch=develop)](https://coveralls.io/github/chingsley/ireporter?branch=develop)

A web app that enables citizens to bring corruption or crisis to the notice of the appropriate authorities and the general public.

## Getting Started

Make sure you have NodeJS (_>8.12.0_), NPM (_>6.4.1_)

#### Clone the project repo and cd into it:

```bash
git clone https://github.com/chingsley/ireporter.git && cd ireporter
```

#### Install the project dependencies:

```bash 
npm install
```

#### Setup required environmental variables
create a file named `.env`.  Include in it the variable: PORT=[YOUR CHOICE OF PORT]

#### Run the app

```bash
npm start
```

## Using postman, check out the follwoing endpoints

| Endpoint                      | Functionality            | Notes  										 	   				                  |
| ----------------------------- | ----------------------   | ---------------------------------------------------------|
| POST /auth/signup             | Registers a User         |                                                          |
| POST /redflags                | create a new record      |                                                          |
| GET /redflags                 | Get all records          |                                                          |
| GET /redflags/:id             | Get a particular record  |                                                          |
| PATCH /redflags/:id/location  | Edit a record's location | A user can only edit his own record, and no one else's   |
| PATCH /redflags/:id/comment   | Edit a redflag's comment | A user can only edit his own record, and no one else's   |
| DELETE /redflags/:id          | Delete a record          | A user can only delete his own record, and no one else's |


### required Payload

* `POST /api/v1/auth/signup`
* Heroku => [heroku link](https://desolate-beyond-57360.herokuapp.com/api/v1/redflags)

```json
{
  "firstname": "User's first name", [required a minimum of 2 characters]
  "email": "User's valid email", [required]
  "password": "User's password", [required, a minimum of 6 characters ]
  "phoneNumber": "User's phoneNumber", [required]
  "lastnames": "User's last name", 
  "othernames": "User's other names", 
  "username": "Preferred username", [required]
}
```

*`POST /api/v1/redflags`
* Heroku => [heroku link](https://desolate-beyond-57360.herokuapp.com/api/v1/redflags)
```json
{
  "email": "user email", [required]
  "type": "red-flag", [required]
  "location": "latitude,longitude", [required]
  "comment": "User's comment", [required]
  "Image": ["array of uploaded images"], 
  "Video": ["array of uploaded videos"] 
}
```

* `PATCH /redflags/:id/location`
* Heroku => [heroku link](https://desolate-beyond-57360.herokuapp.com/api/v1/redflags)

```json
{
  "email": "user email", [required]
  "location": "latitude,longitude, [required]
}
```

* `PATCH /redflags/:id/comment`
* Heroku => [heroku link](https://desolate-beyond-57360.herokuapp.com/api/v1/redflags)

```json
{
  "email": "user email", [required]
  "comment": "User's comment", [required]
}
```

* `DELETE /redflags/:id`
* Heroku => [heroku link](https://desolate-beyond-57360.herokuapp.com/api/v1/redflags)

```json
{
  "email": "user email", [required]
}
```

## Running Tests locally

```bash
npm test
```
... from the command line


## Deployment

* UI Templates => [GitHub Pages](https://chingsley.github.io/gh-pages/login.html) 

* Heroku => [heroku link](https://desolate-beyond-57360.herokuapp.com/api/v1/redflags) 


## Tecnologies Used

* [Node JS](https://nodejs.org/en/) (_v8.12.0_) 
* [Expressjs](https://expressjs.com/)
* [Babel](https://babeljs.io/)
* [Mocha](https://mochajs.org/) + [Chai](https://www.chaijs.com/) for testing
* [ESLint](https://eslint.org/)
