<?php
// require the Faker autoloader
require_once 'vendor/autoload.php';

// use the factory to create a Faker\Generator instance
$faker = Faker\Factory::create();

$tags = array(
  '842006626',
  '842006618',
  '842006619',
  '842006623',
  '842006622',
  '842006625',
  '842006624',
  '842006627',
  '842006628',
  '842006617'
);

date_default_timezone_set("America/Los_Angeles");
  
while(true) {
  $lines = $faker->numberBetween(1, 60);
  for ($i = 0; $i < $lines; $i++) {
    $curDateTime = date("Y-m-d H:i:s");
    
    $curDateTimeArr = explode(' ', $curDateTime);
    $curDay = $curDateTimeArr[0];
    $curTimeArr = explode(':', $curDateTimeArr[1]);
    $curHour = $curTimeArr[0];
    $curMinute = $curTimeArr[1];
    
    //$logDir = 'log/' . $curDay;
    $logDir = 'log';
    if (!is_dir($logDir)) {
      mkdir($logDir);
    }
    $logFile = $logDir . '/data-' . $curHour . '.log';
    
    
    $number = $faker->randomFloat(2, 0, 50);
    //$state = $faker->optional($weight=0.7, $default='california')->state;
    
    $tag = $tags[$faker->numberBetween(0, count($tags)-1)];
    
    $logLine = implode(",", array($curDateTime, $tag, $number)) . "\r\n";
    echo $logLine;
    file_put_contents($logFile, $logLine, FILE_APPEND);

    sleep(1);
  }
  sleep(60);
}
