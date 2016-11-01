const extend = require("extend");
const nodeExternals = require('webpack-node-externals');

module.exports =  {
    debug: true,
    devtool: "cheap-module-source-map",

    output: {
        devtoolModuleFilenameTemplate        : '[absolute-resource-path]',
        devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]'
    },

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
            {test: /\.js$/, loader: "source-map-loader"},

            {test: /\.tsx?$/, loader: "tslint"}
        ]
    },

    ts: {
        logInfoToStdOut: true,
        logLevel: 'info'
    },

    tslint: {
        // tslint errors are displayed by default as warnings
        // set emitErrors to true to display them as errors
        emitErrors: true
    },

    target: "node",
    externals: [nodeExternals()]
};
