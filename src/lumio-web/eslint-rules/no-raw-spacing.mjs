/**
 * ESLint rule: no-raw-spacing
 *
 * Prevents usage of arbitrary spacing values in Tailwind classes.
 * Use design system spacing tokens instead.
 *
 * Allowed: p-1, p-2, p-3, m-4, gap-2, space-x-3, etc. (spacing scale)
 * Forbidden: p-[20px], m-[32px], gap-[16px], w-[256px], etc.
 *
 * This rule encourages adherence to the 8pt grid system defined in tokens.css.
 */

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow arbitrary spacing values in favor of design system tokens",
    },
    messages: {
      noRawSpacing:
        'Avoid arbitrary spacing "{{match}}". Use design system tokens (p-1 through p-7, m-1 through m-7, gap-1, etc.). See src/styles/tokens.css for the spacing scale.',
    },
    schema: [
      {
        type: "object",
        properties: {
          allowList: {
            type: "array",
            items: { type: "string" },
            description: "Patterns to exclude from this rule",
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    // Match arbitrary spacing values like p-[20px], m-[32px], gap-[16px]
    // Spacing utilities: p, px, py, pt, pr, pb, pl, m, mx, my, mt, mr, mb, ml,
    //                    gap, gap-x, gap-y, space-x, space-y, w, h, min-w, min-h,
    //                    max-w, max-h, inset, top, right, bottom, left
    const SPACING_PREFIXES = [
      "p",
      "px",
      "py",
      "pt",
      "pr",
      "pb",
      "pl",
      "ps",
      "pe",
      "m",
      "mx",
      "my",
      "mt",
      "mr",
      "mb",
      "ml",
      "ms",
      "me",
      "gap",
      "gap-x",
      "gap-y",
      "space-x",
      "space-y",
      "w",
      "h",
      "min-w",
      "min-h",
      "max-w",
      "max-h",
      "size",
      "inset",
      "inset-x",
      "inset-y",
      "top",
      "right",
      "bottom",
      "left",
      "start",
      "end",
      "scroll-m",
      "scroll-mx",
      "scroll-my",
      "scroll-mt",
      "scroll-mr",
      "scroll-mb",
      "scroll-ml",
      "scroll-p",
      "scroll-px",
      "scroll-py",
      "scroll-pt",
      "scroll-pr",
      "scroll-pb",
      "scroll-pl",
      "basis",
      "translate-x",
      "translate-y",
    ];

    // Build regex pattern for arbitrary spacing values
    // Matches: prefix-[value] where value contains px, rem, em, or raw numbers
    const ARBITRARY_SPACING_PATTERN = new RegExp(
      `\\b(?:${SPACING_PREFIXES.join("|")})-\\[\\d+(?:\\.\\d+)?(?:px|rem|em|%|vh|vw)?\\]`,
      "g"
    );

    // Also match negative variants: -m-[20px], -translate-x-[10px]
    const NEGATIVE_ARBITRARY_PATTERN = new RegExp(
      `-(?:${SPACING_PREFIXES.join("|")})-\\[\\d+(?:\\.\\d+)?(?:px|rem|em|%|vh|vw)?\\]`,
      "g"
    );

    // Allow specific patterns that are intentional and documented
    const KNOWN_EXCEPTIONS = [
      // Explicit exceptions can be added here
      // e.g., "w-[calc(100%-2rem)]" for complex calculations
    ];

    function shouldIgnore(match) {
      return KNOWN_EXCEPTIONS.some((exception) => match.includes(exception));
    }

    function checkString(node, value) {
      if (typeof value !== "string") return;

      let match;

      // Check positive arbitrary values
      ARBITRARY_SPACING_PATTERN.lastIndex = 0;
      while ((match = ARBITRARY_SPACING_PATTERN.exec(value)) !== null) {
        if (!shouldIgnore(match[0])) {
          context.report({
            node,
            messageId: "noRawSpacing",
            data: { match: match[0] },
          });
        }
      }

      // Check negative arbitrary values
      NEGATIVE_ARBITRARY_PATTERN.lastIndex = 0;
      while ((match = NEGATIVE_ARBITRARY_PATTERN.exec(value)) !== null) {
        if (!shouldIgnore(match[0])) {
          context.report({
            node,
            messageId: "noRawSpacing",
            data: { match: match[0] },
          });
        }
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

      // Check template literals in className expressions
      TemplateLiteral(node) {
        for (const quasi of node.quasis) {
          checkString(quasi, quasi.value.raw);
        }
      },

      // Check string literals in function calls like cn(), cva(), clsx()
      Literal(node) {
        if (typeof node.value !== "string") return;

        const parent = node.parent;
        if (!parent) return;

        const isClassContext =
          (parent.type === "CallExpression" &&
            parent.callee?.name &&
            ["cn", "cva", "clsx", "twMerge"].includes(parent.callee.name)) ||
          (parent.type === "ArrayExpression" &&
            parent.parent?.type === "CallExpression" &&
            parent.parent.callee?.name &&
            ["cn", "cva", "clsx", "twMerge"].includes(parent.parent.callee.name)) ||
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
