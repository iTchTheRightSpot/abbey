# API documentation

## Public routes

### POST Register

```
/api/v1/auth/register

{
    "name": "John Doe",
    "dob": "01/01/2000",
    "email": "john@email.com",
    "password": "Password123#$%"
}
```

### POST LOGIN

```
/api/v1/auth/login

{
    "email": "john@email.com",
    "password": "Password123#$%"
}
```

## Private routes
