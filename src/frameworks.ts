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

export const FRAMEWORKS: Framework[] = [
  {
    name: "react",
    display: "React",
    color: blue,
    variants: [
      {
        name: "react-ts",
        display: "TypeScript",
        color: blue,
      },
      {
        name: "react",
        display: "JavaScript",
        color: blue,
      },
    ],
  },
  {
    name: "vue",
    display: "Vue",
    color: green,
    variants: [
      {
        name: "vue",
        display: "JavaScript",
        color: yellow,
      },
      {
        name: "vue-ts",
        display: "TypeScript",
        color: blue,
      },
      {
        name: "custom-create-vue",
        display: "Customize with create-vue ↗",
        color: green,
        customCommand: "npm create vue@latest TARGET_DIR",
      },
      {
        name: "custom-nuxt",
        display: "Nuxt ↗",
        color: lightGreen,
        customCommand: "npm exec nuxi init TARGET_DIR",
      },
    ],
  },
  {
    name: "onlyOne",
    display: "OnlyOne",
    color: red,
    variants: [],
  },
];
