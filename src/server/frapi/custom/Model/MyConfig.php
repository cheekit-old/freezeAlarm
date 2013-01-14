<?php
require_once '../../library/Zend/Config.php';
require_once '../../library/Zend/Config/Ini.php';

class MyConfig {
    private $_config_filepath = '../Config/config.ini';
    public $values;

    function __construct(){
        $this->values = new Zend_Config_Ini($this->_config_filepath);
    }
}

/*
 * Test
 */
$config = new MyConfig;

var_dump($config->values->db);

?>
