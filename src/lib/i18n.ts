export type Locale = "zh" | "en";

/**
 * Each page and component owns its own bilingual `content` object next to the JSX
 * that renders it. A central `translations` dictionary used to live here as well,
 * but nothing consumed it — it had drifted into describing a model architecture the
 * codebase never had.
 */
