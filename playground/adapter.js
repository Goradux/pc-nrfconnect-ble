// import { AdapterFactory, FirmwareRegistry } from "pc-ble-driver-js";
const {
  AdapterFactory,
  FirmwareRegistry,
  adapter,
} = require("pc-ble-driver-js");

const adapterFactory = AdapterFactory.getInstance(null, {
  enablePolling: false,
});

function adapterOpenAction(adapter) {
  return {
    type: "ADAPTER_OPEN",
    adapter,
  };
}

function adapterOpenedAction(adapter) {
  return {
    type: "ADAPTER_OPENED",
    adapter,
  };
}

// TODO: implement
function closeSelectedAdapter(dispatch, getState) {
  return new Promise((resolve, reject) => {
    resolve();
  });
}

exports.initAdapter = function initAdapter(device) {
  return (dispatch) => {
    if (device.serialport) {
      const { serialNumber } = device;
      // Prefer to use the serialport 8 property or fall back to the serialport 7 property

      const portPath = device.serialport.path || device.serialport.comName;
      //   COM10?
      const portPath = "COM10";

      //   if (device.traits.includes("jlink")) {
      //     if (isSupportedJLinkDevice(device.boardVersion)) {
      //       dispatch(openJlinkAdapter(portPath, serialNumber));
      //     } else {
      //       logger.info(
      //         "The device is not in the list of supported devices. " +
      //           "Attempting to open as a custom device."
      //       );
      //       dispatch(openCustomAdapter(portPath));
      //     }
      //   } else

      //   if (device.traits.includes("nordicUsb")) {
      dispatch(openNordicUsbAdapter(portPath));
      //   }

      //   else {
      //     dispatch(openCustomAdapter(portPath));
      //   }
    } else {
      console.log("Device has no serial port. Cannot open device.");
    }
  };
};

exports.openNordicUsbAdapter = function openNordicUsbAdapter(portPath) {
  return (dispatch) => {
    const {
      version,
      baudRate,
      sdBleApiVersion,
    } = FirmwareRegistry.getNordicUsbConnectivityFirmware();
    console.log(
      `Connectivity firmware version: ${version}. ` +
        `SoftDevice API version: ${sdBleApiVersion}. Baud rate: ${baudRate}.`
    );
    dispatch(openAdapter(portPath, baudRate, sdBleApiVersion));
  };
};

// eslint-disable-next-line import/prefer-default-export
exports.openAdapter = function openAdapter(
  portPath,
  baudRate,
  sdBleApiVersion
) {
  return (dispatch, getState) =>
    Promise.resolve()
      .then(() => {
        // Check if we already have an adapter open, if so, close it
        if (getState().app.adapter.bleDriver.adapter !== null) {
          return closeSelectedAdapter(dispatch, getState);
        }
        return Promise.resolve();
      })
      .then(() => {
        const adapter = adapterFactory.createAdapter(
          `v${sdBleApiVersion}`,
          portPath,
          portPath
        );
        dispatch(adapterOpenAction(adapter));
        setupListeners(dispatch, getState, adapter);

        const openOptions = {
          baudRate,
          parity: "none",
          flowControl: "none",
          eventInterval: 0,
          logLevel: "debug",
          enableBLE: false,
        };

        // Opening adapter fails occasionally when trying to open right after the device
        // has been set up. Applying this setTimeout hack, so that the port/devkit has
        // some time to clean up before we open.
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            adapter.open(openOptions, (error) => {
              if (error) {
                reject(error);
              } else {
                dispatch(adapterOpenedAction(adapter));
                resolve(adapter);
              }
            });
          }, 500);
        });
      })
      .catch((error) => logger.error(error.message));
};

////////////////////////////////////////////////////////////////////////////////

exports.connectToDevice = function connectToDevice(device) {
  return (dispatch, getState) =>
    new Promise((resolve, reject) => {
      //   const adapterToUse = getState().app.adapter.bleDriver.adapter;
      //   const adapterToUse = adapter.bleDriver.adapter;
      const adapterToUse = adapter.Adapter.bleDriver();

      if (adapterToUse === null) {
        reject(new Error("No adapter selected"));
      }

      const connectionParameters = {
        min_conn_interval: 7.5,
        max_conn_interval: 7.5,
        slave_latency: 0,
        conn_sup_timeout: 4000,
      };

      const scanParameters = {
        active: true,
        interval: 100,
        window: 50,
        timeout: 20,
      };

      const options = {
        scanParams: scanParameters,
        connParams: connectionParameters,
      };

      dispatch(deviceConnectAction(device));

      adapterToUse.connect(
        { address: device.address, type: device.addressType },
        options,
        (error) => {
          if (error) {
            reject(new Error(error.message));
          } else {
            resolve();
          }
        }
      );
    }).catch((error) => {
      dispatch(showErrorDialog(error));
    });
};

exports.disconnectFromDevice = function disconnectFromDevice(device) {
  return (dispatch, getState) =>
    new Promise((resolve, reject) => {
      const adapterToUse = getState().app.adapter.bleDriver.adapter;

      if (adapterToUse === null) {
        reject(new Error("No adapter selected"));
      }

      adapterToUse.disconnect(
        device.instanceId,
        (error, disconnectedDevice) => {
          if (error) {
            reject(new Error(error.message));
          } else {
            resolve(disconnectedDevice);
          }
        }
      );
    }).catch((error) => {
      dispatch(showErrorDialog(error));
    });
};

////////////////////////////////////////////////////////////////////////////////
console.log("Adapter library imported successfully");
