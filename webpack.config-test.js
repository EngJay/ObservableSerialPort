const extend = require("extend");
const nodeExternals = require('webpack-node-externals');

module.exports =  {
    debug: true,
    devtool: "cheap-module-source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: ["", ".webpack.js", ".ts", ".tsx", ".js"]
    },
    module: {
        loaders: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
            {test: /\.tsx?$/, loader: "ts-loader"}
        ],

        preLoaders: [
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            {test: /\.js$/, loader: "source-map-loader"}
        ]
    },

    ts: {
        logInfoToStdOut: true,
        logLevel: 'info'
    },
    target: "node",
    externals: [nodeExternals()]
};
