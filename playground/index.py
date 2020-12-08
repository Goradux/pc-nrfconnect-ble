import pc_ble_driver_py.ble_adapter as ble_adapter
import pc_ble_driver_py.observers as observers
import pc_ble_driver_py.config as config

config.__conn_ic_id__ = 'NRF52'

# adapter = ble_adapter.BLEAdapter(observers.BLEAdapterObserver())
from pc_ble_driver_py.ble_driver import BLEDriver
adapter = ble_adapter.BLEAdapter(ble_driver=BLEDriver(serial_port='COM10', baud_rate=1000000))

adapter.open()
results = adapter.service_discovery()
print(results)

# could be useful:
# adapter.enable_notification
# adapter.disable_notification
# adapter.write_req()