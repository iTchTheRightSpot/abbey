# Abbey Fullstack Assessment

## Description

For this particular challenge, we want to present a process that will be similar to your
working process here at Abbey. Your task is to implement a full-stack application that
contains the following:

- Authentication (Login/Logout, Session handling)
- Accounts (User ability to store and retrieve information specific to their account)
- Relationships (Connections between users of some form i.e. friends, followers, peers, etc.)

You are given a complete license in how you choose to implement this and what the application
is for. You may host this application using any service you'd like. The expectation is not for
this to be a production ready application but more-so an opportunity to see how you think through
architectural problems. It is more important to have something functional from backend to frontend
rather than having the latest libraries and overly complex code that is hard to read or debug,
so please keep this in mind when completing your submission. Make it as simple as possible, while
sticking to firm and consistent aesthetic choices.

## Requirement

1. Production ready code publicly hosted on GitHub.
2. A video demoing the application - frontend (browser) / backend (postman) / mobile (emulator).

## Implemented Functionalities

1. **Authentication**:

   - **Registration**, **Login**, **Logout**.
     - JWT authorization using Auth0 middleware for secure authentication.

2. **User Account Management**:

   - Users can **update** and **retrieve** their account details.
   - Users can **retrieve** a list of other registered users.

3. **Social Interaction**:
   - Users can **follow** and **unfollow** each other.
   - If **both users follow each other**, they automatically become **friends**.
   - If **user1 unfollows user2**, **user2 is no longer considered a friend** of user1.
   - A user can retrieve a list of all their friends, people they are following, or their followers.

## Pre-requisite

1. Node version 20 or greater installed.
2. Docker or PostgreSQL installed.

## Clone

1. `git clone https://github.com/iTchTheRightSpot/abbey.git`
2. `cd abbey`

## Configure app

1. Create public & private keys using the command
   `openssl genrsa -out keys/private.key 2048 && openssl rsa -in keys/private.key -pubout -out keys/public.key`.
2. Create the `.env` file.
3. Copy the following into the file
   ```
   NODE_ENV=development
   PORT=4000
   UI_URL=*
   DB_DATABASE=abbey_db
   DB_USERNAME=abbey
   DB_PASSWORD=abbey
   DB_PORT=5432
   DB_HOST=localhost
   PRIV_KEY_PATH='./keys/private.key'
   PUB_KEY_PATH='./keys/public.key'
   ```
4. You can replace the database name & credentials if necessary.

## Run app using Docker

1. Uncomment `api` service.
2. Run `docker compose up -d` and you are all set.

## Run app without Docker

1. Install the necessary dependencies by running the command `npm i`.
2. Assuming PostgreSQL is up and running, run database migration:
   - `DATABASE_URL=postgres://<DB_USERNAME>:<DB_PASSWORD>@localhost:<DB_PORT>/<DB_DATABASE> npm run migrate up`.
3. Run `npm run start` to start the app (app runs on PORT 4000 by default).

## Test

1. After database base migration, run `npm run test` to run test.

## [Api documentation](./API.md)
