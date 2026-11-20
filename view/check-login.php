   <?php

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['email']) || empty($input['password']) || empty($input['role'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing fields.']);
    exit;
}

$usersFile = __DIR__ . '/../data/users.json';
$users = json_decode(file_get_contents($usersFile), true);
if (!is_array($users)) {
    http_response_code(500);
    echo json_encode(['error' => 'Could not read users.']);
    exit;
}

foreach ($users as $u) {
    if (strtolower($u['email']) === strtolower($input['email']) && $u['role'] === $input['role']) {
        $match = $u['password'] === $input['password'];

        if ($match) {
            unset($u['password']);
            echo json_encode($u);
            exit;
        }
    }
}

http_response_code(401);
echo json_encode(['error' => 'Wrong email, password or account type.']);
