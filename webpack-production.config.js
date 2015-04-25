module.exports = [
	require("./make-webpack-config")({
		longTermCaching: true,
		separateStylesheet: true,
		minimize: true,
		devtools: false,
		debug: false,
    babel: true,
		//модули которые меняются редко или почти никогда
		commonsChunk: ['react/addons', 'immutable', 'underscore']
	})
];