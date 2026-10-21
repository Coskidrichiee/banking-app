<?php

/* =========================================
   CORS
========================================= */

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

header("Content-Type: application/json");


/* =========================================
   DATABASE CONNECTION
========================================= */

$host = "localhost";
$user = "root";
$password = "";
$database = "banking_app";

$conn = new mysqli(
    $host,
    $user,
    $password,
    $database
);


if ($conn->connect_error) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Database connection failed.",
        "error" => $conn->connect_error
    ]);

    exit;
}


$conn->set_charset("utf8mb4");


/* =========================================
   GET LIMIT
========================================= */

$limit = isset($_GET["limit"])
    ? intval($_GET["limit"])
    : 100;


/*
Prevent unreasonable values
*/

if ($limit <= 0) {
    $limit = 100;
}

if ($limit > 1000) {
    $limit = 1000;
}


/* =========================================
   GET ALL TRANSACTIONS
========================================= */

$sql = "
    SELECT *
    FROM transactions
    ORDER BY created_at DESC
    LIMIT ?
";


$stmt = $conn->prepare($sql);


if (!$stmt) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to prepare transaction query.",
        "error" => $conn->error
    ]);

    $conn->close();

    exit;
}


$stmt->bind_param(
    "i",
    $limit
);


if (!$stmt->execute()) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to retrieve transactions.",
        "error" => $stmt->error
    ]);

    $stmt->close();
    $conn->close();

    exit;
}


/* =========================================
   GET RESULTS
========================================= */

$result = $stmt->get_result();

$transactions = [];


while ($row = $result->fetch_assoc()) {

    $transactions[] = $row;

}


/* =========================================
   RESPONSE
========================================= */

echo json_encode([
    "success" => true,
    "transactions" => $transactions,
    "count" => count($transactions)
]);


$stmt->close();
$conn->close();

?>