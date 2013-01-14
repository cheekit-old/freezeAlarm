<?php
# Zend 自動読み込み
set_include_path(get_include_path() . PATH_SEPARATOR . dirname(__FILE__) . '/../Library');
set_include_path(get_include_path() . PATH_SEPARATOR . dirname(__FILE__) . '/../../library');
require_once 'Zend/Loader/Autoloader.php';
$autoloader = Zend_Loader_Autoloader::getInstance();
$autoloader->unregisterNamespace(array('Zend_', 'ZendX_'))
    ->setFallbackAutoloader(true);
#require '../Library/ApnsPHP/Autoload.php';


class Calls {
    // プロパティ
    private $_tel;
    private $_db;

    public function __construct ($tel){
        // セット
        $this->_tel = $tel;

        // DB接続
        $config = new Zend_Config_Ini(dirname(__FILE__) . '/../Config/config.ini');
        $this->_db = Zend_Db::factory($config->db);
    }

    /*
     * private
     */

    /*
     * public
     */

    /**
     * 保存する
     *
     * UPSERT
     * Zend_Db だとエラーが発生したので、RawレベルなSQLを利用
     */
    public function increment (){

        $sql = <<<SQL
INSERT INTO Calls
(
      tel 
    , count 
    , created_at
)
VALUES
(
      :tel
    , '1'
    , now()
)
 ON DUPLICATE KEY UPDATE 
      count=count + 1
    , created_at=now()
SQL;

        $db = $this->_db->getConnection();
        $sth = $db->prepare($sql);
        $sth->bindValue(':tel', $this->_tel);
        $sth->execute();
    }
}

/**
 * Test
 */
#$call = new Calls('09013745879');
#$call->increment();
