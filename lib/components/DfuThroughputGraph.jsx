/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/* eslint react/forbid-prop-types: off */

import { scaleLinear } from 'd3';
import PropTypes from 'prop-types';
import React from 'react';
import { LineChart } from 'react-d3-components';
import sizeMe from 'react-sizeme';

const HEIGHT = 250;
const MARGIN = {
    top: 10,
    bottom: 30,
    left: 30,
    right: 0,
};

function createGraphData(kbpsPoints, averageKbpsPoints) {
    return [{
        label: 'average kB/s',
        values: averageKbpsPoints,
    }, {
        label: 'kB/s',
        values: kbpsPoints,
    }];
}

function createXScale(totalSizeKb, width) {
    const linearScale = scaleLinear();
    return linearScale.domain([0, totalSizeKb]).range([0, width - MARGIN.left - 1]);
}

class DfuThroughputGraph extends React.PureComponent {
    getWidth() {
        // The size prop is added by react-sizeme
        const { size } = this.props;
        const fallbackWidth = 400;
        return size ? size.width : fallbackWidth;
    }

    render() {
        const { totalSizeKb, kbpsPoints, averageKbpsPoints } = this.props;
        const width = this.getWidth();

        if (kbpsPoints.length > 0) {
            return (
                <LineChart
                    data={createGraphData(kbpsPoints, averageKbpsPoints)}
                    width={width}
                    height={HEIGHT}
                    xScale={createXScale(totalSizeKb, width)}
                    xAxis={{ label: 'kB transferred' }}
                    margin={MARGIN}
                />
            );
        }
        return null;
    }
}

DfuThroughputGraph.propTypes = {
    totalSizeKb: PropTypes.number.isRequired,
    kbpsPoints: PropTypes.arrayOf(PropTypes.shape({
        x: PropTypes.number,
        y: PropTypes.number,
    })).isRequired,
    averageKbpsPoints: PropTypes.arrayOf(PropTypes.shape({
        x: PropTypes.number,
        y: PropTypes.number,
    })).isRequired,
    size: PropTypes.object,
};

DfuThroughputGraph.defaultProps = {
    size: null,
};

// Wrap the component inside a react-sizeme higher order component (HOC). Makes
// the component aware of its size, so that the graph can be resized dynamically.
export default sizeMe()(DfuThroughputGraph);
