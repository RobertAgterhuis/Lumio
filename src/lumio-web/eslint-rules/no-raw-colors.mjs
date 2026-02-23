/**
 * ESLint rule: no-raw-colors
 *
 * Prevents usage of raw Tailwind color classes (e.g., text-red-500, bg-blue-200)
 * in component and page files. Use semantic token classes instead.
 *
 * Allowed: text-primary, bg-danger, border-warning-100, text-success, etc.
 * Forbidden: text-red-500, bg-blue-200, border-green-300, etc.
 *
 * Exceptions can be added to the allowList for documented cases.
 */

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow raw Tailwind color classes in favor of design system tokens",
    },
    messages: {
      noRawColor:
        'Avoid raw Tailwind color "{{match}}". Use semantic token classes (e.g., text-primary, bg-danger, border-warning-100). See docs/design-system/TOKENS.md.',
    },
    schema: [
      {
        type: "object",
        properties: {
          allowList: {
            type: "array",
            items: { type: "string" },
            description: "File patterns to exclude from this rule",
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    // Match raw Tailwind color classes like text-red-500, bg-blue-200, border-green-300
    // But NOT text-primary, bg-danger, border-warning-100 (semantic tokens)
    const RAW_COLOR_PATTERN =
      /\b(?:text|bg|border|ring|shadow|outline|accent|fill|stroke|from|via|to|divide|placeholder)-(?:red|blue|green|yellow|orange|purple|pink|indigo|teal|cyan|emerald|violet|fuchsia|rose|lime|sky|amber|slate|gray|zinc|stone|neutral)-\d{2,3}\b/g;

    // Also catch raw hex in className strings
    const HEX_IN_CLASS_PATTERN = /\[#[0-9a-fA-F]{3,8}\]/g;

    function checkString(node, value) {
      if (typeof value !== "string") return;

      let match;
      RAW_COLOR_PATTERN.lastIndex = 0;
      while ((match = RAW_COLOR_PATTERN.exec(value)) !== null) {
        context.report({
          node,
          messageId: "noRawColor",
          data: { match: match[0] },
        });
      }

      HEX_IN_CLASS_PATTERN.lastIndex = 0;
      while ((match = HEX_IN_CLASS_PATTERN.exec(value)) !== null) {
        context.report({
          node,
          messageId: "noRawColor",
          data: { match: match[0] },
        });
      }
    }

    return {
      // Check className="..." string literals
      JSXAttribute(node) {
        if (
          node.name.name === "className" &&
          node.value?.type === "Literal" &&
          typeof node.value.value === "string"
        ) {
          checkString(node.value, node.value.value);
        }
      },

      // Check template literals and strings inside className expressions
      TemplateLiteral(node) {
        for (const quasi of node.quasis) {
          checkString(quasi, quasi.value.raw);
        }
      },

      // Check string literals in general (catches cn(...), cva(...), etc.)
      Literal(node) {
        if (typeof node.value !== "string") return;

        // Only check if it looks like it could be a className
        const parent = node.parent;
        if (!parent) return;

        // Check if inside a function call like cn(), cva(), clsx()
        const isClassContext =
          (parent.type === "CallExpression" &&
            parent.callee?.name &&
            ["cn", "cva", "clsx", "twMerge"].includes(parent.callee.name)) ||
          // Or inside an array in such a call
          (parent.type === "ArrayExpression" &&
            parent.parent?.type === "CallExpression" &&
            parent.parent.callee?.name &&
            ["cn", "cva", "clsx", "twMerge"].includes(parent.parent.callee.name)) ||
          // Or in an object (like CVA variants)
          (parent.type === "Property" &&
            parent.parent?.type === "ObjectExpression");

        if (isClassContext) {
          checkString(node, node.value);
        }
      },
    };
  },
};

export default rule;
