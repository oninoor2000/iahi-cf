/** @type {import("prettier").Config} */
export default {
  plugins: ["prettier-plugin-tailwindcss"],
  /** Tailwind v4: entry CSS so class order matches your theme */
  tailwindStylesheet: "./src/styles.css",
};
