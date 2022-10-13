#!/usr/bin/env node
require("colors");
const fs = require("fs");
const path = require("path");
const inquirer = require("inquirer");
const execSync = require("child_process").execSync;

const frameworks_list = {};

frameworks_list.Laravel = {
  packages: "npm install -D tailwindcss postcss autoprefixer",
  desc: "(Vite only)",
  path_css: "/resources/css/app.css",
};

frameworks_list["Next.js"] = {
  packages: frameworks_list.Laravel.packages,
  desc: "",
  path_css: "/styles/globals.css",
};

frameworks_list.Vite = {
  packages: frameworks_list.Laravel.packages,
  desc: "(Ract and Vue)",
  path_css: "/src/index.css",
};

frameworks_list.CRA = {
  packages: frameworks_list.Laravel.packages,
  desc: "(Create React App)",
  path_css: "/src/index.css",
};

frameworks_list.exit = {};

const options = [
  {
    type: "list",
    name: "option",
    message: "In which framework do you want to install Tailwindcss?",
    choices: Object.keys(frameworks_list).map((name, index) => ({
      value: name,
      name: `${index}. ${name} ${frameworks_list[name].desc ?? ""}`,
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
    switch (opt) {
      case "Next.js":
      case "Vite":
      case "Laravel":
      case "CRA":
        installAllPackages(frameworks_list[opt].packages, opt);
        addDirectiveCSS(frameworks_list[opt].path_css);
        opt = "exit";
        break;
    }
  } while (opt !== "exit"); // Stop  the CLI
};

function installAllPackages(command, fileName) {
  try {
    console.log("Installing tailwindcs...");
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
