<?php

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Only POST requests are allowed here.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['name']) || empty($input['email']) || empty($input['message'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields (name, email, message).']);
    exit;
}

if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email address.']);
    exit;
}

function clean($val) {
    return htmlspecialchars(strip_tags(trim((string)$val)), ENT_QUOTES, 'UTF-8');
}

$contactsFile = __DIR__ . '/../data/contacts.json';

$fp = fopen($contactsFile, 'c+');
if (!$fp || !flock($fp, LOCK_EX)) {
    http_response_code(500);
    echo json_encode(['error' => 'Could not open data/contacts.json for writing. Check file permissions.']);
    exit;
}

$raw = stream_get_contents($fp);
$contacts = $raw !== '' ? json_decode($raw, true) : [];
if (!is_array($contacts)) {
    $contacts = [];
}

$newContact = [
    'name'    => clean($input['name']),
    'email'   => clean($input['email']),
    'subject' => clean($input['subject'] ?? ''),
    'message' => clean($input['message']),
    'time'    => date('c')
];

$contacts[] = $newContact;

ftruncate($fp, 0);
rewind($fp);
fwrite($fp, json_encode($contacts, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
fflush($fp);
flock($fp, LOCK_UN);
fclose($fp);

echo json_encode(['ok' => true]);
