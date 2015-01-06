/**
 * Required toolbar functions for the TFSLink plugin
 *
 * @author   Thorsten Klingert <Thorsten.Klingert@gmail.com>
 * based on Link Wizard
 *      @author Andreas Gohr <gohr@cosmocode.de>
 *      @author Pierre Spring <pierre.spring@caillou.ch>
 * based on IndexMenu wizard
 *      @author Gerrit Uitslag
 */
var addworkitemlink_wiz = {
    $wiz: null,
    textArea: null,
    justSyncingSelection: false,

    init: function($editor) {
        // position relative to the text area
        var pos = $editor.position();
        // create HTML Structure
        if (addworkitemlink_wiz.$wiz)
            return;
        addworkitemlink_wiz.$wiz = jQuery(document.createElement('div'))
            .dialog({
                autoOpen: false,
                draggable: true,
                title: LANG.plugins.tfslink.addlinktitle,
                resizable: false
            })
            .html(
                '<fieldset class="attributes"><legend>'+LANG.plugins.tfslink.attributes+'</legend>' +
                '<div><label class="number">'+LANG.plugins.tfslink.workitemid+' : # <input id="workitemid" type="text"></label>' +
                '<label>'+LANG.plugins.tfslink.title+' : <input id="title" type="text"></label></div>' +
                '</fieldset>' +
                '<fieldset class="projectcollection"><legend>'+LANG.plugins.tfslink.projectcollection+'</legend>' +
                '<div><label>'+LANG.plugins.tfslink.usedefaultprojectcollection+'</label><input type="checkbox" id="usedefaultprojectcollection" name="default" value="1" checked>' +
                '<div><select id="projectcollection" name="projectcollection" size="3"></select></div>' +
                '</fieldset>' +
                '<input type="submit" value="'+LANG.plugins.tfslink.insertlink+'" class="button" id="addworkitemlink__insert">'
                )
            .parent()
            .attr('id','addworkitemlink__wiz')
            .css({
                'position':    'absolute',
                'top':         (pos.top+20)+'px',
                'left':        (pos.left+80)+'px'
            })
            .hide()
            .appendTo('.dokuwiki:first');

        addworkitemlink_wiz.textArea = $editor[0];

        addworkitemlink_wiz.populateProjectCollections();

        // attach event handlers
        jQuery('#workitemid').bind('keydown keyup', function(){
            // restrict input to numbers only
            addworkitemlink_wiz.filterNumberInput(this);
        });
        jQuery("#usedefaultprojectcollection").bind('change', function() {
            addworkitemlink_wiz.syncProjectCollectionSelections(true);
        });
        jQuery('#projectcollection').bind('change', function () {
            addworkitemlink_wiz.syncProjectCollectionSelections(false);
        });
        jQuery('#addworkitemlink__insert').click(addworkitemlink_wiz.insertLink);

        jQuery('#addworkitemlink__wiz').find('.ui-dialog-titlebar-close').click(addworkitemlink_wiz.hide);
    },
    /**
     * Allow only number, by direct removing other characters from input
     */
    filterNumberInput: function(elem){
        if(elem.value.match(/\D/)) {
            elem.value=this.value.replace(/\D/g,'');
        }
    },
    /**
     * Populates the project collections
     */
    populateProjectCollections: function() {
        var addOptions = function(data) {
            if (jQuery.isEmptyObject(data)) {
                // hide project collection options and check 'use default'
                jQuery('fieldset.projectcollection').hide();
                jQuery('#usedefaultprojectcollection').prop('checked', true);
                return;
            }

            jQuery.each(data, function(i, pc){
                if (!pc) return;
                jQuery('#projectcollection').append( jQuery('<option>', { value: pc.id, text: pc.title }));
            });
        };

        jQuery.post(
            DOKU_BASE + 'lib/exe/ajax.php',
            {call: 'tfslink', req: 'projectcollections'},
            addOptions,
            'json'
        );
    },
    syncProjectCollectionSelections: function(fromCheckbox){
        if (addworkitemlink_wiz.justSyncingSelection) return;
        addworkitemlink_wiz.justSyncingSelection = true;
        try {
            var $checkbox = jQuery('#usedefaultprojectcollection');
            if (fromCheckbox) {
                if($checkbox.prop('checked')) {
                    var $selected = jQuery('#projectcollection').find("option:selected");
                    if ($selected) $selected.prop('selected', false);
                    return;
                }
                var firstOption = jQuery('#projectcollection').find("option:first");
                if (!firstOption) {
                    $checkbox.prop('checked', true);
                    return;
                }
                firstOption.prop('selected', true);
            } else {
                var $selected = jQuery('#projectcollection').find("option:selected");
                $checkbox.prop('checked', !$selected);
            }
        } finally
        {
            addworkitemlink_wiz.justSyncingSelection = false;
        }
    },

    /**
     * Inserts the syntax for the currently configured link
     */
    insertLink: function(){
        var sel, pc, id, title, syntax;

        // XXX: Compatibility Fix for 2014-05-05 "Ponder Stibbons", splitbrain/dokuwiki#505
        if(DWgetSelection) {
            sel = DWgetSelection(addworkitemlink_wiz.textArea);
        } else {
            sel = getSelection(addworkitemlink_wiz.textArea);
        }

        pc = '';
        if( !jQuery('#usedefaultprojectcollection').prop('checked')) {
            pc = jQuery('#projectcollection').find("option:selected").val();
            if (!pc) pc = '';
        }
        id = parseInt(jQuery('#workitemid').val());
        title = jQuery('#title').val();

        syntax = '[[wi>'+ pc + '#' + (id ? id : '-1');
        if (title && title.length > 0)
            syntax += '|' + title;
        syntax+=']]';

        pasteText(sel, syntax,{startofs: 5, endofs: 2});
        addworkitemlink_wiz.hide();
    },
    /**
     * Shows the wizard
     */
    show: function(){
        // XXX: Compatibility Fix for 2014-05-05 "Ponder Stibbons", splitbrain/dokuwiki#505
        if(DWgetSelection) {
            addworkitemlink_wiz.selection = DWgetSelection(addworkitemlink_wiz.textArea);
        } else {
            addworkitemlink_wiz.selection = getSelection(addworkitemlink_wiz.textArea);
        }

        addworkitemlink_wiz.$wiz.show();
        jQuery('#workitemid').focus();
    },
    /**
     * Hides the wizard
     */
    hide: function(){
        addworkitemlink_wiz.$wiz.hide();
        addworkitemlink_wiz.textArea.focus();
    },
    /**
     * Toggles the visibility of the wizard
     */
    toggle: function(){
        if(addworkitemlink_wiz.$wiz.css('display') == 'none'){
            addworkitemlink_wiz.show();
        }else{
            addworkitemlink_wiz.hide();
        }
    }
};
