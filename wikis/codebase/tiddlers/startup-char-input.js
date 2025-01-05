// Single character input (experimental)
$tpi.stdin = $tpi.stdin ?? {};
$tpi.stdin.getNextChar = false;
$tpi.stdin.ifGetNextChar = function () {
	if ($tpi.stdin.getNextChar) {
		$tpi.stdin.getNextChar = false;
		return true;
	}
	return false;
}

$tpi.stdin.singleCharHandler = function (chunk) {
	if ($tpi.stdin.ifGetNextChar()) {
		if ($rt._previousKey.name !== 'return') { // enter key
			process.nextTick(() => $rt.write(null, {name:'return'}));
//			process.nextTick(() => $rt.write('b'));
		}
	}
}

// uncommment to activate
//process.stdin.on('data', $tpi.stdin.singleCharHandler);
