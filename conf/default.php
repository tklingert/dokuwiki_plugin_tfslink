<?php
/**
 * Default configuration for the tfslink plugin
 *
 * @license:    GPL 2 (http://www.gnu.org/licenses/gpl.html)
 * @author:     Thorsten.Klingert <Thorsten.Klingert@gmail.com>
 */
$conf['debug']                      = 1;
$conf['defaultCollection']          = array
        (
            'baseUrl'   => 'http://your.tfs.service/tfs',
            'name'      => 'DefaultCollection',
            'guid'      => 'insert guid of the project collection',
            'title'     => 'tfs',
            'version'   => 2013
        );
$conf['showdefaultcollectiontitle'] = 1;
$conf['collections']                = array();
$conf['linktarget']                 = '_blank';
