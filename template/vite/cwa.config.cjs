module.exports = {
  additional: [
    {
      name: "official ↗",
      display: "Official",
      color: "blue",
      variants: [
        {
          name: "custom-create-vue",
          display: "Customize with create-vue ↗",
          color: "green",
          customCommand: "npm create vue@latest TARGET_DIR",
        },
        {
          name: "custom-nuxt",
          display: "Nuxt ↗",
          color: "lightGreen",
          customCommand: "npm exec nuxi init TARGET_DIR",
        },
      ],
    },
  ],
};
