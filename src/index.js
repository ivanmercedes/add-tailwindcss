#!/usr/bin/env node
require("colors");
const fs = require("fs");
const inquirer = require("inquirer");
const execSync = require("child_process").execSync;

const frameworks_list = {};

frameworks_list.Laravel = {
  packages: "npm install -D tailwindcss postcss autoprefixer",
  desc: "(Vite only)",
  path_css: "/resources/css/app.css",
  content: `content: ["./resources/**/*.blade.php", "./resources/**/*.js", "./resources/**/*.vue",]`,
};

frameworks_list["Next.js"] = {
  packages: frameworks_list.Laravel.packages,
  desc: "",
  path_css: "/styles/globals.css",
  content: `content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}",]`,
};

frameworks_list.Vite = {
  packages: frameworks_list.Laravel.packages,
  desc: "(Ract and Vue)",
  path_css: "/src/index.css",
  content: `content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}",]`,
};

frameworks_list.CRA = {
  packages: frameworks_list.Laravel.packages,
  desc: "(Create React App)",
  path_css: "/src/index.css",
  content: `content: ["./src/**/*.{js,jsx,ts,tsx}",]`,
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

const init = async () => {
  let opt;
  do {
    opt = await inquirerMenu();
    switch (opt) {
      case "Next.js":
      case "Vite":
      case "Laravel":
      case "CRA":
        tailwind_init(frameworks_list[opt]);
        opt = "exit";
        break;
    }
  } while (opt !== "exit"); // Stop  the CLI
};

/**
 * Install tailwindcss and its peer
 * dependencies via npm, and then run the init command
 * to generate both tailwind.config.js and postcss.config.js.
 */
function tailwind_init(framework) {
  try {
    console.log("Installing tailwindcs...");
    execSync(framework.packages, {
      stdio: "inherit",
    });
    execSync("npx tailwindcss init -p", {
      stdio: "inherit",
    });
    setup_paths(framework.content);
    tailwind_directives(framework.path_css);
  } catch (error) {
    console.log(error.red);
  }
}

// Add the @tailwind directives for each of Tailwind’s layers
function tailwind_directives(path) {
  const DIRECTIVES =
    "@tailwind base;\n@tailwind components;\n@tailwind utilities;";

  fs.appendFile(process.cwd() + path, DIRECTIVES, function (err) {
    if (err) throw err;
    console.log("Tailwindcss directives added to: " + path.green);
  });
}

// Add the paths to all of your template files in your tailwind config
function setup_paths(content) {
  const tailwind_filename = fs.existsSync("tailwind.config.js")
    ? "/tailwind.config.js"
    : "/tailwind.config.cjs";

  fs.readFile(process.cwd() + tailwind_filename, "utf8", function (err, data) {
    if (err) {
      console.log(err);
    }
    const new_content = data.replace("content: []", content);

    fs.writeFile(
      process.cwd() + tailwind_filename,
      new_content,
      "utf8",
      function (err) {
        if (err) console.log(err);
      },
    );
  });
}

init();
