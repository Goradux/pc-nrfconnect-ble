
import hotkey from 'react-hotkey';
import _ from 'underscore';
hotkey.activate();

/*
TreeViewKeyNavigation.mixin(propName) produces a mixin that provides keyboard navigation 
up and down the tree located in this[propName].
The currently selected item is stored in this.state.selected

Assumes:
	this.state.selected is the currently selected item
	this[propName] is an array of services

*/
var TreeViewKeyNavigation = {
	mixin: function(servicesProperty) {
		return _.extend({}, hotkey.Mixin('handleHotkey'), {
			handleHotkey: function(e) {
				if (!this[servicesProperty]) {
					return;
				}
		    	if (e.getModifierState('Alt')) {
			    	switch(e.key) {
			    		case "ArrowUp":
			    			this.setState({ selected: this._getPreviousVisible() });
			    			e.preventDefault();
			    			break;
			    		case "ArrowDown":
			    			this.setState({ selected: this._getNextVisible() });
			    			e.preventDefault();
			    			break;
		    			case "ArrowRight":
			    			this.setState({ selected: this._getNextChild() || this.state.selected });
			    			e.preventDefault();
			    			break;
			            default:
			                break;
			        }
			    }
		    },
		    *_traverseItems() {
		    	var services = this[servicesProperty];
		    	for (var i = 0; i < services.length; i++) {
		    		yield services[i];
			    	for (var j = 0; j < services[i].characteristics.length; j++) {
		    			yield services[i].characteristics[j];
				    	for (var k = 0; k < services[i].characteristics[j].descriptors.length; k++) {
		    				yield services[i].characteristics[j].descriptors[k];
				    	}
			    	}
		    	}
		    },
		    *_traverseItemsBackwards() {
		    	var services = this[servicesProperty];
		    	for (var i = services.length - 1; i >= 0; i--) {
			    	for (var j = services[i].characteristics.length - 1; j >= 0; j--) {
				    	for (var k = services[i].characteristics[j].descriptors.length - 1; k >= 0; k--) {
		    				yield services[i].characteristics[j].descriptors[k];
				    	}
		    			yield services[i].characteristics[j];
			    	}
		    		yield services[i];
		    	}
		    },
		    _getNextChild() {
		    	var foundCurrent = this.state.selected === null;
		    	var next;
		    	for (let item of this._traverseItems()) {
		    		if (foundCurrent) {
		    			next = item;
		    			break;
		    		}
		    		if (item === this.state.selected) foundCurrent = true;
		    	}
		    	var isChild = next && ((next.parent && next.parent === this.state.selected) || (next.parent && next.parent.parent && next.parent.parent === this.state.selected));
		    	return isChild ? next : null;
		    },
		    _getNextVisible() {
		    	var foundCurrent = this.state.selected === null;
		    	for (let item of this._traverseItems()) {
		    		if (foundCurrent && this._isVisible(item)) return item;
		    		if (item === this.state.selected) foundCurrent = true;
		    	}
		    	return this[servicesProperty][0];
		    },
		    _getPreviousVisible() {
		    	var foundCurrent = this.state.selected === null;
		    	for (let item of this._traverseItemsBackwards()) {
		    		if (foundCurrent && this._isVisible(item)) return item;
		    		if (item === this.state.selected) foundCurrent = true;
		    	}
		    	//walked through the list, return first visible
		    	for (let item of this._traverseItemsBackwards()) {
		    		if (this._isVisible(item)) return item;
		    	}
		    },
		    _isVisible(item) {
		    	if (item.parent && !item.parent.expanded) return false;
		    	if (item.parent && item.parent.parent && !item.parent.parent.expanded) return false;
		    	return true;
		    }
		});
	}
};

module.exports = TreeViewKeyNavigation;