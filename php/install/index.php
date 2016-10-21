<?php
if(isset($_POST['site-title']) && isset($_POST['site-url']) && isset($_POST['db']) && isset($_POST['db-table']) && isset($_POST['db-user']) && isset($_POST['db-pass'])){
  $tab = [
    "title" => $_POST['site-title'],
    "url" => $_POST['site-url'],
    "db" => $_POST['db'],
    "table" => $_POST['db-table'],
    "user" => $_POST['db-user'],
    "pass" => $_POST['db-pass']
  ];
  file_put_contents("../includes/Config.php", "<?php\n".$tab);
}else{
?>
<!Doctype HTML>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>URLS - Setup</title>
    <link href="../css/bootstrap.min.css" rel="stylesheet">
    <link href="../css/URLS.css" rel="stylesheet">
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
      <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->
  </head>
  <body class="setup">
    <h1 class="center">URLS - Setup</h1>
    <br>
    <form action="./" method="post" class="center">
        <input type="text" class="form-control" name="site-title" placeholder="Site Title" required>
        <br>
        <input type="url" class="form-control" name="site-url" placeholder="Site URL" required>
        <br>
        <input type="text" class="form-control" name="db" placeholder="Database" required>
        <br>
        <input type="text" class="form-control" name="db-table" placeholder="Table" required>
        <br>
        <input type="text" class="form-control" name="db-user" placeholder="Username" required>
        <br>
        <input type="password" class="form-control" name="db-pass" placeholder="Password" required>
        <br>
        <button type="submit" class="btn btn-lg btn-primary">Setup!</button>
    </form>
  </body>
</html>
<?php
}
