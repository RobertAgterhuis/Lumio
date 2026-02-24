import{j as n}from"./jsx-runtime-D4KrBPkj.js";import{useMDXComponents as r}from"./index-FZkeZIx-.js";import{M as o}from"./blocks-BnPCfxAb.js";import"./iframe-BmexDAhZ.js";import"./preload-helper-PPVm8Dsz.js";function s(i){const e={code:"code",h1:"h1",h2:"h2",h3:"h3",hr:"hr",li:"li",p:"p",pre:"pre",ul:"ul",...r(),...i.components};return n.jsxs(n.Fragment,{children:[`
`,`
`,n.jsx(o,{title:"Foundations/Motion"}),`
`,n.jsx(e.h1,{id:"motion",children:"Motion"}),`
`,n.jsxs(e.p,{children:["Motion tokens create consistent, purposeful animations. All animations respect the user's ",n.jsx(e.code,{children:"prefers-reduced-motion"})," preference."]}),`
`,n.jsx(e.h2,{id:"duration-tokens",children:"Duration Tokens"}),`
`,n.jsxs(e.p,{children:[`| Token | Value | Tailwind | Use Case |
|-------|-------|----------|----------|
| `,n.jsx(e.code,{children:"--duration-fast"})," | 150ms | ",n.jsx(e.code,{children:"duration-150"}),` | Micro-interactions (hover, focus) |
| `,n.jsx(e.code,{children:"--duration-med"})," | 250ms | ",n.jsx(e.code,{children:"duration-250"})," | UI state changes (expand, collapse) |"]}),`
`,n.jsx(e.h2,{id:"easing",children:"Easing"}),`
`,n.jsxs(e.p,{children:[`| Token | Value | Tailwind |
|-------|-------|----------|
| `,n.jsx(e.code,{children:"--easing-default"})," | ease-in-out | ",n.jsx(e.code,{children:"ease-in-out"})," |"]}),`
`,n.jsx(e.hr,{}),`
`,n.jsx(e.h2,{id:"animation-examples",children:"Animation Examples"}),`
`,n.jsxs("div",{className:"space-y-8 mt-8",children:[n.jsxs("div",{children:[n.jsx("h3",{className:"text-lg font-semibold mb-4",children:"Hover Transition (150ms)"}),n.jsx("button",{className:"px-4 py-2 bg-primary text-primary-foreground rounded-md transition-all duration-150 hover:bg-primary/90 hover:scale-105",children:n.jsx(e.p,{children:"Hover me"})})]}),n.jsxs("div",{children:[n.jsx("h3",{className:"text-lg font-semibold mb-4",children:"Focus Ring"}),n.jsx("input",{type:"text",placeholder:"Focus me",className:"px-3 py-2 border rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring"})]})]}),`
`,n.jsx(e.hr,{}),`
`,n.jsx(e.h2,{id:"transition-primitives",children:"Transition Primitives"}),`
`,n.jsx(e.p,{children:"The design system includes pre-built transition components:"}),`
`,n.jsx(e.h3,{id:"fadein",children:"FadeIn"}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-tsx",children:`import { FadeIn } from "@/components/ui/transitions";

<FadeIn>
  <p>This content fades in on mount</p>
</FadeIn>
`})}),`
`,n.jsx(e.h3,{id:"slidein",children:"SlideIn"}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-tsx",children:`import { SlideIn } from "@/components/ui/transitions";

<SlideIn direction="up">
  <Card>Content slides up from below</Card>
</SlideIn>
`})}),`
`,n.jsx(e.h3,{id:"scalein",children:"ScaleIn"}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-tsx",children:`import { ScaleIn } from "@/components/ui/transitions";

<ScaleIn>
  <Dialog>Dialog scales in from center</Dialog>
</ScaleIn>
`})}),`
`,n.jsx(e.hr,{}),`
`,n.jsx(e.h2,{id:"keyframe-animations",children:"Keyframe Animations"}),`
`,n.jsxs(e.p,{children:[`| Animation | Duration | Use Case |
|-----------|----------|----------|
| `,n.jsx(e.code,{children:"animate-pulse"}),` | 2s | Loading skeletons |
| `,n.jsx(e.code,{children:"animate-spin"}),` | 1s | Loading spinners |
| `,n.jsx(e.code,{children:"animate-shimmer"})," | 2s | Gradient loading effect |"]}),`
`,n.jsx(e.hr,{}),`
`,n.jsx(e.h2,{id:"reduced-motion",children:"Reduced Motion"}),`
`,n.jsxs(e.p,{children:["All animations should gracefully degrade when ",n.jsx(e.code,{children:"prefers-reduced-motion: reduce"})," is set:"]}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-css",children:`@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
`})}),`
`,n.jsx(e.p,{children:"The transition components automatically handle this:"}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-tsx",children:`// Transitions component respects reduced motion
<FadeIn>
  {/* Instant appear when reduced motion is preferred */}
</FadeIn>
`})}),`
`,n.jsx(e.hr,{}),`
`,n.jsx(e.h2,{id:"usage-guidelines",children:"Usage Guidelines"}),`
`,n.jsx(e.h3,{id:"do-",children:"Do ✓"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:["Use ",n.jsx(e.code,{children:"duration-fast"})," (150ms) for hover/focus states"]}),`
`,n.jsxs(e.li,{children:["Use ",n.jsx(e.code,{children:"duration-med"})," (250ms) for content reveals"]}),`
`,n.jsxs(e.li,{children:["Apply ",n.jsx(e.code,{children:"ease-in-out"})," for natural-feeling motion"]}),`
`,n.jsxs(e.li,{children:["Test with ",n.jsx(e.code,{children:"prefers-reduced-motion: reduce"})]}),`
`]}),`
`,n.jsx(e.h3,{id:"dont-",children:"Don't ✗"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"Don't animate everything — motion should be purposeful"}),`
`,n.jsx(e.li,{children:"Don't use durations longer than 500ms for UI transitions"}),`
`,n.jsx(e.li,{children:"Don't use jarring linear easing for UI elements"}),`
`,n.jsx(e.li,{children:"Don't skip reduced motion support"}),`
`]})]})}function h(i={}){const{wrapper:e}={...r(),...i.components};return e?n.jsx(e,{...i,children:n.jsx(s,{...i})}):s(i)}export{h as default};
