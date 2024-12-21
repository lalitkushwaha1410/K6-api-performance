const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  mode: "production",
  context: path.join(__dirname, "src"),
  entry: {
    combinedWorkflowApi:"./combinedWorkflowApi.ts",
    startWorkflowApi:"./startWorkflowApi.ts",
    workflowStatusApi:"./workflowStatusApi.ts",
    workflowStageInfoApi:"./workflowStageInfoApi.ts",
    workflowCompleteTaskApi:"./workflowCompleteTaskApi.ts",
  },
  output: {
    path: path.join(__dirname, "dist"),
    libraryTarget: "commonjs",
    filename: "[name].js",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "babel-loader",
      },
    ],
  },
  target: "web",
  externals: /^(k6|https?\:\/\/)(\/.*)?/,
  stats: {
    colors: true,
  },
  plugins: [new CleanWebpackPlugin()],
};
