# Share-a-Meal RESTful API

Welcome to the Share-a-Meal RESTful API! This API was developed by Zaid Karmoudi for the Programming 4 course. With this API, you can manage users and meals, allowing different users to create and share meals.

## Features

-   **User Management**: Create, update, delete, and fetch user information.
-   **Meal Management**: Create, update, delete, and fetch meal information.

## API Endpoints

Here are the currently available API endpoints:

### User Endpoints

-   **Login**:

    -   `POST ${Hostlocation}/api/login`

-   **User Information**:
    -   `GET ${Hostlocation}/api/info`
    -   `GET ${Hostlocation}/api/user`
    -   `POST ${Hostlocation}/api/user`
    -   `GET ${Hostlocation}/api/user/${userid}`
    -   `DELETE ${Hostlocation}/api/user/${userid}`
    -   `PUT ${Hostlocation}/api/user/${userid}`

### Meal Endpoints

-   **Create a Meal**:
    -   `POST ${Hostlocation}/api/meal`
-   **Update a Meal**:
    -   `PUT ${Hostlocation}/api/meal/:mealId`
-   **Get All Meals**:
    -   `GET ${Hostlocation}/api/meal`
-   **Get Meal by ID**:
    -   `GET ${Hostlocation}/api/meal/:mealId`
-   **Delete Meal by ID**:
    -   `DELETE ${Hostlocation}/api/meal/:mealId`

## Installation

To install the necessary dependencies, run:

```bash
npm install
```

## Running the Server

To start the server, use:

```bash
npm start
```

## Usage

Once the server is running, you can use tools like Postman or cURL to make requests to the API endpoints. Replace `${Hostlocation}` with the actual host location (e.g., `http://localhost:3000`).

## Example Requests

### Login

```bash
POST ${Hostlocation}/api/login
```

### Fetch User Info

```bash
GET ${Hostlocation}/api/info
```

### Manage Users

-   **Fetch all users**:

    ```bash
    GET ${Hostlocation}/api/user
    ```

-   **Create a new user**:

    ```bash
    POST ${Hostlocation}/api/user
    ```

-   **Fetch a specific user by ID**:

    ```bash
    GET ${Hostlocation}/api/user/${userid}
    ```

-   **Delete a user by ID**:

    ```bash
    DELETE ${Hostlocation}/api/user/${userid}
    ```

-   **Update a user by ID**:
    ```bash
    PUT ${Hostlocation}/api/user/${userid}
    ```

### Manage Meals

-   **Create a new meal**:

    ```bash
    POST ${Hostlocation}/api/meal
    ```

-   **Update a meal by ID**:

    ```bash
    PUT ${Hostlocation}/api/meal/:mealId
    ```

-   **Fetch all meals**:

    ```bash
    GET ${Hostlocation}/api/meal
    ```

-   **Fetch a specific meal by ID**:

    ```bash
    GET ${Hostlocation}/api/meal/:mealId
    ```

-   **Delete a meal by ID**:
    ```bash
    DELETE ${Hostlocation}/api/meal/:mealId
    ```

## Contact

For any questions or feedback, please contact Zaid Karmoudi.

---

Thank you for using the Share-a-Meal RESTful API!
