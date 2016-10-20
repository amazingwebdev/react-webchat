module.exports = {
    entry: {
        botchat: ["./built/BotChat.js"],
        app: ["./built/App.js"]
    },
    output: {
        libraryTarget: "var",
        library: "BotChat",
        filename: "./public/[name].js",
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        extensions: ["", ".webpack.js", ".web.js", ".js"]
    },

    module: {
        preLoaders: [
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { test: /\.js$/, loader: "source-map-loader" }
        ]
    },

    // When importing a module whose path matches one of the following, just
    // assume a corresponding global variable exists and use that instead.
    // This is important because it allows us to avoid bundling all of our
    // dependencies, which allows browsers to cache those libraries between builds.
    externals: {
        "react": "React",
        "react-dom": "ReactDOM",
    },
};