const path = require('path');

module.exports = (env, argv) => {
    const isDevelopment = argv.mode === 'development';
    let plugins = [];

    console.log(`isDevelopment: ${isDevelopment}`);

    return {
        mode: argv.mode || 'development',
        entry: {
            index: './views/index.tsx',
        },
        output: {
            filename: '[name].js',
            path: path.resolve(__dirname, `${isDevelopment ? 'dist/' : ''}public/bundle`),
        },
        module: {
            rules: [{
                    test: /\.(js|jsx|ts|tsx)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
                            cacheDirectory: false
                        },
                    },
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader'],
                },
                {
                    test: /\.scss$/,
                    use: [
                        'style-loader',
                        'css-loader',
                        'sass-loader'
                    ]
                },
            ],
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.jsx'],
        },
        watch: isDevelopment,
        cache: false,
        devtool:  isDevelopment ? 'source-map' : false ,
        plugins
    }
};