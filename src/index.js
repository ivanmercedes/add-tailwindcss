#!/usr/bin/env node
require("colors");
const fs = require("fs");
const path = require("path");
const inquirer = require("inquirer");
const execSync = require("child_process").execSync;

const FRAMEWORKS = ["Laravel", "Next.js", "Vite", "exit".red];

const options = [
  {
    type: "list",
    name: "option",
    message: "In which framework do you want to install Tailwindcss?",
    choices: FRAMEWORKS.map((name, index) => ({
      value: index,
      name: `${index}. ${name}`,
    })),
  },
];

const inquirerMenu = async () => {
  console.clear();
  const { option } = await inquirer.prompt(options);
  return option;
};

const main = async () => {
  let opt;
  do {
    opt = await inquirerMenu();
    switch (FRAMEWORKS[opt]) {
      case "Laravel":
        installAllPackages(
          "npm install -D tailwindcss postcss autoprefixer",
          FRAMEWORKS[opt],
        );
        addDirectiveCSS("/resources/css/app.css");
        opt = FRAMEWORKS.indexOf(FRAMEWORKS[FRAMEWORKS.length - 1]);
        break;
      case "Next.js":
        installAllPackages(
          "npm install -D tailwindcss postcss autoprefixer",
          FRAMEWORKS[opt],
        );
        addDirectiveCSS("/styles/globals.css");
        opt = FRAMEWORKS.indexOf(FRAMEWORKS[FRAMEWORKS.length - 1]);
        break;
      case "Vite":
        installAllPackages(
          "npm install -D tailwindcss postcss autoprefixer",
          FRAMEWORKS[opt],
        );
        addDirectiveCSS("/src/index.css");
        opt = FRAMEWORKS.indexOf(FRAMEWORKS[FRAMEWORKS.length - 1]);
        break;
    }
  } while (opt !== FRAMEWORKS.indexOf(FRAMEWORKS[FRAMEWORKS.length - 1])); // Stop  the CLI
};

function installAllPackages(command, fileName) {
  try {
    execSync(command, {
      stdio: "inherit",
    });
    copyConfigToDirectory(fileName);
  } catch (error) {
    console.log(error.red);
  }
}

function copyConfigToDirectory(fileName) {
  fs.copyFile(
    path.join(__dirname, `/stubs/${fileName.toLowerCase()}.config.stub`),
    process.cwd() + "/tailwind.config.js",
    (err) => {
      if (err) throw err;
      console.log(
        "Created Tailwind CSS config file: " + "tailwind.config.js".green,
      );
    },
  );

  fs.copyFile(
    path.join(__dirname, `/stubs/postcss.config.stub`),
    process.cwd() + "/postcss.config.js",
    (err) => {
      if (err) throw err;
      console.log("Created PostCSS config file: " + "postcss.config.js".green);
    },
  );
}

function addDirectiveCSS(path) {
  const DIRECTIVES =
    "@tailwind base;\n@tailwind components;\n@tailwind utilities;";

  fs.appendFile(process.cwd() + path, DIRECTIVES, function (err) {
    if (err) throw err;
    console.log("Tailwind directives added to: " + path.green);
  });
}

main();
