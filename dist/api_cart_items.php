<?php
// api_cart_items.php

header('Content-Type: application/json');
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

// Database Connection
$conn = mysqli_connect('localhost', 'root', '', 'cos30043');
mysqli_set_charset($conn, 'utf8');

$table = "cart_items";

// Helper function to send error response
function sendError($message, $code = 400) {
    http_response_code($code);
    echo json_encode(['success' => false, 'message' => $message]);
    exit;
}

if ($method === 'POST') {
    // Add a product to a cart. If the product already exists, it increments the quantity.
    $cart_id = intval($input['cart_id'] ?? 0);
    $product_id = mysqli_real_escape_string($conn, $input['product_id'] ?? '');
    $quantity = intval($input['quantity'] ?? 1); // Default to adding 1
    // Details needed for creating a new item entry
    $product_name = mysqli_real_escape_string($conn, $input['product_name'] ?? '');
    $price = floatval($input['price'] ?? 0);
    $img = mysqli_real_escape_string($conn, $input['img'] ?? '');

    if (!$cart_id || !$product_id || $quantity <= 0) {
        sendError('Missing or invalid fields: cart_id, product_id, and quantity are required.');
    }

    // Check if the item already exists in the cart
    $sql_check = "SELECT id, quantity FROM `$table` WHERE cart_id = $cart_id AND product_id = '$product_id'";
    $result_check = mysqli_query($conn, $sql_check);
    
    if (mysqli_num_rows($result_check) > 0) {
        // Item exists, so update its quantity
        $row = mysqli_fetch_assoc($result_check);
        $item_id = $row['id'];
        $new_quantity = $row['quantity'] + $quantity;
        $sql_update = "UPDATE `$table` SET quantity = $new_quantity WHERE id = $item_id";
        
        if (mysqli_query($conn, $sql_update)) {
            echo json_encode(['success' => true, 'message' => 'Item quantity updated in cart.']);
        } else {
            sendError('Failed to update item quantity.', 500);
        }
    } else {
        // Item does not exist, so insert a new record
        if (!$product_name || $price <= 0) {
             sendError('Missing product details for new item: product_name and price are required.');
        }
        $sql_insert = "INSERT INTO `$table` (cart_id, product_id, product_name, price, img, quantity) 
                       VALUES ($cart_id, '$product_id', '$product_name', $price, '$img', $quantity)";
        
        if (mysqli_query($conn, $sql_insert)) {
            $item_id = mysqli_insert_id($conn);
            echo json_encode(['success' => true, 'message' => 'Item added to cart.', 'item_id' => $item_id]);
        } else {
            sendError('Failed to add item to cart.', 500);
        }
    }
    mysqli_close($conn);
    exit;
}

if ($method === 'GET') {
    // Get all items for a specific cart_id
    $cart_id = intval($_GET['cart_id'] ?? 0);
    if (!$cart_id) {
        sendError('cart_id is required as a query parameter.');
    }

    $result = mysqli_query($conn, "SELECT * FROM `$table` WHERE cart_id = $cart_id");
    $items = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $items[] = $row;
    }

    echo json_encode(['success' => true, 'items' => $items]);
    mysqli_close($conn);
    exit;
}

if ($method === 'PUT') {
    // Update a specific cart item's quantity. If quantity is 0 or less, delete the item.
    $id = intval($input['id'] ?? 0); // This is the cart_items.id (primary key)
    $quantity = intval($input['quantity'] ?? -1); // Use -1 to detect if not provided

    if (!$id || $quantity < 0) {
        sendError('Item ID (id) and a non-negative quantity are required in the request body.');
    }

    if ($quantity > 0) {
        // Update the quantity for the given item
        $sql = "UPDATE `$table` SET quantity = $quantity WHERE id = $id";
        if (mysqli_query($conn, $sql) && mysqli_affected_rows($conn) > 0) {
            echo json_encode(['success' => true, 'message' => 'Item quantity updated.']);
        } else {
            sendError('Failed to update item quantity or item not found.', 500);
        }
    } else {
        // Quantity is 0, so remove the item from the cart
        $sql = "DELETE FROM `$table` WHERE id = $id";
        if (mysqli_query($conn, $sql) && mysqli_affected_rows($conn) > 0) {
            echo json_encode(['success' => true, 'message' => 'Item removed from cart.']);
        } else {
            sendError('Failed to remove item or item not found.', 500);
        }
    }
    mysqli_close($conn);
    exit;
}

if ($method === 'DELETE') {
    // Delete a specific cart item by its ID, regardless of quantity
    $id = intval($input['id'] ?? 0); // This is the cart_items.id (primary key)

    if (!$id) {
        sendError('Item ID (id) is required in the request body.');
    }

    $sql = "DELETE FROM `$table` WHERE id = $id";
    if (mysqli_query($conn, $sql)) {
        if (mysqli_affected_rows($conn) > 0) {
            echo json_encode(['success' => true, 'message' => 'Item removed from cart.']);
        } else {
            sendError('Item not found.', 404);
        }
    } else {
        sendError('Failed to remove item.', 500);
    }
    mysqli_close($conn);
    exit;
}

sendError('Method not supported.', 405);
?>