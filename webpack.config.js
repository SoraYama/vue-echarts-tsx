var path = require('path');

module.exports = {
  entry: {
    "main": __dirname + '/demo/main.ts',
  },

  output: {
    path: __dirname,
    filename: 'build.js',
  },

  resolve: {
    alias: {
      vue$: 'vue/dist/vue.esm.js'
    },
    extensions: [".ts", ".tsx", ".js"]
  },

  module: {
    rules: [{
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            appendTsSuffixTo: [/\.vue$/]
          }
        }
      },
      {
        test: /\.tsx$/,
        exclude: /node_modules/,
        use: [
          'babel-loader',
          'ts-loader',
        ]
      },
    ]
  },
  devtool: 'source-map'
}
