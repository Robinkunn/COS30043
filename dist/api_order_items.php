<?php
header("Access-Control-Allow-Origin: https://pizzahat.web.app"); 
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

// $conn = mysqli_connect('localhost', 'root', '', 'cos30043');
$conn = mysqli_connect('sql102.infinityfree.com', 'if0_39191103', 'Rctz20041', 'if0_39191103_pizzahatdb');

mysqli_set_charset($conn, 'utf8');

$table = "order_items";

// Helper function to send error response
function sendError($message, $code = 400) {
    http_response_code($code);
    echo json_encode(['success' => false, 'message' => $message]);
    exit;
}

if ($method === 'POST') {
    // Add order items
    $order_id = intval($input['order_id'] ?? 0);
    $items = $input['items'] ?? [];

    if (!$order_id || !is_array($items) || empty($items)) {
        sendError('Invalid order_id or items.');
    }

    $success = true;
    foreach ($items as $item) {
        $product_id = mysqli_real_escape_string($conn, $item['product_id'] ?? '');
        $product_name = mysqli_real_escape_string($conn, $item['product_name'] ?? '');
        $price = floatval($item['price'] ?? 0);
        $quantity = intval($item['quantity'] ?? 0);
        $img = mysqli_real_escape_string($conn, $item['img'] ?? '');

        if (!$product_id || !$product_name || $price <= 0 || $quantity <= 0) {
            $success = false;
            break;
        }

        $sql = "INSERT INTO `$table` (order_id, product_id, product_name, price, quantity, img)
                VALUES ($order_id, '$product_id', '$product_name', $price, $quantity, '$img')";
        
        if (!mysqli_query($conn, $sql)) {
            $success = false;
            break;
        }
    }

    echo json_encode(['success' => $success, 'message' => $success ? 'Order items added.' : 'Failed to insert items.']);
    mysqli_close($conn);
    exit;
}

if ($method === 'GET') {
    // Get items by order_id
    $order_id = intval($_GET['order_id'] ?? 0);
    if (!$order_id) {
        sendError('order_id is required.');
    }

    $result = mysqli_query($conn, "SELECT * FROM `$table` WHERE order_id = $order_id");
    $items = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $items[] = $row;
    }

    echo json_encode(['success' => true, 'items' => $items]);
    mysqli_close($conn);
    exit;
}

if ($method === 'PUT') {
    // Update all items for an order (replace all items)
    $order_id = intval($input['order_id'] ?? 0);
    $items = $input['items'] ?? [];

    if (!$order_id || !is_array($items)) {
        sendError('Invalid order_id or items.');
    }

    // Delete existing items for this order
    mysqli_query($conn, "DELETE FROM `$table` WHERE order_id = $order_id");

    $success = true;
    foreach ($items as $item) {
        $product_id = mysqli_real_escape_string($conn, $item['product_id'] ?? '');
        $product_name = mysqli_real_escape_string($conn, $item['product_name'] ?? '');
        $price = floatval($item['price'] ?? 0);
        $quantity = intval($item['quantity'] ?? 0);
        $img = mysqli_real_escape_string($conn, $item['img'] ?? '');

        if (!$product_id || !$product_name || $price <= 0 || $quantity <= 0) {
            $success = false;
            break;
        }

        $sql = "INSERT INTO `$table` (order_id, product_id, product_name, price, quantity, img)
                VALUES ($order_id, '$product_id', '$product_name', $price, $quantity, '$img')";
        if (!mysqli_query($conn, $sql)) {
            $success = false;
            break;
        }
    }

    echo json_encode(['success' => $success, 'message' => $success ? 'Order items updated.' : 'Failed to update items.']);
    mysqli_close($conn);
    exit;
}

if ($method === 'DELETE') {
    // Delete an order item
    parse_str(file_get_contents("php://input"), $input);
    $id = intval($input['id'] ?? 0);
    $order_id = intval($input['order_id'] ?? 0);

    if (!$id) {
        sendError('Item ID is required.');
    }

    // Verify the item belongs to the specified order (if order_id provided)
    if ($order_id) {
        $check = mysqli_query($conn, "SELECT id FROM `$table` WHERE id = $id AND order_id = $order_id");
        if (mysqli_num_rows($check) === 0) {
            sendError('Item not found in specified order.', 404);
        }
    }

    $sql = "DELETE FROM `$table` WHERE id = $id";
    if (mysqli_query($conn, $sql)) {
        echo json_encode(['success' => true, 'message' => 'Order item deleted.']);
    } else {
        sendError('Failed to delete order item.', 500);
    }
    mysqli_close($conn);
    exit;
}

sendError('Method not supported.', 405);
?>