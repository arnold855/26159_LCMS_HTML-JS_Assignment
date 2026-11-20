<?php

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Only POST requests are allowed here.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['title']) || empty($input['type']) || empty($input['lawyerId']) || empty($input['clientId'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields (title, type, lawyerId, clientId).']);
    exit;
}

$casesFile = __DIR__ . '/../data/cases.json';

$fp = fopen($casesFile, 'c+');
if (!$fp || !flock($fp, LOCK_EX)) {
    http_response_code(500);
    echo json_encode(['error' => 'Could not open data/cases.json for writing. Check file permissions.']);
    exit;
}

$raw = stream_get_contents($fp);
$cases = $raw !== '' ? json_decode($raw, true) : [];
if (!is_array($cases)) {
    $cases = [];
}

$highestNumber = 0;
foreach ($cases as $existing) {
    if (isset($existing['id']) && preg_match('/(\d+)/', (string)$existing['id'], $matches)) {
        $highestNumber = max($highestNumber, (int)$matches[1]);
    }
}

$newCase = [
    'id' => 'C-' . ($highestNumber + 1),
    'title' => $input['title'],
    'type' => $input['type'],
    'status' => 'Open',
    'lawyerId' => (int)$input['lawyerId'],
    'clientId' => (int)$input['clientId'],
    'filed' => $input['filed'] ?? '',
    'hearing' => $input['hearing'] ?? '',
    'description' => $input['description'] ?? ''
];

$cases[] = $newCase;

ftruncate($fp, 0);
rewind($fp);
fwrite($fp, json_encode($cases, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
fflush($fp);
flock($fp, LOCK_UN);
fclose($fp);

echo json_encode($newCase);
