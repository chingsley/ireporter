module.exports = {
    "extends": "airbnb-base",
    "env": {
        "node": true,
        "mocha": true
    },
    "rules": {
        "no-unused-vars": [1, { "argsIgnorePattern": "res|next|^err" }],
        "valid-jsdoc": ["error", {
            "requireReturn": true,
            "requireReturnType": true,
            "requireParamDescription": false,
            "requireReturnDescription": true
        }],
        "require-jsdoc": ["error", {
            "require": {
                "FunctionDeclaration": true,
                "MethodDefinition": true,
                "ClassDeclaration": true
            }
        }]
    }
};








