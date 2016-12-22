/* Copyright (c) 2016 Nordic Semiconductor. All Rights Reserved.
 *
 * The information contained herein is property of Nordic Semiconductor ASA.
 * Terms and conditions of usage are described in detail in NORDIC
 * SEMICONDUCTOR STANDARD SOFTWARE LICENSE AGREEMENT.
 *
 * Licensees are granted free, non-transferable use of the information. NO
 * WARRANTY of ANY KIND is provided. This heading must NOT be removed from
 * the file.
 *
 */

'use strict';

import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import Component from 'react-pure-render/component';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { DropdownButton, MenuItem } from 'react-bootstrap';

import * as AdapterActions from '../../actions/mesh/meshAdapterActions';

import ConfirmationDialog from '../../components/ConfirmationDialog';

import uuidV4 from 'uuid-v4';

class AdapterSelector extends Component {
    constructor(props) {
        super(props);
    }

    focusOnComPorts() {
        const dropDown = ReactDOM.findDOMNode(this.refs.comPortDropdown);
        dropDown.firstChild.focus();
        dropDown.firstChild.click();
    }

    componentDidMount() {
        window.addEventListener('core:select-adapter', function () {
            this.focusOnComPorts();
        }.bind(this));
    }

    compareAdapterNodes(nodeA, nodeB) {
        if (!nodeA.props.eventKey || !nodeB.props.eventKey) { return 0; }

        const portA = nodeA.props.eventKey;
        const portB = nodeB.props.eventKey;

        // Trick: COM1 and COM10 sorts equally with regular sort, use length to differentiate them
        if (portA.length > portB.length) { return 1; }

        if (portA.length < portB.length) { return -1; }

        // Use regulart text comparison on names of equal length
        if (portA > portB) {
            return 1;
        } else if (portA < portB) {
            return -1;
        } else {
            return 0;
        }
    }

    render() {
        const {
            adapters,
            adapterStatus,
            adapterIndicator,
        } = this.props.adapter;

        const {
            connectToAdapter, //mesh
            closeAdapter,
        } = this.props;
     
        const adapterNodes = [];

        adapters.forEach((adapter, i) => {
            const port = adapter.state.get('port');
            const serialnumber = adapter.state.get('serialNumber');
            const portDescription = [];
            portDescription.push(<div className='serialPort' key={uuidV4()}>{port}</div>);

            if (serialnumber) {
                portDescription.push(<div className='serialSerialnumber' key={uuidV4()}>{serialnumber}</div>);
            } else {
                portDescription.push(<div className='serialSerialnumber' key={uuidV4()}>&nbsp;</div>);
            }

            adapterNodes.push(<MenuItem className='btn-primary' eventKey={port} onSelect={() => connectToAdapter(port)} key={i}>{portDescription}</MenuItem>);
        });

        adapterNodes.sort(this.compareAdapterNodes);

        const selectedAdapter = this.props.adapter.api.selectedAdapter;

        if (selectedAdapter) {
            adapterNodes.push(<MenuItem className='btn-primary' onSelect={() => closeAdapter(selectedAdapter)} key={"Last"}>Close Adapter</MenuItem>);
        }

        return (
            <span title='Select serial port (Alt+P)'>
                <div className='padded-row'>
                    <DropdownButton id='navbar-dropdown' className='btn-primary btn-nordic' title={adapterStatus} ref='comPortDropdown'>
                        {adapterNodes}
                    </DropdownButton>
                    <div className={'indicator ' + adapterIndicator}></div>
                </div>     
            </span>
        );
    }
}

function mapStateToProps(state) {
    const { adapter } = state;
    
    return {
        adapter: adapter,
        adapterStatus: adapter.adapterStatus,
        adapterIndicator: adapter.adapterIndicator,
        adapters: adapter.adapters,
    };
}

function mapDispatchToProps(dispatch) {
    let retval = Object.assign(
            {},
            bindActionCreators(AdapterActions, dispatch),
        );
    return retval;
}

export default connect(
    mapStateToProps,
    mapDispatchToProps)(AdapterSelector);

AdapterSelector.propTypes = {
    adapters: PropTypes.object.isRequired,
};