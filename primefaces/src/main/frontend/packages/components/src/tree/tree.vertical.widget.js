/**
 * __PrimeFaces Vertical Tree Widget__
 *
 * Tree is used for displaying hierarchical data and creating a site navigation. This implements a vertical tree.
 *
 * @typedef {"none" | "sibling"} PrimeFaces.widget.VerticalTree.DropRestrictMode Defines parent-child restrictions when
 * a node is dropped.
 *
 * @interface {PrimeFaces.widget.VerticalTree.DroppedNodeParams} DroppedNodeParams Describes a drag & drop operation
 * when a tree node is being dragged.
 * @prop {JQueryUI.DroppableOptions} DroppedNodeParams.ui Details about the drop event.
 * @prop {PrimeFaces.widget.VerticalTree} DroppedNodeParams.dragSource Tree widget of the dragged node.
 * @prop {JQuery} DroppedNodeParams.dragNode The node that was dragged.
 * @prop {JQuery} DroppedNodeParams.targetDragNode The node that was the target of the drag.
 * @prop {JQuery} DroppedNodeParams.dropPoint The drop point where the node was dropped.
 * @prop {JQuery} DroppedNodeParams.dropNode The node on which the dragged node was dropped.
 * @prop {boolean} DroppedNodeParams.transfer Whether a transfer should occur, i.e. whether the node was not dropped on
 * itself.
 *
 * @prop {JQuery} container The DOM element for the tree container.
 * @prop {PrimeFaces.widget.VerticalTree.DroppedNodeParams[]} droppedNodeParams List of parameter describing the drag &
 * drop operations.
 * @prop {JQuery} filterInput The DOM element for the filter input field that lets the user search the tree.
 * @prop {string[]} invalidSourceKeys A list of row keys for rows that are not valid drag sources.
 * @prop {number} scrollInterval The set-interval time ID of the timer for scrolling.
 * @prop {JQuery} scrollStateHolder Form element that holds the current scroll state.
 * @prop {boolean} shiftKey For drag&drop, whether the shift is pressed.
 *
 * @interface {PrimeFaces.widget.VerticalTreeCfg} cfg The configuration for the
 * {@link  VerticalTree| VerticalTree widget}. You can access this configuration via
 * {@link PrimeFaces.widget.BaseWidget.cfg|BaseWidget.cfg}. Please note that this configuration is usually meant to be
 * read-only and should not be modified.
 * @extends {PrimeFaces.widget.BaseTreeCfg} cfg
 *
 * @prop {string} cfg.collapsedIcon Named of the icon for collapsed nodes.
 * @prop {boolean} cfg.controlled Whether drag & drop operations of this tree table are controlled.
 * @prop {PrimeFaces.widget.VerticalTree.DropRestrictMode} cfg.dropRestrict Defines parent-child restrictions when a node is
 * dropped.
 * @prop {boolean} cfg.rtl `true` if text direction is right-to-left, or `false` otherwise.
 * @prop {string} cfg.filterEvent Client side event to invoke filtering. Default is keyup.
 * @prop {number} cfg.filterDelay Delay to wait in milliseconds before sending each filter query. Default is 300.
 */
