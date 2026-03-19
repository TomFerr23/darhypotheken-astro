import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schema } from "./src/sanity/schema";

export default defineConfig({
  name: "dar-hypotheken",
  title: "DAR Hypotheken",
  projectId: "wg4j13ic",
  dataset: "production",
  plugins: [structureTool(), visionTool()],
  schema,
  basePath: "/studio",
});
