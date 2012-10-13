<?php

class Forecast {
    private $_api_endpoint = "http://free.worldweatheronline.com/feed/weather.ashx";
    private $_api_key = "4bbe6c911e072823120508";
    private $_lat, $_lon;

    public function __construct ($lat, $lon){
        $this->_lat = $lat;
        $this->_lon = $lon;
    }

    /*
     * private
     */
    private function _getApiKey() {
        return $this->_api_key;
    }

    private function _getPairLatLon(){
        return $this->_lat . "," . $this->_lon;
    }

    private function _generateQueryLatLon(){
        $query_array = array(
            'q'             => $this->_getPairLatLon(),
            'format'        => 'xml',
            'num_of_days'   => 2,
            'key'          => $this->_getApiKey()
        );

        return http_build_query($query_array);
    }

    private function _retrieveForcastInfo(){
        $url = $this->_api_endpoint . "?" . $this->_generateQueryLatLon();
        $xml = simplexml_load_file($url);

        return $xml;
    }

    /*
     * public
     */

    public function retrieveTemperature($targetDate) {
        $sxml = $this->_retrieveForcastInfo();

        foreach($sxml->weather as $weather){
            // YYYY-MM-DD 形式から置換
            $apiDate = str_replace("-", "", $weather->date);
            if($apiDate == $targetDate){
                // 整形
                return array(
                    "date" => $apiDate,
                    "temperature" => array(
                        "max" => (int)$weather->tempMaxC,
                        "min" => (int)$weather->tempMinC,
                    ),
                );
            }
        }

        // 存在しないとき
        throw new Exception("Date not found: " . $targetDate);
    }
}

// test
//$forecast = new Forecast(37.08,140.27);
//$ret = $forecast->retrieveTemperature(20121014);
//
//var_dump($ret);
