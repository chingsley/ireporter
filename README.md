# ireporter Africa
[![Build Status](https://travis-ci.com/chingsley/ireporter.svg?branch=develop)](https://travis-ci.com/chingsley/ireporter)

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


### Required Payload

#### `POST /auth/signup`

```json
{
  "firstname": "User's first name", [REQUIRED A MINIMUN OF 2 CHARACTERS]
  "email": "User's valid email", [REQUIRED]
  "password": "User's password", [REQUIRED, A MINIMUM OF 6 CHARACTERS ]
  "phoneNumber": "User's phoneNumber", [REQUIRED]
  "lastnames": "User's last name", [OPTIONAL]
  "othernames": "User's other names", [OPTIONAL]
  "username": "Preferred username", [OPTIONAL]
}
```

#### `POST /redflags`

```json
{
  "email": "user email", [REQUIRED]
  "type": "red-flag", [REQUIRED]
  "location": "latitude,longitude", [REQUIRED]
  "comment": "User's comment", [REQUIRED]
  "Image": ["array of uploaded images"], [OPTIONAL]
  "Video": ["array of uploaded videos"] [OPTIONAL]
}
```

#### `PATCH /redflags/:id/location`

```json
{
  "email": "user email", [REQUIRED]
  "location": "latitude,longitude, [REQUIRED]
}
```

#### `PATCH /redflags/:id/location`

```json
{
  "email": "user email", [REQUIRED]
  "comment": "User's comment", [REQUIRED]
}
```

#### `DELETE /redflags/:id`

```json
{
  "email": "user email", [REQUIRED]
}
```

## Running Tests locally

```bash
npm test
```
... from the command line


## Deployment

* UI Templates => [GitHub Pages](https://chingsley.github.io/gh-pages/login.html) 


## Tecnologies Used

* [Node JS](https://nodejs.org/en/) (_v8.12.0_) 
* [Expressjs](https://expressjs.com/)
* [Babel](https://babeljs.io/)
* [Mocha](https://mochajs.org/) + [Chai](https://www.chaijs.com/) for testing
* [ESLint](https://eslint.org/)
