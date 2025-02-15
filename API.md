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
  "email": "john@email.com"
}
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
