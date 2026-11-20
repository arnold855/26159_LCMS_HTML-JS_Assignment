<?php

date_default_timezone_set('UTC');

$serverDate = date('l, d F Y');   
$serverTime = date('H:i:s');     
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Server Date and Time - Legal Case Management System</title>
  <link rel="stylesheet" href="css/style.css">
  <style>
    
    html, body { height: 100%; }
    body { display: flex; flex-direction: column; }
    main { flex: 1; }
  </style>
</head>
<body>

  <header id="site-header"></header>

  <main>
    <section>
      <h2>Current Server Date and Time</h2>
      <p>Date: <strong><?php echo $serverDate; ?></strong></p>
      <p>Time: <strong><?php echo $serverTime; ?></strong></p>
    </section>
  </main>

  <footer id="site-footer"></footer>

  <script type="module">
    import { renderHeader, renderFooter } from "../controller/nav.js";
    renderHeader();
    renderFooter();
  </script>
</body>
</html>
