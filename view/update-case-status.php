<?php

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Only POST requests are allowed here.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['id']) || empty($input['status'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields (id, status).']);
    exit;
}

$allowed = ['Open', 'In Progress', 'Closed'];
if (!in_array($input['status'], $allowed)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid status value.']);
    exit;
}

$casesFile = __DIR__ . '/../data/cases.json';

$fp = fopen($casesFile, 'c+');
if (!$fp || !flock($fp, LOCK_EX)) {
    http_response_code(500);
    echo json_encode(['error' => 'Could not open data/cases.json for writing.']);
    exit;
}

$raw = stream_get_contents($fp);
$cases = $raw !== '' ? json_decode($raw, true) : [];
if (!is_array($cases)) {
    $cases = [];
}

$updated = null;
foreach ($cases as &$case) {
    if ($case['id'] === $input['id']) {
        $case['status'] = $input['status'];
        $updated = $case;
        break;
    }
}
unset($case);

if (!$updated) {
    flock($fp, LOCK_UN);
    fclose($fp);
    http_response_code(404);
    echo json_encode(['error' => 'Case not found.']);
    exit;
}

ftruncate($fp, 0);
rewind($fp);
fwrite($fp, json_encode($cases, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
fflush($fp);
flock($fp, LOCK_UN);
fclose($fp);

echo json_encode($updated);
