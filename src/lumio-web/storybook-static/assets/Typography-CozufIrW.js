import{j as e}from"./jsx-runtime-D4KrBPkj.js";import{useMDXComponents as l}from"./index-FZkeZIx-.js";import{M as t}from"./blocks-BnPCfxAb.js";import"./iframe-BmexDAhZ.js";import"./preload-helper-PPVm8Dsz.js";function i(s){const n={code:"code",h1:"h1",h2:"h2",h3:"h3",hr:"hr",li:"li",p:"p",ul:"ul",...l(),...s.components};return e.jsxs(e.Fragment,{children:[`
`,`
`,e.jsx(t,{title:"Foundations/Typography"}),`
`,e.jsx(n.h1,{id:"typography",children:"Typography"}),`
`,e.jsx(n.p,{children:"The typography system uses rem-based sizing for accessibility. All values scale with the user's browser font size settings."}),`
`,e.jsx(n.h2,{id:"font-sizes",children:"Font Sizes"}),`
`,e.jsx(n.p,{children:"All font sizes are defined as CSS custom properties and mapped to Tailwind utilities."}),`
`,e.jsxs(n.p,{children:[`| Token | Size | Pixels (at 16px base) | Tailwind Class |
|-------|------|----------------------|----------------|
| `,e.jsx(n.code,{children:"--text-xs"})," | 0.75rem | 12px | ",e.jsx(n.code,{children:"text-xs"}),` |
| `,e.jsx(n.code,{children:"--text-sm"})," | 0.875rem | 14px | ",e.jsx(n.code,{children:"text-sm"}),` |
| `,e.jsx(n.code,{children:"--text-base"})," | 1rem | 16px | ",e.jsx(n.code,{children:"text-base"}),` |
| `,e.jsx(n.code,{children:"--text-lg"})," | 1.125rem | 18px | ",e.jsx(n.code,{children:"text-lg"}),` |
| `,e.jsx(n.code,{children:"--text-xl"})," | 1.25rem | 20px | ",e.jsx(n.code,{children:"text-xl"}),` |
| `,e.jsx(n.code,{children:"--text-2xl"})," | 1.5rem | 24px | ",e.jsx(n.code,{children:"text-2xl"}),` |
| `,e.jsx(n.code,{children:"--text-3xl"})," | 1.875rem | 30px | ",e.jsx(n.code,{children:"text-3xl"}),` |
| `,e.jsx(n.code,{children:"--text-4xl"})," | 2.25rem | 36px | ",e.jsx(n.code,{children:"text-4xl"})," |"]}),`
`,e.jsxs("div",{className:"space-y-4 mt-8",children:[e.jsx("p",{className:"text-xs",children:"text-xs — Helper text, labels (0.75rem)"}),e.jsx("p",{className:"text-sm",children:"text-sm — Body small, form labels (0.875rem)"}),e.jsx("p",{className:"text-base",children:"text-base — Body text (1rem)"}),e.jsx("p",{className:"text-lg",children:"text-lg — Lead paragraphs (1.125rem)"}),e.jsx("p",{className:"text-xl",children:"text-xl — Section titles (1.25rem)"}),e.jsx("p",{className:"text-2xl font-semibold",children:"text-2xl — Card titles (1.5rem)"}),e.jsx("p",{className:"text-3xl font-bold",children:"text-3xl — Page headings (1.875rem)"}),e.jsx("p",{className:"text-4xl font-bold",children:"text-4xl — Hero headings (2.25rem)"})]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"font-weights",children:"Font Weights"}),`
`,e.jsxs(n.p,{children:[`| Token | Value | Tailwind Class | Use Case |
|-------|-------|----------------|----------|
| `,e.jsx(n.code,{children:"--font-normal"})," | 400 | ",e.jsx(n.code,{children:"font-normal"}),` | Body text |
| `,e.jsx(n.code,{children:"--font-medium"})," | 500 | ",e.jsx(n.code,{children:"font-medium"}),` | Labels, emphasis |
| `,e.jsx(n.code,{children:"--font-semibold"})," | 600 | ",e.jsx(n.code,{children:"font-semibold"}),` | Subheadings, buttons |
| `,e.jsx(n.code,{children:"--font-bold"})," | 700 | ",e.jsx(n.code,{children:"font-bold"})," | Headings, strong emphasis |"]}),`
`,e.jsxs("div",{className:"space-y-2 mt-8",children:[e.jsx("p",{className:"font-normal",children:"font-normal (400) — Regular body text"}),e.jsx("p",{className:"font-medium",children:"font-medium (500) — Labels and light emphasis"}),e.jsx("p",{className:"font-semibold",children:"font-semibold (600) — Subheadings and buttons"}),e.jsx("p",{className:"font-bold",children:"font-bold (700) — Headings and strong emphasis"})]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"line-heights",children:"Line Heights"}),`
`,e.jsxs(n.p,{children:[`| Token | Value | Tailwind Class | Use Case |
|-------|-------|----------------|----------|
| `,e.jsx(n.code,{children:"--leading-none"})," | 1 | ",e.jsx(n.code,{children:"leading-none"}),` | Single-line headings |
| `,e.jsx(n.code,{children:"--leading-tight"})," | 1.25 | ",e.jsx(n.code,{children:"leading-tight"}),` | Compact headings |
| `,e.jsx(n.code,{children:"--leading-snug"})," | 1.375 | ",e.jsx(n.code,{children:"leading-snug"}),` | Subheadings |
| `,e.jsx(n.code,{children:"--leading-normal"})," | 1.5 | ",e.jsx(n.code,{children:"leading-normal"}),` | Body text (default) |
| `,e.jsx(n.code,{children:"--leading-relaxed"})," | 1.625 | ",e.jsx(n.code,{children:"leading-relaxed"}),` | Long-form prose |
| `,e.jsx(n.code,{children:"--leading-loose"})," | 2 | ",e.jsx(n.code,{children:"leading-loose"})," | Spaced lists |"]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"letter-spacing",children:"Letter Spacing"}),`
`,e.jsxs(n.p,{children:[`| Token | Value | Tailwind Class | Use Case |
|-------|-------|----------------|----------|
| `,e.jsx(n.code,{children:"--tracking-tighter"})," | -0.05em | ",e.jsx(n.code,{children:"tracking-tighter"}),` | Large display text |
| `,e.jsx(n.code,{children:"--tracking-tight"})," | -0.025em | ",e.jsx(n.code,{children:"tracking-tight"}),` | Headlines |
| `,e.jsx(n.code,{children:"--tracking-normal"})," | 0 | ",e.jsx(n.code,{children:"tracking-normal"}),` | Body text (default) |
| `,e.jsx(n.code,{children:"--tracking-wide"})," | 0.025em | ",e.jsx(n.code,{children:"tracking-wide"}),` | Buttons, labels |
| `,e.jsx(n.code,{children:"--tracking-wider"})," | 0.05em | ",e.jsx(n.code,{children:"tracking-wider"})," | All-caps text |"]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"grote-tekst-mode-accessibility",children:"Grote Tekst Mode (Accessibility)"}),`
`,e.jsxs(n.p,{children:["The ",e.jsx(n.code,{children:".grote-tekst"})," class scales all typography tokens larger for users who need bigger text. This is triggered via user preferences in the app settings."]}),`
`,e.jsx(n.p,{children:`| Original | Grote Tekst |
|----------|-------------|
| 0.75rem (xs) | 0.875rem |
| 0.875rem (sm) | 1rem |
| 1rem (base) | 1.125rem |
| 1.125rem (lg) | 1.25rem |
| ... | ... |`}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"usage-guidelines",children:"Usage Guidelines"}),`
`,e.jsx(n.h3,{id:"do-",children:"Do ✓"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Use ",e.jsx(n.code,{children:"text-sm"})," for form labels and helper text"]}),`
`,e.jsxs(n.li,{children:["Use ",e.jsx(n.code,{children:"text-base"})," for body content"]}),`
`,e.jsxs(n.li,{children:["Use ",e.jsx(n.code,{children:"font-semibold"})," for interactive element labels"]}),`
`,e.jsxs(n.li,{children:["Combine size and weight: ",e.jsx(n.code,{children:"text-2xl font-semibold"})," for card titles"]}),`
`]}),`
`,e.jsx(n.h3,{id:"dont-",children:"Don't ✗"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Don't use arbitrary pixel values like ",e.jsx(n.code,{children:"text-[13px]"})]}),`
`,e.jsx(n.li,{children:"Don't skip heading levels (h1 → h3)"}),`
`,e.jsxs(n.li,{children:["Don't use ",e.jsx(n.code,{children:"font-bold"})," for everything — reserve for true emphasis"]}),`
`,e.jsx(n.li,{children:"Don't set line-height below 1.25 for multi-line text"}),`
`]})]})}function a(s={}){const{wrapper:n}={...l(),...s.components};return n?e.jsx(n,{...s,children:e.jsx(i,{...s})}):i(s)}export{a as default};
