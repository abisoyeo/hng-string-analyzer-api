# HNG String Analyzer API

This is a RESTful API built for the HNG Internship Stage 1 Task (String Analyzer).
It allows you to analyze strings and store their computed properties in a MongoDB database.

---

## Features

- Analyze strings to compute:

  - `length` (including whitespace)
  - `is_palindrome` (case-insensitive)
  - `unique_characters` count
  - `word_count`
  - `sha256_hash` for unique identification
  - `character_frequency_map` (count of each character)

- Store analyzed strings in MongoDB
- Fetch strings with **filtering** (e.g., palindrome, min/max length, word count, contains character)
- Natural language filtering (e.g., `"all single word palindromic strings"`)
- Implements rate limiting to prevent abuse
- Supports environment-based configuration via `.env`

---

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/abisoyeo/hng-string-analyzer-api
cd hng-string-analyzer-api
npm install
```

---

## Running the Application

### Development mode

Runs with nodemon (auto restarts on file changes):

```bash
npm run dev
```

### Production mode

```bash
npm start
```

The server runs on the port defined in your `.env` file (defaults to 3000).

---

## Environment Variables

Create a `.env` file in the project root and include the following:

```
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/HngStringAnalyzerDB
```

---

## Dependencies

| Package                                                                | Description                                           |
| ---------------------------------------------------------------------- | ----------------------------------------------------- |
| [axios](https://www.npmjs.com/package/axios)                           | Promise-based HTTP client for Node.js                 |
| [dotenv](https://www.npmjs.com/package/dotenv)                         | Load environment variables from `.env`                |
| [express](https://www.npmjs.com/package/express)                       | Web framework for Node.js                             |
| [express-rate-limit](https://www.npmjs.com/package/express-rate-limit) | Middleware for rate limiting                          |
| [http-errors](https://www.npmjs.com/package/http-errors)               | Create standardized HTTP errors                       |
| [joi](https://www.npmjs.com/package/joi)                               | Schema validation for requests                        |
| [mongoose](https://www.npmjs.com/package/mongoose)                     | MongoDB object modeling                               |
| [nodemon](https://www.npmjs.com/package/nodemon)                       | Automatically restart Node.js apps during development |
| [crypto](https://nodejs.org/api/crypto.html)                           | Node.js built-in module for hashing strings           |

---

## API Endpoints

### `POST /strings` — Create / Analyze String

**Request Body:**

```json
{
  "value": "string to analyze"
}
```

**Success Response (201 Created):**

```json
{
  "id": "<sha256_hash_value>",
  "value": "string to analyze",
  "properties": {
    "length": 17,
    "is_palindrome": false,
    "unique_characters": 12,
    "word_count": 3,
    "sha256_hash": "<sha256_hash_value>",
    "character_frequency_map": {
      "s": 2,
      "t": 3,
      "r": 2
    }
  },
  "created_at": "2025-08-27T10:00:00Z"
}
```

**Error Responses:**

- `409 Conflict`: String already exists
- `400 Bad Request`: Missing `"value"` field
- `422 Unprocessable Entity`: `"value"` must be a string

---

### `GET /strings` — Get All Strings with Filtering

**Query Parameters (all optional):**

- `is_palindrome` — boolean (`true` or `false`)
- `min_length` — integer (minimum string length)
- `max_length` — integer (maximum string length)
- `word_count` — integer (exact word count)
- `contains_character` — string (single character to search for)

**Success Response (200 OK):**

```json
{
  "data": [
    {
      "id": "<sha256_hash_value>",
      "value": "string1",
      "properties": {
        /* ... */
      },
      "created_at": "2025-08-27T10:00:00Z"
    }
  ],
  "count": 1,
  "filters_applied": {
    "is_palindrome": true,
    "min_length": 5,
    "contains_character": "a"
  }
}
```

**Error Response:**

- `400 Bad Request`: Invalid query parameter values or types

---

### `GET /strings/filter-by-natural-language` — Natural Language Filtering

**Query Parameters:**

- `query` — string describing the filter, e.g.:

  - `"all single word palindromic strings"`
  - `"strings longer than 10 characters"`
  - `"strings containing the letter z"`

**Success Response (200 OK):**

```json
{
  "data": [
    /* array of matching strings */
  ],
  "count": 3,
  "interpreted_query": {
    "original": "all single word palindromic strings",
    "parsed_filters": {
      "word_count": 1,
      "is_palindrome": true
    }
  }
}
```

**Error Responses:**

- `400 Bad Request`: Unable to parse natural language query
- `422 Unprocessable Entity`: Query parsed but resulted in conflicting filters

---

### `GET /strings/:value` — Fetch String by Value

Fetch an analyzed string using the original string value.

**Success Response (200 OK):**

```json
{
  "id": "<sha256_hash_value>",
  "value": "string1",
  "properties": {
    /* ... */
  },
  "created_at": "2025-08-27T10:00:00Z"
}
```

**Error Response:**

- `404 Not Found`: String not found

---

### `DELETE /strings/:value` — Delete String

Delete a string from the system using the original string value.

**Success Response (204 No Content)**

**Error Response:**

- `404 Not Found`: String not found
