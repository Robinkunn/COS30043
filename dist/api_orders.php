<?php
header("Access-Control-Allow-Origin: https://pizzahat.web.app"); 
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');
$method = $_SERVER['REQUEST_METHOD'];
$request = explode('/', trim($_SERVER['PATH_INFO'] ?? '', '/'));
$input = json_decode(file_get_contents('php://input'), true);

// $conn = mysqli_connect('localhost', 'root', '', 'cos30043');
$conn = mysqli_connect('sql102.infinityfree.com', 'if0_39191103', 'Rctz20041', 'if0_39191103_pizzahatdb');

mysqli_set_charset($conn, 'utf8');

$table = "orders";

// Helper function to send error response
function sendError($message, $code = 400) {
    http_response_code($code);
    echo json_encode(['success' => false, 'message' => $message]);
    exit;
}

if ($method === 'POST') {
    // Create new order
    $user_id = mysqli_real_escape_string($conn, $input['user_id'] ?? '');
    $items = json_encode($input['items'] ?? []);
    $total_amount = floatval($input['total_amount'] ?? 0);
    $shipping = floatval($input['shipping'] ?? 0);
    $tax = floatval($input['tax'] ?? 0);

    if (!$user_id || !$items || $total_amount <= 0) {
        sendError('Missing or invalid fields.');
    }

    $sql = "INSERT INTO `$table` (user_id, items, total_amount, shipping, tax)
            VALUES ('$user_id', '$items', $total_amount, $shipping, $tax)";
    
    if (mysqli_query($conn, $sql)) {
        $order_id = mysqli_insert_id($conn);
        echo json_encode(['success' => true, 'message' => 'Order created successfully.', 'order_id' => $order_id]);
    } else {
        sendError('Failed to create order.', 500);
    }
    mysqli_close($conn);
    exit;
}

if ($method === 'GET') {
    // Get orders, optional: ?user_id=U_1234
    $user_id = mysqli_real_escape_string($conn, $_GET['user_id'] ?? '');

    $query = "SELECT * FROM `$table`";
    if ($user_id) {
        $query .= " WHERE user_id='$user_id'";
    }
    $result = mysqli_query($conn, $query);
    $orders = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $row['items'] = json_decode($row['items'], true);
        $orders[] = $row;
    }
    echo json_encode(['success' => true, 'orders' => $orders]);
    mysqli_close($conn);
    exit;
}

if ($method === 'DELETE') {
    // Delete an order and its items
    $order_id = intval($input['order_id'] ?? 0);
    if (!$order_id) {
        sendError('order_id is required.');
    }

    // Start transaction
    mysqli_begin_transaction($conn);

    try {
        // First delete all order items
        $delete_items = mysqli_query($conn, "DELETE FROM order_items WHERE order_id = $order_id");
        if (!$delete_items) {
            throw new Exception('Failed to delete order items.');
        }

        // Then delete the order
        $delete_order = mysqli_query($conn, "DELETE FROM `$table` WHERE id = $order_id");
        if (!$delete_order) {
            throw new Exception('Failed to delete order.');
        }

        // Commit transaction
        mysqli_commit($conn);
        echo json_encode(['success' => true, 'message' => 'Order and its items deleted.']);
    } catch (Exception $e) {
        // Rollback on error
        mysqli_rollback($conn);
        sendError($e->getMessage(), 500);
    }

    mysqli_close($conn);
    exit;
}

if ($method === 'PUT') {
    // Update an existing order
    $order_id = intval($input['order_id'] ?? 0);
    $items = json_encode($input['items'] ?? []);
    $total_amount = floatval($input['total_amount'] ?? 0);
    $shipping = floatval($input['shipping'] ?? 0);
    $tax = floatval($input['tax'] ?? 0);

    if (!$order_id || !$items || $total_amount <= 0) {
        sendError('Missing or invalid fields.');
    }

    $sql = "UPDATE `$table` SET items='$items', total_amount=$total_amount, shipping=$shipping, tax=$tax WHERE id=$order_id";
    if (mysqli_query($conn, $sql)) {
        echo json_encode(['success' => true, 'message' => 'Order updated successfully.']);
    } else {
        sendError('Failed to update order.', 500);
    }
    mysqli_close($conn);
    exit;
}

sendError('Method not supported.', 405);
?>