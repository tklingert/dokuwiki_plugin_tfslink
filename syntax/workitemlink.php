<?php
/**
 * syntax_plugin_tfsworkitemlink - provides a substitution for tfs work item links
 * @license  GPL 2 (http://www.gnu.org/licenses/gpl.html)
 * @author   Thorsten Klingert <Thorsten.Klingert@gmail.com>
 */

if(!defined('DOKU_INC')) define('DOKU_INC',realpath(dirname(__FILE__).'/../../').'/');
if(!defined('DOKU_PLUGIN')) define('DOKU_PLUGIN',DOKU_INC.'lib/plugins/');
require_once(DOKU_PLUGIN.'syntax.php');

class syntax_plugin_tfslink_workitemlink extends DokuWiki_Syntax_Plugin {

    function getType(){ return 'substition'; }
    function getSort(){ return 1; }

    function connectTo($mode) {
        $this->Lexer->addSpecialPattern('\[\[wi>.+?\]\]', $mode,'plugin_tfslink_workitemlink');
    }

    function handle($match, $state, $pos, Doku_Handler $handler) {
        $data = array();

        /* samples:
         *  [[wi>#123]]
         *  [[wi>#123|Title]]
         *  [[wi>collection#123]]
         *  [[wi>collection#123|Title]] */
        if(!preg_match('/^\[\[wi>(?<cn>[^#>]*?)#(?<id>\d+)\s*(\|(?<title>.+?)|)\]\]$/m', $match, $options)) {
            $data['error'] = '[invalid work item link format]'; // TODO: localize
            return $data;
        }
        // extract options
        //  - project collection (optional)
        $collectionName = isset($options['cn']) ? trim($options['cn']) : '';
        $collection = strlen($collectionName) == 0 // empty => use default collection
            ? $this->_getDefaultProjectCollection()
            : $this->_getProjectCollection($collectionName);
        if (!isset($collection)){
            $data['error'] = '[invalid/unknown project collection]'; // TODO: localize
            return $data;
        }
        $data['projectCollection'] = $collection;
        //  - identifier of the work item
        $data['workItemId'] = intval($options['id']);
        //  - title (optional)
        $data['title'] = isset($options['title']) ? trim($options['title']) : '';
        if (strlen($data['title']) == 0) // fallback to #id or [project collection title]#id for custom collections
        {
            if (isset($collection['title'])
                    && ( strlen($collectionName) > 0 || $this->getConf('showdefaultcollectiontitle')))
                $data['title'] = $collection['title'];
            $data['title'] .= '#' . $options['id'];
        }
        // set tfs version
        $data['version'] = isset($collection['version']) ? intval($collection['version']) : 2013; // fallback to 2013 by default.

        return $data;
    }
    function render($mode, Doku_Renderer $renderer, $data) {
        if($mode != 'xhtml') return false;

        if (isset($data['error']))
        {
            $renderer->doc .= $data['error'];
            return true;
        }

        $pcParamName = $data['version'] <= 2010 ? 'pguid' : 'pcguid';
        $url = $data['projectCollection']['baseUrl'] . '/web/wi.aspx?';
        $url .= $pcParamName . '=' . rawurlencode($data['projectCollection']['guid']);
        $url .= '&id=' . $data['workItemId'];

        $renderer->doc .= '<a href="' . $url. '" class="urlextern urltfsworkitem"';
        $target = $this->getConf('linktarget');
        if (isset($target)) {
            $renderer->doc .= ' target="' . $target . '"';
        }
        $renderer->doc .= ' title="' . $url. '"';
        $renderer->doc .= '>';
        $renderer->doc .= $renderer->_xmlEntities($data['title']);
        $renderer->doc .= '</a>';

        return true;
    }

    private function _getDefaultProjectCollection()
    {
        $collection = $this->getConf('defaultCollection');
        if(!isset($collection) || !is_array($collection)) {
            if ($this->getConf('debug')) {
                msg("TFSLink: default project collection not set or invalid.", -1);
            }
            return null;
        }
        return $collection;
    }
    private function _getProjectCollection($name)
    {
        $collections = $this->getConf('collections');
        if(!isset($collections) || !is_array($collections)) {
            if ($this->getConf('debug')) {
                msg("TFSLink: unknown project collection: '". $name . "'. (No additional project collections defined)", -1);
            }
            return null;
        }
        if (!isset($collections[$name]) || !is_array($collections[$name])) {
            if ($this->getConf('debug')) {
                msg("TFSLink: unknown project collection: '". $name . "'. (No such project collection defined)", -1);
            }
            return;
        }
        return $collections[$name];
    }
}
