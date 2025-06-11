<?php
// api_carts.php

header('Content-Type: application/json');
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

// Database Connection
// $conn = mysqli_connect('localhost', 'root', '', 'cos30043');
$conn = mysqli_connect('sql102.infinityfree.com', 'if0_39191103', 'Rctz20041', 'if0_39191103_pizzahatdb');

mysqli_set_charset($conn, 'utf8');

$table = "carts";

// Helper function to send error response
function sendError($message, $code = 400) {
    http_response_code($code);
    echo json_encode(['success' => false, 'message' => $message]);
    exit;
}

if ($method === 'GET') {
    // Get or Create a cart for a user, and return it with its items.
    // This is the primary endpoint for retrieving a user's cart.
    $user_id = mysqli_real_escape_string($conn, $_GET['user_id'] ?? '');

    if (!$user_id) {
        sendError('user_id is required as a query parameter.');
    }

    // Use a transaction to safely get or create the cart
    mysqli_begin_transaction($conn);

    try {
        // Step 1: Check if a cart already exists for the user
        $sql_check = "SELECT id FROM `$table` WHERE user_id = '$user_id'";
        $result_check = mysqli_query($conn, $sql_check);
        
        if (mysqli_num_rows($result_check) > 0) {
            // Cart exists, get its ID
            $cart_row = mysqli_fetch_assoc($result_check);
            $cart_id = $cart_row['id'];
        } else {
            // Cart does not exist, create a new one
            $sql_insert = "INSERT INTO `$table` (user_id) VALUES ('$user_id')";
            if (mysqli_query($conn, $sql_insert)) {
                $cart_id = mysqli_insert_id($conn);
            } else {
                throw new Exception('Failed to create a new cart.');
            }
        }

        // Step 2: Fetch the full cart details
        $sql_cart = "SELECT * FROM `$table` WHERE id = $cart_id";
        $result_cart = mysqli_query($conn, $sql_cart);
        $cart = mysqli_fetch_assoc($result_cart);

        // Step 3: Fetch all items associated with this cart
        $sql_items = "SELECT * FROM cart_items WHERE cart_id = $cart_id";
        $result_items = mysqli_query($conn, $sql_items);
        $items = [];
        while ($item_row = mysqli_fetch_assoc($result_items)) {
            $items[] = $item_row;
        }
        $cart['items'] = $items;

        // Commit the transaction and send the response
        mysqli_commit($conn);
        echo json_encode(['success' => true, 'cart' => $cart]);

    } catch (Exception $e) {
        mysqli_rollback($conn);
        sendError($e->getMessage(), 500);
    }

    mysqli_close($conn);
    exit;
}

if ($method === 'DELETE') {
    // Clear a user's cart by deleting the cart record.
    // The `ON DELETE CASCADE` constraint on the cart_items table will automatically remove all associated items.
    $user_id = mysqli_real_escape_string($conn, $input['user_id'] ?? '');

    if (!$user_id) {
        sendError('user_id is required in the request body.');
    }

    $sql = "DELETE FROM `$table` WHERE user_id = '$user_id'";
    
    if (mysqli_query($conn, $sql)) {
        if (mysqli_affected_rows($conn) > 0) {
            echo json_encode(['success' => true, 'message' => 'Cart and all its items cleared successfully.']);
        } else {
            // This is not an error; it just means the user had no cart to clear.
            echo json_encode(['success' => true, 'message' => 'No active cart found for the user to clear.']);
        }
    } else {
        sendError('Failed to clear cart.', 500);
    }

    mysqli_close($conn);
    exit;
}

// Any other method is not supported for the cart container itself.
// Cart modifications (adding/updating items) are handled by api_cart_items.php.
sendError('Method not supported.', 405);
?>