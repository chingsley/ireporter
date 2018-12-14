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
| POST /auth/login              | login a User         |                                                          |
| POST /red-flags               | create a new record      |                                                          |
| GET /red-flags                | Get all records          |                                                          |
| GET /red-flags/:id            | Get a particular record  |                                                          |
| PATCH /red-flags/:id/location | Edit a record's location | A user can only edit his own record, and no one else's   |
| PATCH /red-flags/:id/comment  | Edit a redflag's comment | A user can only edit his own record, and no one else's   |
| PATCH /red-flags/:id/comment  | Edit a redflag's comment | A user can only edit his own record, and no one else's   |
| DELETE /red-flags/:id         | Delete a record          | A user can only delete his own record, and no one else's |
| ----------------------------- | ----------------------   | ---------------------------------------------------------|
| POST /interventions           | create a new record      |                                                          |
| GET /interventions            | Get all records          |                                                          |
| GET /interventions/:id        | Get a particular record  |                                                          |
| PATCH /interventions/:id/location| Edit location         | A user can only edit his own record, and no one else's   |
| PATCH /interventions/:id/comment | Edit comment          | A user can only edit his own record, and no one else's   |
| DELETE /interventions/:id     | Delete a record          | A user can only delete his own record, and no one else's |


### required Payload

* `POST /api/v1/auth/signup`

```json
{
  "firstname": "User's first name  [required a minimum of 2 characters]",
  "email": "User's valid email [required]", 
  "password": "User's password [required, a minimum of 6 characters ]", 
  "phoneNumber": "User's phoneNumber [required]", 
  "lastnames": "User's last name", 
  "othernames": "User's other names", 
  "username": "Preferred username", 
}
```

*`POST /api/v1/red-flags`
```json
{
  "location": "latitude,longitude [required]", 
  "comment": "User's comment [required]", 
  "Image": ["array of uploaded images"], 
  "Video": ["array of uploaded videos"] 
}
```

*`POST /api/v1/interventions`
```json
{
  "location": "latitude,longitude",
  "comment": "User's comment",
  "Image": ["array of uploaded images"], 
  "Video": ["array of uploaded videos"] 
}
```

* `PATCH /red-flags/:id/location`

```json
{
  "location": "latitude,longitude, [required]"
}
```


* `PATCH /red-flags/:id/commet`

```json
{
  "comment": "some valid comment [required]"
}
```

* `PATCH /interventions/:id/location`

```json
{
  "location": "latitude,longitude, [required]"
}
```


* `PATCH /interventions/:id/commet`

```json
{
  "comment": "some valid comment [required]"
}
```


* `PATCH /interventions/:id/status`

```json
{
  "status": "under-investigation"
}
```

* `PATCH /red-flags/:id/status`

```json
{
  "status": "resolved"
}
```

* `DELETE /redflags/:id`

* `DELETE /interventions/:id`


## Running Tests locally

```bash
npm test
```
... from the command line


## Deployment

* UI Templates => [GitHub Pages](https://chingsley.github.io/gh-pages) 

* Heroku => [heroku link](https://ireporter-db.herokuapp.com) 

* Apiary => [Apiary link](https://ireporter11.docs.apiary.io/#)


## Tecnologies Used

* [Node JS](https://nodejs.org/en/) (_v8.12.0_) 
* [Expressjs](https://expressjs.com/)
* [Babel](https://babeljs.io/)
* [Mocha](https://mochajs.org/) + [Chai](https://www.chaijs.com/) for testing
* [ESLint](https://eslint.org/)
* [Postgres](https://www.postgresql.org/)
