// 引入node内置模块
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// node的跨平台创建子进程方案
import spawn from "cross-spawn";
// 解析命令行参数
import minimist from "minimist";
// 命令行交互式提示
import prompts, { override } from "prompts";
// 多彩命令行输出库
import {
  blue,
  cyan,
  green,
  lightGreen,
  lightRed,
  magenta,
  red,
  reset,
  yellow,
} from "kolorist";

import { Framework } from "./type";
import {
  copy,
  emptyDir,
  formatTargetDir,
  isEmptyDir,
  isValidPackageName,
  pkgFromUserAgent,
  toValidPackageName,
} from "./utils";
// import { FRAMEWORKS } from "./frameworks";
import { getAllFrameworks, getTemplatesFromFrameworks } from "./parseTemp";

const OrgFrameworks = getAllFrameworks();

// 获取用户初始输入
const argv = minimist<{
  o?: string;
  org?: string;
  t?: string;
  template?: string;
}>(process.argv.slice(2), {
  string: ["_"],
});

const cwd = process.cwd(); // 获取当前工作目录

const renameFiles: Record<string, string | undefined> = {
  _gitignore: ".gitignore",
};

// 默认文件夹
const defaultTargetDir = "vite-project";

async function init() {
  const argTargetDir = formatTargetDir(argv._[0]);
  const argTemplate = argv.t || argv.template;
  let org = argv.o || argv.org;

  let targetDir = argTargetDir || defaultTargetDir;
  const getProjectName = () =>
    targetDir === "." ? path.basename(path.resolve()) : targetDir;

  let result: prompts.Answers<
    | "projectName"
    | "overwrite"
    | "packageName"
    | "framework"
    | "variant"
    | "org"
  >;
  let FRAMEWORKS = OrgFrameworks[org] || [];
  let TEMPLATES = getTemplatesFromFrameworks(FRAMEWORKS);

  try {
    result = await prompts(
      [
        {
          // 路径
          type: argTargetDir ? null : "text",
          name: "projectName",
          message: reset("project name"),
          initial: defaultTargetDir,
          onState(state) {
            targetDir = formatTargetDir(state.value) || defaultTargetDir;
          },
        },
        {
          // 若文件夹已存在或不为空
          type: () =>
            !fs.existsSync(targetDir) || isEmptyDir(targetDir)
              ? null
              : "confirm",
          name: "overwrite",
          message: `${
            targetDir === "." ? "Current Dir" : "target directory" + targetDir
          } is not empty. Remove existing files and continue?`,
        },
        {
          type: (_, { overwrite }: { overwrite?: boolean }) => {
            console.log(overwrite);
            if (overwrite === false) {
              throw new Error(red("✖") + " Operation cancelled");
            }
            return null;
          },
          name: "overwriteChecker",
        },
        {
          type: () => (isValidPackageName(getProjectName()) ? null : "text"),
          name: "packageName",
          message: reset("Package name:"),
          initial: () => toValidPackageName(getProjectName()),
          validate: (dir) =>
            isValidPackageName(dir) || "Invalid package.json name",
        },
        {
          type: () => (org && org in OrgFrameworks ? null : "select"),
          name: "org",
          message: () => {
            return typeof org === "string" && !(org in OrgFrameworks)
              ? reset(
                  `"${org}" isn't a valid template. Please choose from below: `
                )
              : reset("Select a org:");
          },
          choices: Object.keys(OrgFrameworks).map((name) => ({
            title: name,
            value: name,
          })),
          initial: 0,
          onState(state) {
            org = state.value;
            FRAMEWORKS = OrgFrameworks[state.value] || [];
            TEMPLATES = getTemplatesFromFrameworks(FRAMEWORKS);
          },
        },
        {
          type: () => {
            return argTemplate && TEMPLATES.includes(argTemplate)
              ? null
              : "select";
          },
          name: "framework",
          message: () => {
            return typeof argTemplate === "string" &&
              !TEMPLATES.includes(argTemplate)
              ? reset(
                  `"${argTemplate}" isn't a valid template. Please choose from below: `
                )
              : reset("Select a framework:");
          },
          initial: 0,
          choices: () =>
            FRAMEWORKS.map((fram) => ({
              title: fram.color(fram.display || fram.name),
              value: fram,
            })),
        },
        {
          type: (fram: Framework) =>
            fram && fram.variants?.length ? "select" : null,
          name: "variant",
          message: reset("Select a variant:"),
          initial: 0,
          choices: (fram: Framework) =>
            fram.variants.map((vari) => ({
              title: vari.color(vari.display || vari.name),
              value: vari.name,
            })),
        },
      ],
      {
        onCancel: () => {
          throw new Error(red("✖") + " Operation cancelled");
        },
      }
    );
    const { framework, overwrite, packageName, variant } = result;

    const root = path.join(cwd, targetDir);

    // 清空文件夹 | 新建文件夹
    if (overwrite) {
      emptyDir(root);
    } else if (!fs.existsSync(root)) {
      fs.mkdirSync(root, { recursive: true });
    }

    const template = variant || framework?.name || argTemplate;

    // console.log(process.env.npm_config_user_agent); //npm/8.16.0 node/v16.15.0 win32 x64 workspaces/false
    const pkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent);
    const pkgManager = pkgInfo ? pkgInfo.name : "npm";
    const isYarn1 = pkgManager === "yarn" && pkgInfo.version.startsWith("1.");

    const customCommand =
      framework.customCommand ??
      framework.variants.find((v) => v.name === template)?.customCommand ??
      "";

    if (customCommand) {
      const fullCustomCommand = customCommand
        .replace("TARGET_DIR", targetDir)
        .replace(/^npm create/, `${pkgManager} create`)
        // Only Yarn 1.x doesn't support `@version` in the `create` command
        .replace("@latest", () => (isYarn1 ? "" : "@latest"))
        .replace(/^npm exec/, () => {
          // Prefer `pnpm dlx` or `yarn dlx`
          if (pkgManager === "pnpm") {
            return "pnpm dlx";
          }
          if (pkgManager === "yarn" && !isYarn1) {
            return "yarn dlx";
          }
          // Use `npm exec` in all other cases,
          // including Yarn 1.x and other custom npm clients.
          return "npm exec";
        });

      const [command, ...args] = fullCustomCommand.split(" ");
      const { status } = spawn.sync(command, args, {
        stdio: "inherit",
      });
      process.exit(status || 0);
    }

    //获取模板所在路径
    const templateDir = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      `../template/${org}/template-${template}`
    );

    const write = (file: string, content?: string) => {
      const targetFilePath = path.resolve(root, renameFiles[file] || file);
      if (!content) {
        copy(path.join(templateDir, file), targetFilePath);
      } else {
        fs.writeFileSync(file, content);
      }
    };

    const files = fs.readdirSync(templateDir);
    for (let file of files.filter((v) => v !== "package.json")) {
      write(file);
    }

    const pkgJson = JSON.parse(
      fs.readFileSync(path.join(templateDir, "package.json"), "utf-8")
    );

    pkgJson.name = packageName;

    write(path.resolve(root, "package.json"), JSON.stringify(pkgJson, null, 2));

    console.log(`\nDone. Now run:\n`);

    // 如果当前目录不是项目目录，引导用户引入
    if (root !== cwd) {
      console.log(`  cd ${path.relative(cwd, root)}`);
    }
    switch (pkgManager) {
      case "yarn":
        console.log("  yarn");
        console.log("  yarn dev");
        break;
      default:
        console.log(`  ${pkgManager} install`);
        console.log(`  ${pkgManager} run dev`);
        break;
    }
    console.log();
  } catch (error) {
    console.log(error);
    return;
  }
}

init().catch((e) => {
  // console.error(e);
});
