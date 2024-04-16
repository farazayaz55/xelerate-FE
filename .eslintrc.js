module.exports = {
  parser: "babel-eslint",
  env: {
    es6: true,
    node: true,
    browser: true
  },
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ["react"],
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:prettier/recommended"
  ],
  rules: {
    "prettier/prettier": 0,
    "react/prop-types": 0,
    "react/no-array-index-key":1,//warning
    "react/jsx-uses-react":2,
    "react-hooks/rules-of-hooks",
    
  }
};
