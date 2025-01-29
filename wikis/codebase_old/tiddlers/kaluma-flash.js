/**
 * Flash user code (.js)
 * @param {SerialPort} serial The serial port where device connected
 * @param {string} code Code to write
 * @param {function} packetCallback
 * @returns {Promise}
 */
$tpi.kaluma.flash = function flash(serial, code, packetCallback) {
	return new Promise((resolve, reject) => {
		// Turn to flash writing mode
		serial.write("\r");
		serial.write(".flash -w\r");
		setTimeout(() => {
			// Send the file via Ymodem protocol
			let buffer = Buffer.from(code, "utf8");
			$tpi.kaluma.ymodem.transfer(
				serial,
				"usercode",
				buffer,
				(err, result) => {
					if (err) {
						reject(err);
					} else {
						resolve(result);
					}
				},
				packetCallback
			);
		}, 500);
	});
}
