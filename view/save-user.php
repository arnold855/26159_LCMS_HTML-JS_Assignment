<?php

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Only POST requests are allowed here.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['name']) || empty($input['email']) || empty($input['password']) || empty($input['role'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields (name, email, password, role).']);
    exit;
}

if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email address.']);
    exit;
}

if (strlen($input['password']) < 8) {
    http_response_code(400);
    echo json_encode(['error' => 'Password must be at least 8 characters.']);
    exit;
}

function clean($val) {
    return htmlspecialchars(strip_tags(trim((string)$val)), ENT_QUOTES, 'UTF-8');
}

$usersFile = __DIR__ . '/../data/users.json';

$fp = fopen($usersFile, 'c+');
if (!$fp || !flock($fp, LOCK_EX)) {
    http_response_code(500);
    echo json_encode(['error' => 'Could not open data/users.json for writing. Check file permissions.']);
    exit;
}

$raw = stream_get_contents($fp);
$users = $raw !== '' ? json_decode($raw, true) : [];
if (!is_array($users)) {
    $users = [];
}

foreach ($users as $existing) {
    if (isset($existing['email']) && strtolower($existing['email']) === strtolower($input['email'])) {
        flock($fp, LOCK_UN);
        fclose($fp);
        http_response_code(409);
        echo json_encode(['error' => 'This email is already registered.']);
        exit;
    }
}

$nextId = 1;
foreach ($users as $existing) {
    if (isset($existing['id']) && (int)$existing['id'] >= $nextId) {
        $nextId = (int)$existing['id'] + 1;
    }
}

$newUser = [
    'id'       => $nextId,
    'name'     => clean($input['name']),
    'email'    => clean($input['email']),
    'phone'    => clean($input['phone'] ?? ''),
    'password' => $input['password'],
    'role'     => clean($input['role'])
];

$users[] = $newUser;

ftruncate($fp, 0);
rewind($fp);
fwrite($fp, json_encode($users, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
fflush($fp);
flock($fp, LOCK_UN);
fclose($fp);

echo json_encode($newUser);
