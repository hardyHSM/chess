module.exports = {
    plugins: [
        require("postcss-preset-env")({
            stage: 3,
            'browsers': ['> 0.1%','last 4 versions'],
            "autoprefixer": { grid: true },
            features: {
                "nesting-rules": true
            }
        }),
        require('autoprefixer')(
            {

            }
        ),
        require("css-mqpacker")
    ],
};