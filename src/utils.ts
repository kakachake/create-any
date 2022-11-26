import fs from "node:fs";
import path from "node:path";
// 去除空格及末尾的斜杠
export const formatTargetDir = (dir: string) => {
  return dir?.trim().replace(/\/+$/g, "");
};

export const isEmptyDir = (dir: string) => {
  const files = fs.readdirSync(dir);
  return files.length === 0 || (files.length === 1 && files[0] === ".git");
};

export function isValidPackageName(projectName: string) {
  return /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/.test(
    projectName
  );
}

export function toValidPackageName(projectName: string) {
  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/^[._]/, "")
    .replace(/[^a-z\d\-~]+/g, "-");
}

export function emptyDir(dir: string) {
  if (!fs.existsSync(dir)) {
    return;
  }
  for (let file of fs.readdirSync(dir)) {
    fs.rmSync(path.resolve(dir, file), {
      recursive: true,
      force: true,
    });
  }
}

export function pkgFromUserAgent(userAgent: string | undefined) {
  // console.log(process.env.npm_config_user_agent); //npm/8.16.0 node/v16.15.0 win32 x64 workspaces/false
  const pkgSpecArr = userAgent?.split(" ")[0].split("/");

  return {
    name: pkgSpecArr?.[0] || "npm",
    version: pkgSpecArr?.[1] || "latest",
  };
}

export function copy(file, target) {
  const stat = fs.statSync(file);
  if (stat.isFile()) {
    fs.copyFileSync(file, target);
  } else {
    copyDir(file, target);
  }
}

export function copyDir(dir, target) {
  // 如果是文件夹，先创建文件夹
  console.log(target);

  fs.mkdirSync(target, { recursive: true });
  const files = fs.readdirSync(dir);
  for (let file of files) {
    const filePath = path.resolve(dir, file);
    const targetPath = path.resolve(target, file);
    // 递归创建
    copy(filePath, targetPath);
  }
}

// 首字母大写
export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
