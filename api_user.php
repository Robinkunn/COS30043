<?php
// Reference:
// https://www.leaseweb.com/labs/2015/10/creating-a-simple-rest-api-in-php/

// Use this API for demonstration purposes only


// get the HTTP method, path and body of the request
$method = $_SERVER['REQUEST_METHOD'];
$request = explode('/', trim($_SERVER['PATH_INFO'] ?? '','/'));
$input = json_decode(file_get_contents('php://input'),true);  // json string to associative array(true)

// connect to the mysql database, provide the appropriate credentials
$conn = mysqli_connect('localhost', 'root', '', 'cos30043');
mysqli_set_charset($conn,'utf8');

// initialise the table name accordingly
$table = "users";

// retrieve the search key field name and value from the path
$fld = preg_replace('/[^a-z0-9_]+/i','',array_shift($request));
$key = array_shift($request);

// --- API logic ---
if ($method === 'POST') {
    // --- Save Cart Action ---
    if (isset($_GET['action']) && $_GET['action'] === 'save_cart') {
        $user_id = $input['user_id'] ?? null;
        // Get the cart_items as a raw JSON string
        $cart_items_json = isset($input['cart_items']) ? json_encode($input['cart_items']) : null;

        if (!$user_id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'User ID is required.']);
            mysqli_close($conn);
            exit;
        }

        // Use a prepared statement to prevent SQL injection
        $stmt = mysqli_prepare($conn, "UPDATE `$table` SET cart_items = ? WHERE id = ?");
        mysqli_stmt_bind_param($stmt, 'ss', $cart_items_json, $user_id);

        if (mysqli_stmt_execute($stmt)) {
            echo json_encode(['success' => true, 'message' => 'Cart saved successfully.']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to save cart.']);
        }
        mysqli_stmt_close($stmt);
        mysqli_close($conn);
        exit;
    }


    // Registration
    if (isset($_GET['action']) && $_GET['action'] === 'register') {
        // Expect JSON input
        $username = mysqli_real_escape_string($conn, $input['username'] ?? '');
        $name = mysqli_real_escape_string($conn, $input['name'] ?? '');
        $email = mysqli_real_escape_string($conn, $input['email'] ?? '');
        $phone = mysqli_real_escape_string($conn, $input['phone'] ?? '');
        $password = mysqli_real_escape_string($conn, $input['password'] ?? '');
        $address = $input['address'] ?? [];
        $street = mysqli_real_escape_string($conn, $address['street'] ?? '');
        $city = mysqli_real_escape_string($conn, $address['city'] ?? '');
        $state = mysqli_real_escape_string($conn, $address['state'] ?? '');
        $zip = mysqli_real_escape_string($conn, $address['zip'] ?? '');

        // Check if email already exists
        $check_email = mysqli_query($conn, "SELECT id FROM `$table` WHERE email='$email'");
        if (mysqli_num_rows($check_email) > 0) {
            echo json_encode(['success' => false, 'message' => 'Email already exists, please try another one.']);
            mysqli_close($conn);
            exit;
        }

        // Check if username already exists
        $check_username = mysqli_query($conn, "SELECT id FROM `$table` WHERE username='$username'");
        if (mysqli_num_rows($check_username) > 0) {
            echo json_encode(['success' => false, 'message' => 'Username already exists.']);
            mysqli_close($conn);
            exit;
        }

        // Insert new user
        // Generate a random 4-5 digit user ID with 'U_' prefix and ensure it's unique
        do {
            $user_id = 'U_' . rand(1000, 99999);
            $check_id = mysqli_query($conn, "SELECT id FROM `$table` WHERE id='$user_id'");
        } while (mysqli_num_rows($check_id) > 0);

        $sql = "INSERT INTO `$table` (id, username, name, email, phone, password, street, city, state, zip)
                VALUES ('$user_id', '$username', '$name', '$email', '$phone', '$password', '$street', '$city', '$state', '$zip')";
        if (mysqli_query($conn, $sql)) {
            echo json_encode(['success' => true, 'message' => 'Registration successful!']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Registration failed.']);
        }
        mysqli_close($conn);
        exit;
    }

    // Update user profile
    if (isset($_GET['action']) && $_GET['action'] === 'update_profile') {
        // Expect JSON input
        $username = mysqli_real_escape_string($conn, $input['username'] ?? '');
        $name = mysqli_real_escape_string($conn, $input['name'] ?? '');
        $email = mysqli_real_escape_string($conn, $input['email'] ?? '');
        $phone = mysqli_real_escape_string($conn, $input['phone'] ?? '');
        $address = $input['address'] ?? [];
        $street = mysqli_real_escape_string($conn, $address['street'] ?? '');
        $city = mysqli_real_escape_string($conn, $address['city'] ?? '');
        $state = mysqli_real_escape_string($conn, $address['state'] ?? '');
        $zip = mysqli_real_escape_string($conn, $address['zip'] ?? '');

        // Only update if username is provided
        if (!$username) {
            echo json_encode(['success' => false, 'message' => 'Username is required for update.']);
            mysqli_close($conn);
            exit;
        }

        $sql = "UPDATE `$table` SET 
                    name='$name',
                    email='$email',
                    phone='$phone',
                    street='$street',
                    city='$city',
                    state='$state',
                    zip='$zip'
                WHERE username='$username'";

        if (mysqli_query($conn, $sql)) {
            echo json_encode(['success' => true, 'message' => 'Profile updated successfully!']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to update profile.']);
        }
        mysqli_close($conn);
        exit;
    }

    // Login
    // Accept both application/x-www-form-urlencoded and JSON
    if (strpos($_SERVER["CONTENT_TYPE"] ?? '', 'application/json') !== false) {
        $username = $input['username'] ?? '';
        $password = $input['password'] ?? '';
    } else {
        $username = $_POST['username'] ?? '';
        $password = $_POST['password'] ?? '';
    }
    $username = mysqli_real_escape_string($conn, $username);
    $password = mysqli_real_escape_string($conn, $password);

    $sql = "SELECT * FROM `$table` WHERE username='$username' AND password='$password' LIMIT 1";
    $result = mysqli_query($conn, $sql);
    if ($user = mysqli_fetch_assoc($result)) {
        unset($user['password']); // Don't return password
        echo json_encode(['success' => true, 'message' => 'Login successful!', 'user' => $user]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid username or password.']);
    }
    mysqli_close($conn);
    exit;
}

// close mysql connection
mysqli_close($conn);
?>
