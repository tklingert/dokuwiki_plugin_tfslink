<?php
/**
 * action_plugin_tfslink - handles all actions for the tfs link plugin
 * @license  GPL 2 (http://www.gnu.org/licenses/gpl.html)
 * @author   Thorsten Klingert <Thorsten.Klingert@gmail.com>
 */

if(!defined('DOKU_INC')) die();

class action_plugin_tfslink extends DokuWiki_Action_Plugin {

    /**
     * Register its handlers with the DokuWiki's event controller
     */
    public function register(Doku_Event_Handler $controller) {
        $controller->register_hook('AJAX_CALL_UNKNOWN', 'BEFORE', $this,'_ajax_call');
    }

    /**
     * handle ajax requests
     */
    function _ajax_call(&$event, $param) {
        if ($event->data !== 'tfslink') {
            return;
        }
        //no other ajax call handlers needed
        $event->stopPropagation();
        $event->preventDefault();

        switch($_REQUEST['req']) {
            case 'projectcollections':
                // list the project collections infos
                header('Content-Type: application/json');

                $data = $this->_getProjectCollectionInfos();
                require_once DOKU_INC . 'inc/JSON.php';
                $json = new JSON();
                echo '' . $json->encode($data) . '';
                break;
        }
    }

    /**
     * Returns a list of all available non-default project collections
     */
    private function _getProjectCollectionInfos() {
        $data = array();
        $collections = $this->getConf('collections');
        if(!isset($collections) || !is_array($collections)) // no project collections set
            return $data;

        foreach($collections as $key => $options)
        {
            $keyData = array( 'title' => $key, 'baseUrl' => '', 'name' => '', 'guid' => '', 'version' => '' );
            if (is_array($options)){ // copy values from collection config
                foreach(array_keys($keyData) as $confKey){
                    if (isset($options[$confKey]))
                        $keyData[$confKey] = $options[$confKey];
                }
            }
            // add key as id
            $keyData['id'] = $key;
            $data[] = $keyData;
        }
        return $data;
    }
}
