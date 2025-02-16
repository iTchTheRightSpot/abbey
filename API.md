# API documentation

## Public routes

### POST Register

Registers a new user.

**Endpoint:** /api/v1/auth/register

**Request Body:**

```json
{
  "name": "John Doe",
  "dob": "01/01/2000",
  "email": "john@email.com",
  "password": "Password123#$%"
}
```

Response:

- 201 Created: User successfully registered.
- 400 Bad Request: Missing or invalid parameters.
- 409 Conflict: Email already registered.

### POST LOGIN

Logs a user in and returns a JWT token.

**Endpoint:** /api/v1/auth/login

**Request Body:**

```json
{
  "email": "john@email.com",
  "password": "Password123#$%"
}
```

Response:

- 200 OK: Successful login. The response will contain a JSESSIONID cookie with the JWT.
  `Cookie: Set-Cookie: JSESSIONID=<jwt>`
- 401 Unauthorized: Invalid email or password.

## Private routes

### POST LOGOUT

Clears users cookie JWT:

**Endpoint:** /api/v1/auth/logout

Headers:

- Authorization: The request should include the JWT token in the cookie. For example:
  `Cookie: JSESSIONID=<jwt-value>`

Response:

- 204 No Content: Sets cookie max-age to -1 (browser clears the cookie).
- 401 Unauthorized: Missing or invalid JWT.

### GET ACCOUNT

Retrieves the authenticated user's account. Requires the user to have a valid JWT:

**Endpoint:** /api/v1/account

Headers:

- Authorization: The request should include the JWT token in the cookie. For example:
  `Cookie: JSESSIONID=<jwt-value>`

Response:

- 200 OK: Successfully fetched the account details for JWT.
- 401 Unauthorized: Missing or invalid JWT.
- 404 Not Found: Account not found for associated JWT.

```json
{
  "name": "John Doe",
  "dob": "01/01/2000",
  "email": "john@email.com",
  "user_id": "6f9f4360-bf97-4c69-947b-2a62a03a700d"
}
```

### GET ACCOUNTS

Retrieves all user's account. Requires the user to have a valid JWT:

**Endpoint:** /api/v1/accounts

Headers:

- Authorization: The request should include the JWT token in the cookie. For example:
  `Cookie: JSESSIONID=<jwt-value>`

Response:

- 200 OK: Successfully fetches all accounts in the database.
- 401 Unauthorized: Missing or invalid JWT.
- 404 Not Found: Error retrieving Accounts.

```json
[
  {
    "name": "John Doe",
    "dob": "01/01/2000",
    "email": "john@email.com",
    "user_id": "6f9f4360-bf97-4c69-947b-2a62a03a700d"
  },
  {
    "name": "Frank White",
    "dob": "01/01/1974",
    "email": "frank@email.com",
    "user_id": "3eb61359-7112-4ed8-9296-227ce62a05bc"
  }
]
```

### PATCH ACCOUNT

Updates the user's account. Requires the user to have a valid JWT:

**Endpoint:** /api/v1/account

**Request body:**

```json
{
  "name": "Frank White",
  "dob": "01/01/2001"
}
```

Headers:

- Authorization: The request should include the JWT token in the cookie. For example:
  `Cookie: JSESSIONID=<jwt-value>`

Response:

- 204 No Content: Updates account for JWT.
- 401 Unauthorized: Missing or invalid JWT.
- 404 Not Found: Account not found for associated JWT.
- 409 Conflict: If an error occurs updating account.

### POST RELATIONSHIP

Follow an account associated to request body user_id. Requires the user to have a valid JWT:

**Endpoint:** /api/v1/relationship

**Request body:**

```json
{
  "user_id": "6f9f4360-bf97-4c69-947b-2a62a03a700d"
}
```

Headers:

- Authorization: The request should include the JWT token in the cookie. For example:
  `Cookie: JSESSIONID=<jwt-value>`

Response:

- 201 No Content: User associated to JWT follows request body user_id.
- 401 Unauthorized: Missing or invalid JWT.
- 404 Not Found: Account not found for associated JWT or user_id.
- 400 Bad request: If user is attempting to follow his/herself or someone they already follow .
- 409 Conflict: If an error occurs following account associated to request body user_id.

### PATCH RELATIONSHIP

Unfollow an account associated to request body user_id. Requires the user to have a valid JWT:

**Endpoint:** /api/v1/relationship

**Request body:**

```json
{
  "user_id": "6f9f4360-bf97-4c69-947b-2a62a03a700d"
}
```

Headers:

- Authorization: The request should include the JWT token in the cookie. For example:
  `Cookie: JSESSIONID=<jwt-value>`

Response:

- 204 No Content: User associated to JWT unfollows request body user_id.
- 401 Unauthorized: Missing or invalid JWT.
- 404 Not Found: Account not found for associated JWT or user_id.
- 400 Bad request: If user is attempting to unfollow his/herself or someone they already do not follow.
- 409 Conflict: If an error occurs unfollowing account associated to request body user_id.

### GET RELATIONSHIPS

Retrieves accounts that have a relationships account with user. Requires the user to have a valid JWT & request parameter:

**Endpoint:** /api/v1/accounts?status=
**status:**

- FRIENDS
- FOLLOWING
- FOLLOWERS

Headers:

- Authorization: The request should include the JWT token in the cookie. For example:
  `Cookie: JSESSIONID=<jwt-value>`

Response:

- 200 OK: Successfully fetches all accounts.
- 401 Unauthorized: Missing or invalid JWT.
- 400 Bad Request: Invalid or missing request parameter.
- 500 Internal Server Error: Error parsing JWT in the request.

```json
[
  {
    "name": "John Doe",
    "dob": "01/01/2000",
    "email": "john@email.com",
    "user_id": "6f9f4360-bf97-4c69-947b-2a62a03a700d"
  },
  {
    "name": "Frank White",
    "dob": "01/01/1974",
    "email": "frank@email.com",
    "user_id": "3eb61359-7112-4ed8-9296-227ce62a05bc"
  }
]
```
