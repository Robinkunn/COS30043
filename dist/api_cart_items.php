<?php
// api_cart_items.php
header("Access-Control-Allow-Origin: https://pizzahat.web.app"); 
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');
$method = $_SERVER['REQUEST_METHOD'];

function getInput() {
    $contentType = $_SERVER["CONTENT_TYPE"] ?? '';
    if (stripos($contentType, 'application/json') !== false) {
        return json_decode(file_get_contents('php://input'), true);
    } else {
        // For form data or x-www-form-urlencoded
        return $_POST ?: [];
    }
}
$input = getInput();

// Database Connection
// $conn = mysqli_connect('localhost', 'root', '', 'cos30043');
$conn = mysqli_connect('sql102.infinityfree.com', 'if0_39191103', 'Rctz20041', 'if0_39191103_pizzahatdb');

mysqli_set_charset($conn, 'utf8');

$table = "cart_items";

// Helper function to send error response
function sendError($message, $code = 400) {
    http_response_code($code);
    echo json_encode(['success' => false, 'message' => $message]);
    exit;
}

if ($method === 'POST' && isset($input['_method']) && $input['_method'] === 'UPDATE') {
    // Update a specific cart item's quantity. If quantity is 0 or less, delete the item.
    $id = intval($input['id'] ?? 0); // cart_items.id
    $quantity = intval($input['quantity'] ?? -1);

    if (!$id || $quantity < 0) {
        sendError('Item ID (id) and a non-negative quantity are required in the request body.');
    }

    if ($quantity > 0) {
        $sql = "UPDATE `$table` SET quantity = $quantity WHERE id = $id";
        if (mysqli_query($conn, $sql) && mysqli_affected_rows($conn) > 0) {
            echo json_encode(['success' => true, 'message' => 'Item quantity updated.']);
        } else {
            sendError('Failed to update item quantity or item not found.', 500);
        }
    } else {
        // If quantity is 0 or less, delete the item
        $sql = "DELETE FROM `$table` WHERE id = $id";
        if (mysqli_query($conn, $sql) && mysqli_affected_rows($conn) > 0) {
            echo json_encode(['success' => true, 'message' => 'Item removed from cart.']);
        } else {
            sendError('Failed to remove item or item not found.', 500);
        }
    }
    mysqli_close($conn);
    exit;
} elseif ($method === 'POST' && isset($input['_method']) && $input['_method'] === 'DELETE') {
    // Delete a specific cart item by its ID
    $id = intval($input['id'] ?? 0);
    $cart_id = intval($input['cart_id'] ?? 0);

    if (!$id) {
        sendError('Item ID (id) is required in the request body.');
    }

    // Optionally, verify the item belongs to the specified cart (if cart_id provided)
    if ($cart_id) {
        $check = mysqli_query($conn, "SELECT id FROM `$table` WHERE id = $id AND cart_id = $cart_id");
        if (mysqli_num_rows($check) === 0) {
            sendError('Item not found in specified cart.', 404);
        }
    }

    $sql = "DELETE FROM `$table` WHERE id = $id";
    if (mysqli_query($conn, $sql)) {
        echo json_encode(['success' => true, 'message' => 'Item removed from cart.']);
    } else {
        sendError('Failed to remove item.', 500);
    }
    mysqli_close($conn);
    exit;
} elseif ($method === 'POST') {
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

sendError('Method not supported.', 405);
?>