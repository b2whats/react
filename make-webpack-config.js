var path = require("path");
var webpack = require("webpack");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var loadersByExtension = require("./config/loadersByExtension");
var joinEntry = require("./config/joinEntry");


module.exports = function(options) {
	var entry = {
		main: reactEntry("main"),
		// second: reactEntry("second")
	};

	var root = path.join(__dirname, "web2/flux");
	var js_root = path.join(__dirname, "web2");
	//console.log('root root root',root);

	var loaders = {
		"coffee": "coffee-redux-loader",
		//"jsx": options.hotComponents ? ["react-hot-loader", "jsx-loader?harmony"] : "jsx-loader?harmony",
		"jsx": options.hotComponents ? ["react-hot-loader", "babel-loader?stage=0&externalHelpers"] : "babel-loader?stage=0&externalHelpers",
		//"js": ["envify-loader", "jsx-loader?harmony"],
		"js": 
			{
				loader: "babel-loader?stage=0&externalHelpers",
				include: js_root,
			},
		

		"json": "json-loader",
		// "js": {
			// loader: "6to5-loader",
			// include: path.join(__dirname, "app")
		// },
		"json5": "json5-loader",
		"txt": "raw-loader",
		"png|jpg|jpeg|gif|svg": "url-loader?limit=10000",
		"woff|woff2": "url-loader?limit=100000",
		"ttf|eot": "file-loader",
		"wav|mp3": "file-loader",
		
		//"html": "html-loader",
		
		"md|markdown": ["html-loader", "markdown-loader"]
	};
	var stylesheetLoaders = {
		"css": "css-loader",
		"less": "css-loader!less-loader",
		"styl": "css-loader!stylus-loader",
		"sass": options.devtool === 'sourcemap' || options.devtool === 'inline-source-map' ? 
			"css-loader?sourceMap!sass-loader?indentedSyntax=sass&includePaths[]=" + path.resolve(__dirname, 'web2/sass/node_modules') + "&sourceMap!sass-imports?../common_vars.json" : 
			"css-loader!autoprefixer-loader!sass-loader?indentedSyntax=sass&includePaths[]=" + path.resolve(__dirname, 'web2/sass/node_modules') + "!sass-imports?../common_vars.json",

		"scss": options.devtool === 'sourcemap' || options.devtool === 'inline-source-map' ? 
			"css-loader?sourceMap!sass-loader?includePaths[]=" + path.resolve(__dirname, 'web2/sass/node_modules') + "&sourceMap" : 
			"css-loader!autoprefixer-loader!sass-loader?includePaths[]=" + path.resolve(__dirname, 'web2/sass/node_modules') + "",
		
		/*
		"scss": options.devtool === 'sourcemap' || options.devtool === 'inline-source-map' ? 
			"css-loader?sourceMap!sass-loader?includePaths[]=" + path.resolve(__dirname, 'node_modules') + "&sourceMap!sass-imports?../common_vars.json" : 
			"css-loader!autoprefixer-loader!sass-loader!sass-imports?../common_vars.json",
		*/
	};
	
	var additionalLoaders = [
		//{ test: /\.html$/, loader: "save_file_to_dir" }

//		{ test: /\.scss$/, loader: ExtractTextPlugin.extract('style-loader',
// 					'css-loader?sourceMap!sass-loader?outputStyle=expanded&sourceMap=true&sourceMapContents=true') },
//		{ test: /\.sass$/, loader: ExtractTextPlugin.extract('style-loader',
// 					'css-loader?sourceMap!sass-loader?indentedSyntax=sass&outputStyle=expanded&sourceMap=true&sourceMapContents=true') }
//
	];


	var alias = {

	};
	var aliasLoader = {

	};
	var externals = [

	];
	
	var modulesDirectories = ["web_modules", "node_modules", "flux", "assets"];
	
	var extensions = ["", ".web.js", ".js", ".jsx"];
	
	
	var publicPath = options.devServer ?
		"http://" + process.env.EXT_IP + ":" + process.env.HOT_RELOAD_PORT + "/_assets/" :
		"/_assets/";
	

	var output = {
		path: path.join(__dirname, "build", options.prerender ? "prerender" : "public"),
		publicPath: publicPath,
		filename: "[name].js" + (options.longTermCaching && !options.prerender ? "?[chunkhash]" : ""),
		chunkFilename: (options.devServer ? "[id].js" : "[name].js") + (options.longTermCaching && !options.prerender ? "?[chunkhash]" : ""),
		sourceMapFilename: "debugging/[file].map",
		libraryTarget: options.prerender ? "commonjs2" : undefined,
		pathinfo: options.debug
	};

	var excludeFromStats = [
		/node_modules[\\\/]react(-router)?[\\\/]/,
		/node_modules[\\\/]items-store[\\\/]/
	];

	var plugins = [
		function() {
			if(!options.prerender) {
				this.plugin("done", function(stats) {
					var jsonStats = stats.toJson({
						chunkModules: true,
						exclude: excludeFromStats
					});
					jsonStats.publicPath = publicPath;
					require("fs").writeFileSync(path.join(__dirname, "build", "stats.json"), JSON.stringify(jsonStats, null, " "));
				});
			}
		},
		new webpack.PrefetchPlugin("react/addons"),
		new webpack.PrefetchPlugin("react/lib/ReactComponentBrowserEnvironment"),
		new webpack.PrefetchPlugin("immutable"),
	];


	if(options.prerender) {
		aliasLoader["react-proxy$"] = "react-proxy/unavailable";
		externals.push(
			/^react(\/.*)?$/,
			///^reflux(\/.*)?$/,
			//"superagent",
			"immutable"
		);
		plugins.push(new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }));
	}


	if(options.commonsChunk) {
		entry.commons = options.commonsChunk;

		plugins.push(new webpack.optimize.CommonsChunkPlugin("commons", "commons.js" + (options.longTermCaching && !options.prerender ? "?[chunkhash]" : "")));
	}


	function reactEntry(name) {
		return './web2/app.js'; //(options.prerender ? "./config/prerender?" : "./config/app?") + name;
	}
	

	Object.keys(stylesheetLoaders).forEach(function(ext) {
		var loaders = stylesheetLoaders[ext];
		if(Array.isArray(loaders)) loaders = loaders.join("!");
		if(options.prerender) {
			stylesheetLoaders[ext] = "null-loader";
		} else if(options.separateStylesheet) {
			stylesheetLoaders[ext] = ExtractTextPlugin.extract("style-loader", loaders);
		} else {
			stylesheetLoaders[ext] = "style-loader!" + loaders;
		}
	});


	if(options.separateStylesheet && !options.prerender) {
		plugins.push(new ExtractTextPlugin("[name].css" + (options.longTermCaching ? "?[contenthash]" : "")));
		//plugins.push(new ExtractTextPlugin("[name].css?[contenthash]"));
	}
	
	//plugins.push(new ExtractTextPlugin("[name].html" + (options.longTermCaching ? "?[contenthash]" : "")));
	//plugins.push(new ExtractTextPlugin("[name].html"));
	
	//потом добавить для соурмапов
	//plugins.push(new ExtractTextPlugin("[name].css" + (options.longTermCaching ? "?[contenthash]" : "")));

	if(options.minimize) {
		plugins.push(
			
			new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false,
        },
        sourceMap: false
      }),			
			new webpack.optimize.DedupePlugin()
		);
	}

	//собрать все переменные окружения
	var env_obj = Object.keys(process.env).reduce(function(o, k) {
        o[k] = JSON.stringify(process.env[k]);
        return o;
  }, {});

	if(options.minimize) {
  	env_obj.NODE_ENV = JSON.stringify("production");
  }

	plugins.push(
		new webpack.DefinePlugin({
      'process.env': env_obj
    })
  );

	if(options.minimize) {
		plugins.push(
			new webpack.optimize.OccurenceOrderPlugin(),
			new webpack.NoErrorsPlugin()
		);
	}

	return {
		entry: entry,
		output: output,
		target: options.prerender ? "node" : "web",
		context: __dirname,
		node: {
    	__filename: true
    },
		module: {
			loaders: loadersByExtension(loaders).concat(loadersByExtension(stylesheetLoaders)).concat(additionalLoaders)
		},
		devtool: options.devtool,
		debug: options.debug,
		resolveLoader: {
			root: path.join(__dirname, "node_modules"),
			alias: aliasLoader
		},
		externals: externals,
		resolve: {
			root: root,
			modulesDirectories: modulesDirectories,
			extensions: extensions,
			alias: alias


		},
		plugins: plugins,
		devServer: {
			stats: {
				exclude: excludeFromStats
			}
		}
	};
};
