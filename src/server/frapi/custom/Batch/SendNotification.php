<?php

require_once '../Model/Notification.php';
require_once '../Model/Forecast.php';


// DB接続
$config = new Zend_Config_Ini('../Config/config.ini');
$db = Zend_Db::factory($config->db);

// 対象デバイス取得
$select = $db
    ->select()
    ->from('Notifications');

$stmt = $select->query();
$result = $stmt->fetchAll();

// PushNotification 準備
$push = new ApnsPHP_Push(
    ApnsPHP_Abstract::ENVIRONMENT_SANDBOX,
    '../Config/apns-dev.pem'
);
$push->setRootCertificationAuthority('../Config/apns-dev-cert.pem');

$push->connect();

foreach( $result as $target ){
    // 最低気温判断
    $forecast = new Forecast($target["lat"], $target["lon"]);
    $tomorrow = date("Ymd",strtotime("+1 day"));
    $ret = $forecast->retrieveTemperature($tomorrow);

    $min = $ret["temperature"]["min"];
    if($min <= -4){
        $text = "【警告】最低気温 " . $min . " 度"; // TODO: メッセージ
    }else if($min < 0){
        $text = "【注意】最低気温 " . $min . " 度"; // TODO: メッセージ
    }else{
        continue;
    }

    try {
        $message = new ApnsPHP_Message($target['device_id']);
        $message->setText($text);
        $message->setExpiry(30);
        $push->add($message);
    } catch (Exception $e){
        continue;
    }

}


# 送信
    try {
        $push->send();
    } catch (Exception $e){
        error_log($e->getMessage());
    }
$push->disconnect();

$aErrorQueue = $push->getErrors();
if (!empty($aErrorQueue)) {
    var_dump($aErrorQueue);
}

?>

