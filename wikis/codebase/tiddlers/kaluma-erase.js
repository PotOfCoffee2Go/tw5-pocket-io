/**
 * Erase user code
 * @param {SerialPort} serial The serial port where device connected
 * @returns {Promise}
 */
$tpi.kaluma.erase = function erase(serial) {
	return new Promise((resolve) => {
		serial.write("\r");
		serial.write(".flash -e\r");
		setTimeout(() => {
			resolve();
		}, 500);
	});
}