PrimeFaces.widget.VerticalTree = class VerticalTree extends PrimeFaces.widget.BaseTree {

    /**
     * @override
     * @inheritdoc
     * @param {PrimeFaces.PartialWidgetCfg<TCfg>} cfg
     */
    init(cfg) {
        super.init(cfg);

        this.container = this.jq.children('.ui-tree-container');
        this.cfg.rtl = this.jq.hasClass('ui-tree-rtl');
        this.cfg.collapsedIcon = this.cfg.rtl ? 'ui-icon-triangle-1-w' : 'ui-icon-triangle-1-e';
        this.scrollStateHolder = $(this.jqId + '_scrollState');

        if(!this.cfg.disabled) {
            if(this.cfg.draggable) {
                this.initDraggable();
            }

            if(this.cfg.droppable) {
                this.initDroppable();
            }
        }

        this.restoreScrollState();
    }

    /**
     * @override
     * @protected
     * @inheritdoc
     */
    bindEvents() {
        var $this = this,
        togglerSelector = '.ui-tree-toggler',
        nodeContentSelector = '.ui-treenode-content';

        this.jq.off('click.tree-toggle', togglerSelector)
                    .on('click.tree-toggle', togglerSelector, null, function(e) {
                        var toggleIcon = $(this),
                        node = toggleIcon.closest('li');

                        if(toggleIcon.hasClass($this.cfg.collapsedIcon))
                            $this.expandNode(node);
                        else
                            $this.collapseNode(node);
                    });

        if(this.cfg.highlight && this.cfg.selectionMode) {
            this.jq.off('mouseenter.tree mouseleave.tree', nodeContentSelector)
                        .on('mouseleave.tree', nodeContentSelector, null, function() {
                            $(this).removeClass('ui-state-hover');
                        })
                        .on('mouseenter.tree', nodeContentSelector, null, function() {
                            $(this).addClass('ui-state-hover');
                        });
        }

        if(this.isCheckboxSelection()) {
            var checkboxSelector = '.ui-chkbox-box:not(.ui-state-disabled)';

            this.jq.off('mouseleave.tree-checkbox mouseenter.tree-checkbox', checkboxSelector)
                        .on('mouseleave.tree-checkbox', checkboxSelector, null, function() {
                            $(this).removeClass('ui-state-hover');
                        })
                        .on('mouseenter.tree-checkbox', checkboxSelector, null, function() {
                            $(this).addClass('ui-state-hover');
                        });
        }

        this.jq.off('click.tree-content', nodeContentSelector)
                        .on('click.tree-content', nodeContentSelector, null, function(e) {
                            $this.nodeClick(e, $(this));
                        });

        if(this.cfg.filter) {
            this.cfg.filterDelay = this.cfg.filterDelay || 300;
            this.cfg.filterEvent = this.cfg.filterEvent || 'keyup';
            var isEnterKeyFilter = this.cfg.filterEvent === 'enter';
            if (isEnterKeyFilter) {
                this.cfg.filterEvent = 'keydown';
            }
            var filterEventName = this.cfg.filterEvent + '.tree-filter';
            
            this.filterInput = this.jq.find('.ui-tree-filter');
            PrimeFaces.skinInput(this.filterInput);

            this.filterInput.on(filterEventName, function(e) {
                if (PrimeFaces.utils.ignoreFilterKey(e) || PrimeFaces.utils.blockEnterKey(e) !== isEnterKeyFilter) {
                    return;
                }

                if (isEnterKeyFilter) {
                    $this.filter();
                } else {
                    PrimeFaces.debounce(() => $this.filter(), $this.cfg.filterDelay);
                }
            });
        }

        this.jq.on('scroll.tree', function(e) {
            $this.saveScrollState();
        });

        this.bindKeyEvents();
    }

    /**
     * Sets up all event listeners for keyboard interactions.
     * @private
     */
    bindKeyEvents() {
        var $this = this,
        pressTab = false;

        this.jq.on('mousedown.tree', function(e) {
            if($(e.target).is(':not(:input:enabled):not(.ui-treenode-label)')) {
                e.preventDefault();
            }
        });
        this.jq.children('.ui-tree-container').on('focus.tree', function() {
            if(!$this.focusedNode && !pressTab) {
                $this.focusNode($this.getFirstNode());
            }
        });

        this.jq.off('keydown.tree blur.tree', '.ui-treenode-content').on('keydown.tree', '.ui-treenode-content', null, function(e) {
            if(!$this.focusedNode) {
                return;
            }

            var searchRowkey = "";

            switch(e.code) {
                case 'ArrowLeft':
                    var rowkey = $this.focusedNode.data('rowkey').toString(),
                    keyLength = rowkey.length;

                    if($this.isExpanded($this.focusedNode)) {
                        $this.collapseNode($this.focusedNode);
                    }
                    else {
                        var nodeToFocus = null;
                        for(var i = 1; i < parseInt(keyLength / 2) + 1; i++){
                            searchRowkey = rowkey.substring(0, keyLength - 2 * i);
                            nodeToFocus = $this.container.find("li:visible[data-rowkey = '" + searchRowkey + "']");
                            if(nodeToFocus.length) {
                                $this.focusNode(nodeToFocus);
                                break;
                            }
                        }
                    }

                    e.preventDefault();
                break;

                case 'ArrowRight':
                    if(!$this.focusedNode.hasClass('ui-treenode-leaf')) {
                        var rowkey = $this.focusedNode.data('rowkey').toString(),
                        keyLength = rowkey.length;

                        if(!$this.isExpanded($this.focusedNode)) {
                            $this.expandNode($this.focusedNode);
                        }

                        if(!$this.isExpanded($this.focusedNode) && !$this.cfg.dynamic) {
                            searchRowkey = rowkey + '_0';
                            var nodeToFocus = $this.container.find("li:visible[data-rowkey = '" + searchRowkey + "']");

                            if(nodeToFocus.length) {
                                $this.focusNode(nodeToFocus);
                            }
                        }
                    }

                    e.preventDefault();
                break;

                case 'ArrowUp':
                    var nodeToFocus = null,
                    prevNode = $this.previousNode($this.focusedNode);

                    if(prevNode.length) {
                        nodeToFocus = prevNode.find('li.ui-treenode:visible:not(.ui-tree-droppoint)').last();
                        if(!nodeToFocus.length) {
                            nodeToFocus = prevNode;
                        }
                    }
                    else {
                        nodeToFocus = $this.focusedNode.closest('ul').parent('li');
                    }

                    if(nodeToFocus.length) {
                        $this.focusNode(nodeToFocus);
                    }

                    e.preventDefault();
                break;

                case 'ArrowDown':
                    var nodeToFocus = null,
                    firstVisibleChildNode = $this.focusedNode.find("> ul > li:visible:not(.ui-tree-droppoint)").first();

                    if(firstVisibleChildNode.length) {
                        nodeToFocus = firstVisibleChildNode;
                    }
                    else if($this.nextNode($this.focusedNode).length) {
                        nodeToFocus = $this.nextNode($this.focusedNode);
                    }
                    else {
                        var rowkey = $this.focusedNode.data('rowkey').toString();

                        if(rowkey.length !== 1) {
                            nodeToFocus = $this.searchDown($this.focusedNode);
                        }
                    }

                    if(nodeToFocus && nodeToFocus.length) {
                        $this.focusNode(nodeToFocus);
                    }

                    e.preventDefault();
                break;

                case 'Enter':
                case 'NumpadEnter':
                case 'Space':
                    if($this.cfg.selectionMode) {
                        var selectable = $this.focusedNode.children('.ui-treenode-content').hasClass('ui-tree-selectable');

                        if($this.cfg.onNodeClick) {
                            var retVal = $this.cfg.onNodeClick.call($this, $this.focusedNode, e);
                            if (retVal === false) {
                                return;
                            }
                        }

                        if(selectable) {
                            var selected = $this.isNodeSelected($this.focusedNode);

                            if($this.isCheckboxSelection()) {
                                $this.toggleCheckboxNode($this.focusedNode);
                            }
                            else {
                                if(selected) {
                                    $this.unselectNode($this.focusedNode);
                                }
                                else {
                                    if($this.isSingleSelection()) {
                                        $this.unselectAllNodes();
                                    }

                                    $this.selectNode($this.focusedNode);
                                    $this.cursorNode = $this.focusedNode;
                                }
                            }
                        }
                    }

                    e.preventDefault();
                break;

                case 'Tab':
                    pressTab = true;
                    $this.container.trigger('focus');
                    PrimeFaces.queueTask(function() {
                        pressTab = false;
                    });

                break;
            }
        })
        .on('blur.tree', '.ui-treenode-content', null, function(e) {
            if($this.focusedNode) {
                $this.getNodeContent($this.focusedNode).removeClass('ui-treenode-outline');
                $this.focusedNode = null;
            }
        });

        /* For copy/paste operation on drag and drop */
        var namespace = '.tree' + this.id;
        $(document.body).on('keydown' + namespace, function(e) {
            $this.shiftKey = e.shiftKey;
        }).on('keyup' + namespace, function() {
            $this.shiftKey = false;
        });
        this.addDestroyListener(function() {
            $(document.body).off(namespace);
        });
    }

    /**
     * Returns the previous node, skipping droppoints (if present), starting at the given node.
     * @private
     * @param {JQuery} node Node where to start the search.
     * @return {JQuery} The previous node.
     */
    previousNode(node) {
        var prevNode = node.prev();
        if (prevNode.length && (prevNode.hasClass("ui-tree-droppoint") || prevNode.hasClass("ui-treenode-hidden"))) {
            prevNode = prevNode.prev();
        }
        return prevNode;
    }

    /**
     * Returns the next node, skipping droppoints (if present), starting at the given node.
     * @private
     * @param {JQuery} node Node where to start the search.
     * @return {JQuery} The next node.
     */
    nextNode(node) {
        var nextNode = node.next();
        if (nextNode.length && (nextNode.hasClass("ui-tree-droppoint") || nextNode.hasClass("ui-treenode-hidden"))) {
            nextNode = nextNode.next();
        }
        return nextNode;
    }

    /**
     * Searches for a node to focus, starting at the given node.
     * @private
     * @param {JQuery} node Node where to start the search.
     * @return {JQuery} A node to focus.
     */
    searchDown(node) {
        var nextOfParent = this.nextNode(node.closest('ul').parent('li')),
        nodeToFocus = null;

        if(nextOfParent.length) {
            nodeToFocus = nextOfParent;
        }
        else if(node.hasClass('ui-treenode-leaf') && node.closest('ul').parent('li').length == 0){
            nodeToFocus = node;
        }
        else {
            var rowkey = node.data('rowkey').toString();

            if(rowkey.length !== 1) {
                nodeToFocus = this.searchDown(node.closest('ul').parent('li'));
            }
        }

        return nodeToFocus;
    }

    /**
     * Collapses the given node, as if the user had clicked on the `-` icon of the node. The children of the node will
     * now be visible.
     * @param {JQuery} node Node to collapse.
     */
    collapseNode(node) {
        var _self = this,
        nodeContent = node.find('> .ui-treenode-content'),
        toggleIcon = nodeContent.find('> .ui-tree-toggler'),
        nodeType = node.data('nodetype'),
        nodeIcon = toggleIcon.nextAll('span.ui-treenode-icon'),
        iconState = this.cfg.iconStates[nodeType],
        childrenContainer = node.children('.ui-treenode-children');

        //aria
        node.attr('aria-expanded', false);

        toggleIcon.removeClass('ui-icon-triangle-1-s').addClass(_self.cfg.collapsedIcon);

        if(iconState) {
            nodeIcon.removeClass(iconState.expandedIcon).addClass(iconState.collapsedIcon);
        }

        if(this.cfg.animate) {
            childrenContainer.slideUp('fast', function() {
                _self.postCollapse(node, childrenContainer);
            });
        }
        else {
            childrenContainer.hide();
            this.postCollapse(node, childrenContainer);
        }
    }

    /**
     * Callback that is invoked after a node was collapsed.
     * @private
     * @param {JQuery} node The node that was collapsed.
     * @param {JQuery} childrenContainer The container element with the children of the collapsed node.
     */
    postCollapse(node, childrenContainer) {
        if(this.cfg.dynamic && !this.cfg.cache) {
            childrenContainer.empty();
        }

        if(!this.cfg.cache) {
            this.fireCollapseEvent(node);
        }
    }

    /**
     * @override
     * @protected
     * @inheritdoc
     * @param {JQuery} node
     * @return {JQuery}
     */
    getNodeChildrenContainer(node) {
        return node.children('.ui-treenode-children');
    }

    /**
     * @override
     * @protected
     * @inheritdoc
     * @param {JQuery} node
     */
    showNodeChildren(node) {
        var nodeContent = node.find('> .ui-treenode-content'),
        toggleIcon = nodeContent.find('> .ui-tree-toggler'),
        nodeType = node.data('nodetype'),
        nodeIcon = toggleIcon.nextAll('span.ui-treenode-icon'),
        iconState = this.cfg.iconStates[nodeType];

        //aria
        node.attr('aria-expanded', true);

        toggleIcon.removeClass(this.cfg.collapsedIcon).addClass('ui-icon-triangle-1-s');

        if(iconState) {
            nodeIcon.removeClass(iconState.collapsedIcon).addClass(iconState.expandedIcon);
        }

        if(this.cfg.animate) {
            node.children('.ui-treenode-children').slideDown('fast');
        }
        else {
            node.children('.ui-treenode-children').show();
        }
    }

    /**
     * @override
     * @inheritdoc
     */
    unselectAllNodes() {
        this.selections = [];
        this.jq.find('.ui-treenode-content.ui-state-highlight').each(function() {
            $(this).removeClass('ui-state-highlight').closest('.ui-treenode').attr('aria-selected', false).removeClass('ui-treenode-selected').addClass('ui-treenode-unselected');
        });
    }

    /**
     * @override
     * @inheritdoc
     * @param {JQuery} node
     * @param {boolean} [silent]
     */
    selectNode(node, silent) {
        node.attr('aria-selected', true).removeClass('ui-treenode-unselected').addClass('ui-treenode-selected')
            .find('> .ui-treenode-content').addClass('ui-state-highlight');

        this.addToSelection(this.getRowKey(node));
        this.writeSelections();

        if(!silent)
            this.fireNodeSelectEvent(node);
    }

    /**
     * @override
     * @inheritdoc
     * @param {JQuery} node
     * @param {boolean} [silent]
     */
    unselectNode(node, silent) {
        var rowKey = this.getRowKey(node);

        node.attr('aria-selected', false).removeClass('ui-treenode-selected').addClass('ui-treenode-unselected')
            .find('> .ui-treenode-content').removeClass('ui-state-highlight');

        this.removeFromSelection(rowKey);
        this.writeSelections();

        if(!silent)
            this.fireNodeUnselectEvent(node);
    }

    /**
     * @override
     * @protected
     * @inheritdoc
     * @param {JQuery} node
     */
    toggleCheckboxNode(node) {
        var $this = this,
        checkbox = node.find('> .ui-treenode-content > .ui-chkbox'),
        checked = checkbox.find('> .ui-chkbox-box > .ui-chkbox-icon').hasClass('ui-icon-check');

        if(this.cfg.propagateDown) {
            node.children('.ui-treenode-children').find('.ui-treenode:not(.ui-treenode-hidden)').find('.ui-chkbox').each(function() {
                $this.toggleCheckboxState($(this), checked);
            });
            var children = node.find('> .ui-treenode-children > .ui-treenode');
            if(checked) {
                if(children.filter('.ui-treenode-unselected').length === children.length)
                    $this.uncheck(checkbox);
                else
                    $this.partialCheck(checkbox);
            }
            else {
                if(children.filter('.ui-treenode-selected').length === children.length)
                    $this.check(checkbox);
                else
                    $this.partialCheck(checkbox);
            }

            if(this.cfg.dynamic) {
                this.removeDescendantsFromSelection(node.data('rowkey'));
            }
        } else {
            this.toggleCheckboxState(checkbox, checked);
        }

        if(this.cfg.propagateUp) {
            node.parents('li.ui-treenode-parent').each(function() {
                var parentNode = $(this),
                parentsCheckbox = parentNode.find('> .ui-treenode-content > .ui-chkbox'),
                children = parentNode.find('> .ui-treenode-children > .ui-treenode');

                if(checked) {
                    if(children.filter('.ui-treenode-unselected').length === children.length)
                        $this.uncheck(parentsCheckbox);
                    else
                        $this.partialCheck(parentsCheckbox);
                }
                else {
                    if(children.filter('.ui-treenode-selected').length === children.length)
                        $this.check(parentsCheckbox);
                    else
                        $this.partialCheck(parentsCheckbox);
                }
            });
        }

        this.writeSelections();

        if(checked)
            this.fireNodeUnselectEvent(node);
        else
            this.fireNodeSelectEvent(node);
    }

    /**
     * @override
     * @protected
     * @inheritdoc
     */
    preselectCheckbox() {
        this.jq.find('.ui-chkbox-icon').not('.ui-icon-check').each(function() {
            var icon = $(this),
            node = icon.closest('li');

            if(node.children('.ui-treenode-children').find('.ui-chkbox-icon.ui-icon-check').length > 0) {
                node.addClass('ui-treenode-hasselected');
                icon.removeClass('ui-icon-blank').addClass('ui-icon-minus');
            }
        });
    }

    /**
     * @override
     * @protected
     * @inheritdoc
     * @param {JQuery} checkbox
     */
    check(checkbox) {
        super.check(checkbox);
        checkbox.parent().addClass('ui-state-highlight');
    }

    /**
     * @override
     * @protected
     * @inheritdoc
     * @param {JQuery} checkbox
     */
    uncheck(checkbox) {
        super.uncheck(checkbox);
        checkbox.parent().removeClass('ui-state-highlight');
    }

    /**
     * Sets up the drag functionality.
     * @private
     */
    initDraggable() {
        this.makeDraggable(this.jq.find('.ui-treenode-content'));
    }

    /**
     * Sets up the drop functionality.
     * @private
     */
    initDroppable() {
        this.makeDropPoints(this.jq.find('li.ui-tree-droppoint'));
        this.makeDropNodes(this.jq.find('.ui-treenode-droppable'));
        this.initDropScrollers();
    }

    /**
     * Sets up the JQuery UI draggable for the given elements.
     * @private
     * @param {JQuery} elements A list of draggable nodes to set up.
     */
    makeDraggable(elements) {
        var $this = this,
        dragdropScope = this.cfg.dragdropScope||this.id;

        elements.draggable({
            start: function(event, ui) {
                if(ui.helper) {
                    var element = $(event.target),
                    source = PF($(element.data('dragsourceid')).data('widget')),
                    height = 20;

                    if(source.cfg.multipleDrag && element.hasClass('ui-treenode-content') && element.hasClass('ui-state-highlight')) {
                        source.draggedSourceKeys = $this.findSelectedParentKeys(source.selections.slice());
                        height = 20 * (source.draggedSourceKeys.length || 1);
                    }

                    $(ui.helper).height(height);
                }
            },
            helper: function() {
                var el = $('<div class="ui-tree-draghelper ui-state-highlight"></div>');
                el.width($this.jq.width());
                return el;
            },
            appendTo: document.body,
            zIndex: PrimeFaces.nextZindex(),
            revert: true,
            scope: dragdropScope,
            containment: 'document'
        })
        .data({
            'dragsourceid': this.jqId,
            'dragmode': this.cfg.dragMode
        });
    }

    /**
     * Sets up the JQuery UI drop points for the given elements.
     * @private
     * @param {JQuery} elements A list of drop points to set up.
     */
    makeDropPoints(elements) {
        var $this = this,
        dragdropScope = this.cfg.dragdropScope||this.id;

        elements.droppable({
            hoverClass: 'ui-state-hover',
            accept: '.ui-treenode-content',
            tolerance: 'pointer',
            scope: dragdropScope,
            drop: function(event, ui) {
                var dragSource = PF($(ui.draggable.data('dragsourceid')).data('widget')),
                dropSource = $this,
                dropPoint = $(this),
                dropNode = dropPoint.closest('li.ui-treenode-parent'),
                dropNodeKey = $this.getRowKey(dropNode),
                transfer = (dragSource.id !== dropSource.id),
                draggedSourceKeys = dragSource.draggedSourceKeys,
                isDroppedNodeCopy = $this.cfg.dropMode === 'copy' || ($this.cfg.dropCopyNode && $this.shiftKey),
                draggedNodes,
                dragNodeKey;

                if(draggedSourceKeys) {
                    draggedNodes = dragSource.findNodes(draggedSourceKeys);
                }
                else {
                    draggedNodes = [ui.draggable];
                }

                if($this.cfg.controlled) {
                    $this.droppedNodeParams = [];
                }

                $this.invalidSourceKeys = [];

                for(var i = (draggedNodes.length - 1); i >= 0; i--) {
                    var draggedNode = $(draggedNodes[i]),
                    dragMode = ui.draggable.data('dragmode'),
                    dragNode = draggedNode.is('li.ui-treenode') ? draggedNode : draggedNode.closest('li.ui-treenode'),
                    dragNode = (isDroppedNodeCopy) ? dragNode.clone() : dragNode,
                    targetDragNode = $this.findTargetDragNode(dragNode, dragMode);

                    dragNodeKey = $this.getRowKey(targetDragNode);

                    if(!transfer && dropNodeKey && dropNodeKey.indexOf(dragNodeKey + '_') === 0) {
                        return;
                    }

                    if($this.cfg.controlled) {
                        $this.droppedNodeParams.push({
                            'ui': ui,
                            'dragSource': dragSource,
                            'dragNode': dragNode,
                            'targetDragNode': targetDragNode,
                            'dropPoint': dropPoint,
                            'dropNode': dropNode,
                            'transfer': transfer
                        });
                    }
                    else {
                        $this.onDropPoint(ui, dragSource, dragNode, targetDragNode, dropPoint, dropNode, transfer);
                    }
                }

                if (!draggedSourceKeys) {
                    draggedSourceKeys = [dragNodeKey];
                }
                draggedSourceKeys = draggedSourceKeys.filter(function(key) {
                    return $.inArray(key, $this.invalidSourceKeys) === -1;
                });
                
                var dndIndex = dropPoint.prevAll('li.ui-treenode').length;
                if (draggedSourceKeys && draggedSourceKeys.length) {
                    draggedSourceKeys = draggedSourceKeys.reverse().join(',');
                    $this.fireDragDropEvent({
                        'dragNodeKey': draggedSourceKeys,
                        'dropNodeKey': dropNodeKey,
                        'dragSource': dragSource.id,
                        'dndIndex': dndIndex,
                        'transfer': transfer,
                        'isDroppedNodeCopy': isDroppedNodeCopy
                    });
                }

                dragSource.draggedSourceKeys = null;
                $this.invalidSourceKeys = null;

                if(isDroppedNodeCopy) {
                    $this.initDraggable();
                }
            }
        });
    }

    /**
     * Callback for when a node was dropped on a drop point.
     * @private
     * @param {JQueryUI.DroppableOptions} ui Details about the drop event.
     * @param {PrimeFaces.widget.VerticalTree} dragSource Tree widget of the dragged node.
     * @param {JQuery} dragNode Node that was dragged.
     * @param {JQuery} targetDragNode Node that was the target of the drag.
     * @param {JQuery} dropPoint The drop point where the node was dropped.
     * @param {JQuery} dropNode The node on which the dragged node was dropped.
     * @param {boolean} transfer Whether a transfer should occur, i.e. whether the node was not dropped on itself.
     */
    onDropPoint(ui, dragSource, dragNode, targetDragNode, dropPoint, dropNode, transfer) {
        var dragNodeDropPoint = targetDragNode.next('li.ui-tree-droppoint'),
        oldParentNode = targetDragNode.parent().closest('li.ui-treenode-parent');

        ui.helper.remove();
        dropPoint.removeClass('ui-state-hover');

        var validDrop = this.validateDropPoint(dragNode, dropPoint);
        if(!validDrop) {
            if (this.invalidSourceKeys) {
                var dragNodeKey = this.getRowKey(targetDragNode);
                this.invalidSourceKeys.push(dragNodeKey);
            }
            return;
        }

        targetDragNode.hide().insertAfter(dropPoint);

        if(transfer) {
            if(dragSource.cfg.selectionMode) {
                dragSource.unselectSubtree(targetDragNode);
            }

            dragNodeDropPoint.remove();
            this.updateDragDropBindings(targetDragNode);
        }
        else {
            dragNodeDropPoint.insertAfter(targetDragNode);
        }

        if(oldParentNode.length && (oldParentNode.find('> ul.ui-treenode-children > li.ui-treenode').length === 0)) {
            this.makeLeaf(oldParentNode);
        }

        targetDragNode.fadeIn();

        if(this.isCheckboxSelection()) {
            this.syncDNDCheckboxes(dragSource, oldParentNode, dropNode);
        }

        this.syncDragDrop();
        if(transfer) {
            dragSource.syncDragDrop();
        }
    }

    /**
     * Sets up the JQuery UI dropables for the droppable nodes.
     * @private
     * @param {JQuery} elements List of elements to make droppable.
     */
    makeDropNodes(elements) {
        var $this = this,
        dragdropScope = this.cfg.dragdropScope||this.id;

        elements.droppable({
            accept: '.ui-treenode-content',
            tolerance: 'pointer',
            scope: dragdropScope,
            over: function(event, ui) {
                $(this).children('.ui-treenode-content').addClass('ui-state-hover');
            },
            out: function(event, ui) {
                $(this).children('.ui-treenode-content').removeClass('ui-state-hover');
            },
            drop: function(event, ui) {
                var dragSource = PF($(ui.draggable.data('dragsourceid')).data('widget')),
                dropSource = $this,
                droppable = $(this),
                dropNode = droppable.closest('li.ui-treenode'),
                dropNodeKey = $this.getRowKey(dropNode),
                transfer = (dragSource.id !== dropSource.id),
                draggedSourceKeys = dragSource.draggedSourceKeys,
                isDroppedNodeCopy = ($this.cfg.dropCopyNode && $this.shiftKey),
                draggedNodes,
                dragNodeKey,
                dndIndex;

                if(draggedSourceKeys) {
                    draggedNodes = dragSource.findNodes(draggedSourceKeys);
                }
                else {
                    draggedNodes = [ui.draggable];
                }

                if($this.cfg.controlled) {
                    $this.droppedNodeParams = [];
                }

                $this.invalidSourceKeys = [];

                for(var i = 0; i < draggedNodes.length; i++) {
                    var draggedNode = $(draggedNodes[i]),
                    dragMode = ui.draggable.data('dragmode'),
                    dragNode = draggedNode.is('li.ui-treenode') ? draggedNode : draggedNode.closest('li.ui-treenode'),
                    dragNode = (isDroppedNodeCopy) ? dragNode.clone() : dragNode,
                    targetDragNode = $this.findTargetDragNode(dragNode, dragMode);

                    if(i === 0) {
                        dndIndex = dropNode.find('>.ui-treenode-children>li.ui-treenode').length;
                    }

                    dragNodeKey = $this.getRowKey(targetDragNode);

                    if(!transfer && dropNodeKey && dropNodeKey.indexOf(dragNodeKey + '_') === 0) {
                        return;
                    }

                    if($this.cfg.controlled) {
                        $this.droppedNodeParams.push({
                            'ui': ui,
                            'dragSource': dragSource,
                            'dragNode': dragNode,
                            'targetDragNode': targetDragNode,
                            'droppable': droppable,
                            'dropNode': dropNode,
                            'transfer': transfer
                        });
                    }
                    else {
                        $this.onDropNode(ui, dragSource, dragNode, targetDragNode, droppable, dropNode, transfer);
                    }
                }

                if (!draggedSourceKeys) {
                    draggedSourceKeys = [dragNodeKey];
                }
                draggedSourceKeys = draggedSourceKeys.filter(function(key) {
                    return $.inArray(key, $this.invalidSourceKeys) === -1;
                });

                if (draggedSourceKeys && draggedSourceKeys.length) {
                    draggedSourceKeys = draggedSourceKeys.reverse().join(',');
                    $this.fireDragDropEvent({
                        'dragNodeKey': draggedSourceKeys,
                        'dropNodeKey': dropNodeKey,
                        'dragSource': dragSource.id,
                        'dndIndex': dndIndex,
                        'transfer': transfer,
                        'isDroppedNodeCopy': isDroppedNodeCopy
                    });
                }

                dragSource.draggedSourceKeys = null;
                $this.invalidSourceKeys = null;

                if(isDroppedNodeCopy) {
                    $this.initDraggable();
                }
            }
        });
    }

    /**
     * Callback for when a node was dropped.
     * @private
     * @param {JQueryUI.DroppableOptions} ui Details about the drop event.
     * @param {PrimeFaces.widget.VerticalTree} dragSource Tree widget of the dragged node.
     * @param {JQuery} dragNode Node that was dragged.
     * @param {JQuery} targetDragNode Node that was the target of the drag.
     * @param {JQuery} droppable The jQUery UI droppable where the drop occurred.
     * @param {JQuery} dropNode The node on which the dragged node was dropped.
     * @param {boolean} transfer Whether a transfer should occur.
     */
    onDropNode(ui, dragSource, dragNode, targetDragNode, droppable, dropNode, transfer) {
        var dragNodeDropPoint = targetDragNode.next('li.ui-tree-droppoint'),
        oldParentNode = targetDragNode.parent().closest('li.ui-treenode-parent'),
        childrenContainer = dropNode.children('.ui-treenode-children');

        ui.helper.remove();
        droppable.children('.ui-treenode-content').removeClass('ui-state-hover');

        var validDrop = this.validateDropNode(dragNode, dropNode, oldParentNode);
        if(!validDrop) {
            if (this.invalidSourceKeys) {
                var dragNodeKey = this.getRowKey(targetDragNode);
                this.invalidSourceKeys.push(dragNodeKey);
            }
            return;
        }

        if(childrenContainer.children('li.ui-treenode').length === 0) {
            this.makeParent(dropNode);
        }

        targetDragNode.hide();
        childrenContainer.append(targetDragNode);

        if(oldParentNode.length && (oldParentNode.find('> ul.ui-treenode-children > li.ui-treenode').length === 0)) {
            this.makeLeaf(oldParentNode);
        }

        if(transfer) {
            if(dragSource.cfg.selectionMode) {
                dragSource.unselectSubtree(targetDragNode);
            }

            dragNodeDropPoint.remove();
            this.updateDragDropBindings(targetDragNode);
        }
        else {
            childrenContainer.append(dragNodeDropPoint);
        }

        targetDragNode.fadeIn();

        if(this.isCheckboxSelection()) {
            this.syncDNDCheckboxes(dragSource, oldParentNode, dropNode);
        }

        this.syncDragDrop();
        if(transfer) {
            dragSource.syncDragDrop();
        }
    }

    /**
     * Filters the given array of row keys and removes child nodes of parent node in the array.
     * @private
     * @param {string[]} arr A list of row keys to check.
     * @return {string[]} A list of parent row keys.
     */
    findSelectedParentKeys(arr) {
        for(var i = 0; i < arr.length; i++) {
            var key = arr[i];
            for(var j = 0; j < arr.length && key !== -1; j++) {
                var tempKey = arr[j];
                if(tempKey !== -1 && key.length > tempKey.length && key.indexOf(tempKey + '_') === 0) {
                    arr[i] = -1;
                }
            }
        }

        return arr.filter(function(item) {
            return item !== -1;
        });
    }

    /**
     * Initializes all drop scrollers of this tree.
     * @private
     */
    initDropScrollers() {
        var $this = this,
        dragdropScope = this.cfg.dragdropScope||this.id;

        this.jq.prepend('<div class="ui-tree-scroller ui-tree-scrollertop"></div>').append('<div class="ui-tree-scroller ui-tree-scrollerbottom"></div>');

        this.jq.children('div.ui-tree-scroller').droppable({
            accept: '.ui-treenode-content',
            tolerance: 'pointer',
            scope: dragdropScope,
            over: function() {
                var step = $(this).hasClass('ui-tree-scrollertop') ? -10 : 10;

                $this.scrollInterval = setInterval(function() {
                    $this.scroll(step);
                }, 100);
            },
            out: function() {
                clearInterval($this.scrollInterval);
            }
        });
    }

    /**
     * Scrolls this tree by the given amount.
     * @param {number} step Amount by which to scroll.
     */
    scroll(step) {
        this.container.scrollTop(this.container.scrollTop() + step);
    }

    /**
     * Updates the drag&drop settings for the given node.
     * @private
     * @param {JQuery} node Node to update.
     */
    updateDragDropBindings(node) {
        //self droppoint
        node.after('<li class="ui-tree-droppoint ui-droppable"></li>');
        this.makeDropPoints(node.next('li.ui-tree-droppoint'));

        //descendant droppoints
        var subtreeDropPoints = node.find('li.ui-tree-droppoint');
        if(subtreeDropPoints.hasClass('ui-droppable') && !this.shiftKey && !this.cfg.dropCopyNode) {
            subtreeDropPoints.droppable('destroy');
        }
        this.makeDropPoints(subtreeDropPoints);

        //descendant drop node contents
        var subtreeDropNodeContents = node.find('.ui-treenode-content');
        if(subtreeDropNodeContents.hasClass('ui-droppable') && !this.shiftKey && !this.cfg.dropCopyNode) {
            subtreeDropNodeContents.droppable('destroy');
        }
        this.makeDropNodes(subtreeDropNodeContents);

        if(this.cfg.draggable) {
            subtreeDropNodeContents.data({
                'dragsourceid': this.jqId,
                'dragmode': this.cfg.dragMode
            });
        }
    }

    /**
     * Locates the target drag node, depending on the given drag mode.
     * @private
     * @param {JQuery} dragNode Node that was dragged.
     * @param {PrimeFaces.widget.BaseTree.DragMode} dragMode The current drag mode of this tree.
     * @return {JQuery} The resolved target drag node.
     */
    findTargetDragNode(dragNode, dragMode) {
        var targetDragNode = null;

        if(dragMode === 'self') {
            targetDragNode = dragNode;
        } else if(dragMode === 'parent') {
            targetDragNode = dragNode.parent().closest('li.ui-treenode');
        } else if(dragMode === 'ancestor') {
            targetDragNode = dragNode.parent().parents('li.ui-treenode:last');
        }

        if(targetDragNode.length === 0) {
            targetDragNode = dragNode;
        }

        return targetDragNode;
    }

    /**
     * Finds the nodes with the given row keys.
     * @param {string[]} rowkeys A list of row keys.
     * @return {JQuery[]} A list of nodes corresponding to the given row keys, in that order.
     */
    findNodes(rowkeys) {
        var nodes = [];
        for(var i = 0; i < rowkeys.length; i++) {
            nodes.push($(this.jqId + '\\:' + rowkeys[i]));
        }

        return nodes;
    }

    /**
     * Updates the row keys of all nodes.
     * @private
     */
    updateRowKeys() {
        var children = this.jq.find('> ul.ui-tree-container > li.ui-treenode');
        this.updateChildrenRowKeys(children, null);
    }

    /**
     * Updates the row keys of all given children.
     * @private
     * @param {JQuery} children List of children to update.
     * @param {string | null} rowkey Base prefix for the new rowkey.
     */
    updateChildrenRowKeys(children, rowkey) {
        var $this = this;

        children.each(function(i) {
            var childNode = $(this),
            oldRowKey = childNode.attr('data-rowkey'),
            newRowKey = (rowkey === null) ? i.toString() : rowkey + '_' + i;

            childNode.attr({
                'id': $this.id + ':' + newRowKey,
                'data-rowkey' : newRowKey
            });

            if(childNode.hasClass('ui-treenode-parent')) {
                $this.updateChildrenRowKeys(childNode.find('> ul.ui-treenode-children > li.ui-treenode'), newRowKey);
            }
        });
    }

    /**
     * After a drag&drop, validates if the drop is allowed.
     * @private
     * @param {JQuery} dragNode Node that was dragged.
     * @param {JQuery} dropPoint Element where the node was dropped.
     * @return {boolean} Whether the drop is allowed.
     */
    validateDropPoint(dragNode, dropPoint) {
        //dropped before or after
        if(dragNode.next().get(0) === dropPoint.get(0)||dragNode.prev().get(0) === dropPoint.get(0)) {
            return false;
        }

        //descendant of dropnode
        if(dragNode.has(dropPoint.get(0)).length) {
            return false;
        }

        //drop restriction
        if(this.cfg.dropRestrict) {
            if(this.cfg.dropRestrict === 'sibling' && dragNode.parent().get(0) !== dropPoint.parent().get(0)) {
                return false;
            }
        }

        return true;
    }

    /**
     * After a drag&drop, validates if the drop is allowed.
     * @private
     * @param {JQuery} dragNode Node that was dragged.
     * @param {JQuery} dropNode Node on which the dragged node was dropped.
     * @param {JQuery} oldParentNode Old parent of the dragged node.
     * @return {boolean} Whether the drop is allowed.
     */
    validateDropNode(dragNode, dropNode, oldParentNode) {
        //dropped on parent
        if(oldParentNode.get(0) === dropNode.get(0))
            return false;

        //descendant of dropnode
        if(dragNode.has(dropNode.get(0)).length) {
            return false;
        }

        //drop restriction
        if(this.cfg.dropRestrict) {
            if(this.cfg.dropRestrict === 'sibling') {
                return false;
            }
        }

        return true;
    }

    /**
     * Turns the given node into a leaf node.
     * @private
     * @param {JQuery} node A new leaf node to convert.
     */
    makeLeaf(node) {
        node.removeClass('ui-treenode-parent').addClass('ui-treenode-leaf');
        node.find('> .ui-treenode-content > .ui-tree-toggler').addClass('ui-treenode-leaf-icon').removeClass('ui-tree-toggler ui-icon ui-icon-triangle-1-s');
        node.children('.ui-treenode-children').hide().children().remove();
    }

    /**
     * Turns the given node into a parent node.
     * @private
     * @param {JQuery} node A new parent node to convert.
     */
    makeParent(node) {
        node.removeClass('ui-treenode-leaf').addClass('ui-treenode-parent');
        node.find('> .ui-treenode-content > span.ui-treenode-leaf-icon').removeClass('ui-treenode-leaf-icon').addClass('ui-tree-toggler ui-icon ' + this.cfg.collapsedIcon);
        node.children('.ui-treenode-children').append('<li class="ui-tree-droppoint ui-droppable"></li>');

        this.makeDropPoints(node.find('> ul.ui-treenode-children > li.ui-tree-droppoint'));
    }

    /**
     * Updates the tree after a drag&drop event.
     * @private
     */
    syncDragDrop() {
        var $this = this;

        if(this.cfg.selectionMode) {
            var selectedNodes = this.findNodes(this.selections);

            this.updateRowKeys();
            this.selections = [];
            $.each(selectedNodes, function(i, item) {
                $this.selections.push(item.attr('data-rowkey'));
            });
            this.writeSelections();
        }
        else {
            this.updateRowKeys();
        }
    }

    /**
     * Updates all checkboxes after a drag&drop.
     * @private
     * @param {PrimeFaces.widget.VerticalTree} dragSource Tree widget that is the source of the drag, when dragging
     * between two widgets.
     * @param {JQuery} oldParentNode Old node that was parent of the dropped node.
     * @param {JQuery} newParentNode New node that is to be the parent of the dropped node.
     */
    syncDNDCheckboxes(dragSource, oldParentNode, newParentNode) {
        if(oldParentNode.length) {
            dragSource.propagateDNDCheckbox(oldParentNode);
        }

        if(newParentNode.length) {
            this.propagateDNDCheckbox(newParentNode);
        }
    }

    /**
     * Unselects the node and all child nodes.
     * @param {JQuery} node Node to unselect.
     */
    unselectSubtree(node) {
        var $this = this;

        if(this.isCheckboxSelection()) {
            var checkbox = node.find('> .ui-treenode-content > .ui-chkbox');

            this.toggleCheckboxState(checkbox, true);

            node.children('.ui-treenode-children').find('.ui-chkbox').each(function() {
                $this.toggleCheckboxState($(this), true);
            });
        }
        else {
            node.find('.ui-treenode-content.ui-state-highlight').each(function() {
                $(this).removeClass('ui-state-highlight').closest('li.ui-treenode').attr('aria-selected', false).removeClass('ui-treenode-selected').addClass('ui-treenode-unselected');
            });
        }
    }

    /**
     * Updates the drag&drop checkboxes.
     * @private
     * @param {JQuery} node Node to which to limit the update.
     */
    propagateDNDCheckbox(node) {
        var checkbox = node.find('> .ui-treenode-content > .ui-chkbox'),
        children = node.find('> .ui-treenode-children > .ui-treenode');

        if(children.length) {
            if(children.filter('.ui-treenode-unselected').length === children.length)
                this.uncheck(checkbox);
            else if(children.filter('.ui-treenode-selected').length === children.length)
                this.check(checkbox);
            else
                this.partialCheck(checkbox);
        }

        var parent = node.parent().closest('.ui-treenode-parent');
        if(parent.length) {
            this.propagateDNDCheckbox(parent);
        }
    }

    /**
     * Callback for when a drag&drop occurred. Invokes the appropriate behaviors.
     * @private
     * @param {JQuery.TriggeredEvent} event Event that triggered the drag&drop.
     */
    fireDragDropEvent(event) {
        var $this = this,
        options = {
            source: this.id,
            process: event.transfer ? this.id + ' ' + event.dragSource : this.id
        };

        options.params = [
            {name: this.id + '_dragdrop', value: true},
            {name: this.id + '_dragNode', value: event.dragNodeKey},
            {name: this.id + '_dragSource', value: event.dragSource},
            {name: this.id + '_dropNode', value: event.dropNodeKey},
            {name: this.id + '_dndIndex', value: event.dndIndex},
            {name: this.id + '_isDroppedNodeCopy', value: event.isDroppedNodeCopy}
        ];

        if(this.cfg.controlled) {
            options.oncomplete = function(xhr, status, args, data) {
                if(args.access) {
                    for(var i = 0; i < $this.droppedNodeParams.length; i++) {
                        var params = $this.droppedNodeParams[i];
                        if(params.dropPoint)
                            $this.onDropPoint(params.ui, params.dragSource, params.dragNode, params.targetDragNode, params.dropPoint, params.dropNode, params.transfer);
                        else
                            $this.onDropNode(params.ui, params.dragSource, params.dragNode, params.targetDragNode, params.droppable, params.dropNode, params.transfer);
                    }
                }
            };
        }

        if(this.hasBehavior('dragdrop')) {
            this.callBehavior('dragdrop', options);
        }
        else {
            PrimeFaces.ajax.Request.handle(options);
        }
    }

    /**
     * @override
     * @inheritdoc
     * @return {boolean}
     */
    isEmpty() {
        return (this.container.children().length === 0);
    }

    /**
     * Finds the first node.
     * @return {JQuery} The first node of this tree.
     */
    getFirstNode() {
        return this.jq.find("> ul.ui-tree-container > li.ui-treenode").first();
    }

    /**
     * Finds the content element for the given node.
     * @param {JQuery} node Node for which to find the corresponding content.
     * @return {JQuery} The element with the content for the given node.
     */
    getNodeContent(node) {
        return node.find('> .ui-treenode-content');
    }

    /**
     * @override
     * @protected
     * @inheritdoc
     * @param {JQuery} node
     */
    focusNode(node) {
        if(this.focusedNode) {
            this.getNodeContent(this.focusedNode).removeClass('ui-treenode-outline');
        }

        this.getNodeContent(node).addClass('ui-treenode-outline').trigger('focus');
        this.focusedNode = node;
    }

    /**
     * Applies the current filter value by sending an AJAX to the server.
     */
    filter() {
        var $this = this,
        options = {
            source: this.id,
            update: this.id,
            process: this.id,
            global: false,
            formId: this.getParentFormId(),
            params: [{name: this.id + '_filtering', value: true},
                     {name: this.id + '_encodeFeature', value: true}],
            onsuccess: function(responseXML, status, xhr) {
                PrimeFaces.ajax.Response.handle(responseXML, status, xhr, {
                    widget: $this,
                    handle: function(content) {
                        $this.container.html(content);
                    }
                });

                return true;
            },
            oncomplete: function() {
                if ($this.cfg.filterMode === 'contains') {
                    var notLeafNodes = $this.container.find('li.ui-treenode:not(.ui-treenode-leaf):visible');
                    for(var i = 0; i < notLeafNodes.length; i++) {
                        var node = notLeafNodes.eq(i),
                        hasChildNodes = node.children('.ui-treenode-children:empty').length;

                        if(hasChildNodes) {
                            node.removeClass('ui-treenode-parent').addClass('ui-treenode-leaf')
                                .find('> .ui-treenode-content > .ui-tree-toggler').removeClass('ui-tree-toggler ui-icon ' + this.cfg.collapsedIcon).addClass('ui-treenode-leaf-icon');
                        }
                    }
                }

                if ($this.cfg.draggable) {
                    $this.initDraggable();
                }

                if ($this.cfg.droppable) {
                    $this.initDroppable();
                }
            }
        };

        if(this.hasBehavior('filter')) {
            this.callBehavior('filter', options);
        }
        else {
            PrimeFaces.ajax.Request.handle(options);
        }

    }

    /**
     * Reads the saved scroll position from the hidden input field and applies it.
     * @private
     */
    restoreScrollState() {
        var scrollState = this.scrollStateHolder.val(),
        scrollValues = scrollState.split(',');

        this.jq.scrollLeft(scrollValues[0]);
        this.jq.scrollTop(scrollValues[1]);
    }

    /**
     * Saves the current scroll position to the hidden input field.
     * @private
     */
    saveScrollState() {
        var scrollState = this.jq.scrollLeft() + ',' + this.jq.scrollTop();

        this.scrollStateHolder.val(scrollState);
    }

    /**
     * Resets the value of the hidden input field with the current scroll position.
     * @private
     */
    clearScrollState() {
        this.scrollStateHolder.val('0,0');
    }

}
