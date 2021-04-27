const parseXrandr = (out) => {
	var ind = 0;
	return out.split('\n').map(data => {
			const words = data.split(' ');
			if (data.indexOf(' connected ') > 0 && data.search(/[0-9]+x[0-9]+/) > 0) {
				const primary = words[2] == 'primary';
				const cropString = words[primary ? 3 : 2];
				const cropSplit = cropString.split(/[x\+]/);
				const mmXs = words[words.length-3];
				const mmYs = words[words.length-1];
				const mmX = parseInt(mmXs.replace(/[^0-9]/g,''));
				const mmY = parseInt(mmYs.replace(/[^0-9]/g,''));
				return {
					connected: true,
					size: {
						x: +cropSplit[0],
						y: +cropSplit[1],
					},
					offset: {
						x: +cropSplit[2],
						y: +cropSplit[3],
					},
					measurements: {
						x: +words[words.length-3].replace(/[^0-9]/g,''),
						y: +words[words.length-1].replace(/[^0-9]/g,''),
					},
					id: words[0],
					primary,
					cropString,
					index: ind++,
					rawData: data,
				}
			} else if (data.indexOf(' disconnected ') > 0 && data.search(/[\(\)]/) > 0) {
				return {
					connected: false,
					id: words[0],
					index: ind++,
					rawData: data,
				}
			}
		})
		.filter(e=>e!=undefined);
};
const util = require('util');
const childProcess = require('child_process');
const exec = util.promisify(childProcess.exec);
const getScreens = async () => {
	xrandrOutput = await exec('xrandr');
	screens = parseXrandr(xrandrOutput.stdout);
	return screens;
};
const getConnectedScreens = async () => {
	return (await getScreens()).filter(e=>e.connected);
};
if (require.main === module) {
	(async()=>{
		try {
			console.log(await getScreens());
		} catch (err) {
			console.error(err);
			process.exit(1);
			return;
		}
		process.exit();
	})();
} else {
	module.exports = getScreens;
	module.exports.getScreens = getScreens;
	module.exports.getConnectedScreens = getConnectedScreens;
	module.exports.parseXrandr = parseXrandr;
}

