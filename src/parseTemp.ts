import { Framework } from "./type";
import path from "node:path";
import fs from "fs";
import { fileURLToPath } from "node:url";

import * as clist from "kolorist";
import { capitalize } from "./utils";
import { pathToFileURL } from "node:url";
const { blue, cyan, green, lightGreen, lightRed, magenta, red, reset, yellow } =
  clist;
const colorArr = [
  blue,
  cyan,
  green,
  lightGreen,
  lightRed,
  magenta,
  red,
  reset,
  yellow,
];

//short dict
const shortDict = {
  ts: "TypeScript",
  js: "JavaScript",
};

export const getFrameworksFromDir = (org: string) => {
  const FRAMEWORKS: Framework[] = [];
  //获取模板所在路径
  const templateDir = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    `../template/${org}`
  );
  const templates = fs.readdirSync(templateDir);

  templates.forEach((template, i) => {
    const stat = fs.statSync(path.resolve(templateDir, template));
    if (stat.isDirectory()) {
      const [fram, vari] = parseTemp(template);
      if (!FRAMEWORKS.some((framework) => framework.name === fram)) {
        FRAMEWORKS.push({
          name: fram,
          display: capitalize(fram),
          color: colorArr[i % colorArr.length],
          variants: [],
        });
      }
      const framework = FRAMEWORKS.find((f) => f.name === fram);
      if (framework) {
        framework.variants.push({
          name: fram + (vari ? "-" + vari : ""),
          display: vari ? shortDict[vari] || capitalize(vari) : "JavaScript",
          color: colorArr[i % colorArr.length],
        });
      }
    } else {
      if (template.startsWith("cwa.config")) {
        import(
          pathToFileURL(path.resolve(templateDir, template)).toString()
        ).then(async ({ default: config }) => {
          FRAMEWORKS.push(
            ...(config?.additional || []).map((frame, i) => {
              return {
                ...frame,
                color: clist[frame?.color || colorArr[i % colorArr.length]],
                variants: frame?.variants?.map((vari, j) => {
                  return {
                    ...vari,
                    color: clist[vari?.color || colorArr[j % colorArr.length]],
                  };
                }),
              };
            })
          );
        });
      }
    }
  });
  return FRAMEWORKS;
};

export const getAllFrameworks = () => {
  const OrgFrameworks: {
    [key: string]: Framework[];
  } = {};
  const orgs = fs.readdirSync(
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../template")
  );
  orgs.forEach((org) => {
    OrgFrameworks[org] = getFrameworksFromDir(org);
  });
  return OrgFrameworks;
};

const parseTemp = (template: string) => {
  const tempArr = template.split("-").slice(1);
  return tempArr;
};

export const getTemplatesFromFrameworks = (FRAMEWORKS: Framework[]) => {
  const TEMPLATES = FRAMEWORKS.map((fram) =>
    fram.variants && fram.variants.length
      ? fram.variants.map((vari) => vari.name)
      : [fram.name]
  ).reduce((prev, cur) => {
    return prev.concat(...cur);
  }, []);
  return TEMPLATES;
};
