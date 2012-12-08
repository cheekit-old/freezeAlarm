<?php
# Zend 自動読み込み
set_include_path(get_include_path() . PATH_SEPARATOR . dirname(__FILE__) . '/../Library');
set_include_path(get_include_path() . PATH_SEPARATOR . dirname(__FILE__) . '/../../library');
require_once 'Zend/Loader/Autoloader.php';
$autoloader = Zend_Loader_Autoloader::getInstance();
$autoloader->unregisterNamespace(array('Zend_', 'ZendX_'))
    ->setFallbackAutoloader(true);
#require '../Library/ApnsPHP/Autoload.php';


class Notification{
    // プロパティ
    private $_device_id, $_lat, $_lon;
    private $_db;

    public function __construct ($device_id, $lat, $lon, $secret){

        $this->_device_id = str_replace(" ", "", $device_id);
        $this->_lat = round($lat, 2);
        $this->_lon = round($lon, 2);

        // check secret
        if(!$this->_checkSecret($device_id, $secret)){
            throw new Exception ("Invalid Secret", 503);
        }

        // DB接続
        $config = new Zend_Config_Ini(dirname(__FILE__) . '/../Config/config.ini');
        $this->_db = Zend_Db::factory($config->db);
    }

    /*
     * private
     */

    private function _checkSecret($text, $secret) {
        return $secret == md5("cheekit" . $text);
    }

    /*
     * public
     */

    /**
     * 保存する
     *
     * UPSERT
     * Zend_Db だとエラーが発生したので、RawレベルなSQLを利用
     */
    public function save (){

        $sql = <<<SQL
INSERT INTO notifications
(
      device_id
    , lat
    , lon
    , created_at
)
VALUES
(
      :device_id
    , :lat
    , :lon
    , now()
)
 ON DUPLICATE KEY UPDATE 
      lat=:lat
    , lon=:lon
    , created_at=now()
SQL;

        $db = $this->_db->getConnection();
        $sth = $db->prepare($sql);
        $sth->bindValue(':device_id', $this->_device_id);
        $sth->bindValue(':lat', $this->_lat);
        $sth->bindValue(':lon', $this->_lon);
        $sth->execute();
    }
}

/**
 * Test
 */
#$dt = "a817df4491629bae9142892c8c7a7a1a252f703204f966e575f2b04db2981179";
#$nf = new Notification($dt, 45, 141, md5("cheekit" . $dt) );
#var_dump($nf->save());
#$nf->pushAllDevices();
