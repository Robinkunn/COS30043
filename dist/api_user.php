<?php
// Handle CORS & preflight (OPTIONS) requests first
header("Access-Control-Allow-Origin: https://pizzahat.web.app");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

// Immediately exit for OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}


// get the HTTP method, path and body of the request
$method = $_SERVER['REQUEST_METHOD'];
$request = explode('/', trim($_SERVER['PATH_INFO'] ?? '','/'));
$input = json_decode(file_get_contents('php://input'),true);  // json string to associative array(true)
if ($method === 'GET' && empty($fld)) {
    echo json_encode(['success' => true, 'message' => 'API is working on InfinityFree!']);
    exit;
}

// connect to the mysql database, provide the appropriate credentials
// $conn = mysqli_connect('localhost', 'root', '', 'cos30043');
$conn = mysqli_connect('sql102.infinityfree.com', 'if0_39191103', 'Rctz20041', 'if0_39191103_pizzahatdb');

mysqli_set_charset($conn,'utf8');

// initialise the table name accordingly
$table = "users";

// retrieve the search key field name and value from the path
$fld = preg_replace('/[^a-z0-9_]+/i','',array_shift($request));
$key = array_shift($request);

// --- API logic ---
if ($method === 'POST') {
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

    // Change user password
    if (isset($_GET['action']) && $_GET['action'] === 'change_password') {
        // Expect JSON input
        $username = mysqli_real_escape_string($conn, $input['username'] ?? '');
        $currentPassword = mysqli_real_escape_string($conn, $input['currentPassword'] ?? '');
        $newPassword = mysqli_real_escape_string($conn, $input['newPassword'] ?? '');

        // Validate input
        if (!$username || !$currentPassword || !$newPassword) {
            echo json_encode(['success' => false, 'message' => 'All password fields are required.']);
            mysqli_close($conn);
            exit;
        }

        // Check if the current password is correct
        $sql_check = "SELECT password FROM `$table` WHERE username='$username'";
        $result_check = mysqli_query($conn, $sql_check);

        if (mysqli_num_rows($result_check) > 0) {
            $user = mysqli_fetch_assoc($result_check);
            if ($user['password'] === $currentPassword) {
                // Current password is correct, update to new password
                // For a real application, you should hash the new password
                // $hashedNewPassword = password_hash($newPassword, PASSWORD_DEFAULT);
                $sql_update = "UPDATE `$table` SET password='$newPassword' WHERE username='$username'";
                if (mysqli_query($conn, $sql_update)) {
                    echo json_encode(['success' => true, 'message' => 'Password changed successfully!']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Error updating password.']);
                }
            } else {
                // Incorrect current password
                echo json_encode(['success' => false, 'message' => 'Incorrect current password.']);
            }
        } else {
            // User not found
            echo json_encode(['success' => false, 'message' => 'User not found.']);
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