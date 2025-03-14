# `trimlink.org` API documentation

## Base URL

```
https://api.example.com
```

## Authentication

Most endpoints require authentication using a JWT token obtained through Supabase authentication.

**Headers for authenticated requests:**
```
Authorization: Bearer <your_jwt_token>
```

## Rate Limiting

- Standard endpoints: 15 requests per minute
- Link creation: 5 requests per minute

Exceeding these limits will result in a `429 Too Many Requests` response.

## Endpoints

### Create Short Link

Creates a new shortened URL.

**Endpoint:** `POST /api/links`

**Authentication:** Optional (Anonymous users allowed)

**Rate Limit:** 5 requests per minute

**Request Body:**
```json
{
  "originalUrl": "https://example.com/very/long/url/that/needs/shortening",
  "maxUses": 100,                   // Optional: maximum number of times the link can be used
  "expiryDate": "2023-12-31T23:59:59Z"  // Optional: ISO date when the link expires
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Shortened URL created successfully.",
  "data": {
    "user_id": "user-uuid",
    "short_code": "abc123",
    "original_url": "https://example.com/very/long/url/that/needs/shortening",
    "created_date": "2023-01-15T12:00:00Z",
    "expiry_date": "2023-12-31T23:59:59Z",
    "max_uses": 100,
    "visit_count": 0,
    "is_expired": false,
    "shortURL": "https://short.url/abc123"
  }
}
```

**Errors:**
- `400 Bad Request` - Invalid URL format or missing required fields
- `429 Too Many Requests` - Rate limit exceeded

### Get All User Links

Retrieves all links created by the authenticated user.

**Endpoint:** `GET /api/links`

**Authentication:** Required

**Rate Limit:** Standard (15 requests per minute)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Links retrieved successfully.",
  "data": [
    {
      "user_id": "user-uuid",
      "short_code": "abc123",
      "original_url": "https://example.com/url1",
      "created_date": "2023-01-15T12:00:00Z",
      "expiry_date": "2023-12-31T23:59:59Z",
      "max_uses": 100,
      "visit_count": 42,
      "is_expired": false
    },
    // More links...
  ]
}
```

**Errors:**
- `401 Unauthorized` - Missing or invalid authentication
- `429 Too Many Requests` - Rate limit exceeded

### Update Link

Updates the target URL of an existing shortened link.

**Endpoint:** `PUT /api/links/:shortCode`

**Authentication:** Required (Must be the link creator)

**Rate Limit:** Standard (15 requests per minute)

**URL Parameters:**
- `shortCode` - The short code of the link to update

**Request Body:**
```json
{
  "newUrl": "https://example.com/updated/destination"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Short URL updated successfully."
}
```

**Errors:**
- `400 Bad Request` - Invalid URL format
- `401 Unauthorized` - Missing authentication
- `403 Forbidden` - Not the link creator
- `404 Not Found` - Link not found
- `429 Too Many Requests` - Rate limit exceeded

### Delete Link

Marks a link as expired (soft delete).

**Endpoint:** `DELETE /api/links/:shortCode`

**Authentication:** Required (Must be the link creator)

**Rate Limit:** Standard (15 requests per minute)

**URL Parameters:**
- `shortCode` - The short code of the link to delete

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Short URL deleted successfully."
}
```

**Errors:**
- `401 Unauthorized` - Missing authentication
- `403 Forbidden` - Not the link creator
- `404 Not Found` - Link not found
- `429 Too Many Requests` - Rate limit exceeded

### Get Link Statistics

Retrieves usage statistics for a specific link.

**Endpoint:** `GET /api/links/:shortCode/stats`

**Authentication:** Required (Must be the link creator)

**Rate Limit:** Standard (15 requests per minute)

**URL Parameters:**
- `shortCode` - The short code of the link

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Link statistics retrieved successfully.",
  "data": {
    "visits": 42,
    "maxUses": 100,
    "isExpired": false
  }
}
```

**Errors:**
- `401 Unauthorized` - Missing authentication
- `403 Forbidden` - Not the link creator
- `404 Not Found` - Link not found
- `429 Too Many Requests` - Rate limit exceeded

### Redirect to Original URL

Redirects to the original URL associated with a short code.

**Endpoint:** `GET /:shortCode`

**Authentication:** None

**Rate Limit:** Standard (15 requests per minute)

**URL Parameters:**
- `shortCode` - The short code of the link

**Response:** `302 Found` (Redirects to the original URL)

**Errors:**
- `404 Not Found` - Link not found
- `410 Gone` - Link has expired or reached maximum usage
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Description of the error"
}
```

In development mode, errors will include a `stack` property with the error stack trace.