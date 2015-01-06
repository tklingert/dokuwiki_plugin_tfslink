/* DOKUWIKI:include scripts/addworkitemlink_wiz.js */

/**
 * Add button action for the add tfs link wizard
 *
 * @param  {jQuery}   $btn  Button element to add the action to
 * @param  {Array}    props Associative array of button properties
 * @param  {string}   edid  ID of the editor textarea
 * @return {boolean}  If button should be appended
 */
function addBtnActionInsertTFSWorkItemLink($btn, props, edid) {
    addworkitemlink_wiz.init(jQuery('#' + edid));
    $btn.click(function () {
        addworkitemlink_wiz.toggle();
        return false;
    });
    return true;
}

// try to add the buttons to the toolbar
if (window.toolbar != undefined) {
    var button = {
        "type": "InsertTFSWorkItemLink",
        "title": "Insert the a link to a tfs work item",
        "icon": "../../plugins/tfslink/images/workitem-link.png"
    };
    if (window.toolbar.length > 11)
        window.toolbar.splice(11, 0, button);
    else
        window.toolbar[window.toolbar.length] = button;
}
