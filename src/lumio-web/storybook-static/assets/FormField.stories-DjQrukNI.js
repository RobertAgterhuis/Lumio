const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./axe-jWTKearw.js","./iframe-BmexDAhZ.js","./preload-helper-PPVm8Dsz.js","./iframe-BUHAgvcx.css"])))=>i.map(i=>d[i]);
import{j as e}from"./jsx-runtime-D4KrBPkj.js";import{r as m}from"./iframe-BmexDAhZ.js";import{c as F}from"./utils-BQHNewu7.js";import{B as H}from"./button-Fj27Zx3k.js";import{_}from"./preload-helper-PPVm8Dsz.js";import"./index-LHNt3CwB.js";import"./createLucideIcon-B_yB00Wp.js";const T=m.createContext(null);function h(){const t=m.useContext(T);if(!t)throw new globalThis.Error("FormField components must be used within a FormField.Root");return t}const N=m.forwardRef(({error:t,required:i,disabled:n,className:o,children:s,...a},l)=>{const d=m.useId(),c=`${d}-input`,u=`${d}-error`,x=`${d}-helper`;return e.jsx(T.Provider,{value:{inputId:c,errorId:u,helperId:x,error:t,required:i,disabled:n},children:e.jsx("div",{ref:l,className:F("space-y-2",o),...a,children:s})})});N.displayName="FormField.Root";const q=m.forwardRef(({className:t,children:i,hideRequired:n,...o},s)=>{const{inputId:a,required:l,disabled:d}=h();return e.jsxs("label",{ref:s,htmlFor:a,className:F("text-sm font-medium leading-none",d&&"cursor-not-allowed opacity-70",t),...o,children:[i,l&&!n&&e.jsx("span",{className:"ml-1 text-destructive","aria-hidden":"true",children:"*"})]})});q.displayName="FormField.Label";const A=m.forwardRef(({className:t,...i},n)=>{const{inputId:o,errorId:s,helperId:a,error:l,required:d,disabled:c}=h(),u=[l&&s,a].filter(Boolean).join(" ")||void 0;return e.jsx("input",{ref:n,id:o,"aria-invalid":l?"true":void 0,"aria-describedby":u,"aria-required":d,disabled:c,className:F("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",l&&"border-destructive focus-visible:ring-destructive",t),...i})});A.displayName="FormField.Input";const D=m.forwardRef(({className:t,...i},n)=>{const{inputId:o,errorId:s,helperId:a,error:l,required:d,disabled:c}=h(),u=[l&&s,a].filter(Boolean).join(" ")||void 0;return e.jsx("textarea",{ref:n,id:o,"aria-invalid":l?"true":void 0,"aria-describedby":u,"aria-required":d,disabled:c,className:F("flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",l&&"border-destructive focus-visible:ring-destructive",t),...i})});D.displayName="FormField.Textarea";const S=m.forwardRef(({className:t,children:i,...n},o)=>{const{inputId:s,errorId:a,helperId:l,error:d,required:c,disabled:u}=h(),x=[d&&a,l].filter(Boolean).join(" ")||void 0;return e.jsx("select",{ref:o,id:s,"aria-invalid":d?"true":void 0,"aria-describedby":x,"aria-required":c,disabled:u,className:F("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",d&&"border-destructive focus-visible:ring-destructive",t),...n,children:i})});S.displayName="FormField.Select";const k=m.forwardRef(({className:t,children:i,...n},o)=>{const{helperId:s}=h();return i?e.jsx("p",{ref:o,id:s,className:F("text-xs text-muted-foreground",t),...n,children:i}):null});k.displayName="FormField.Helper";const V=m.forwardRef(({className:t,children:i,...n},o)=>{const{errorId:s,error:a}=h(),l=i??a;return l?e.jsx("p",{ref:o,id:s,role:"alert",className:F("text-sm text-destructive",t),...n,children:l}):null});V.displayName="FormField.Error";const r={Root:N,Label:q,Input:A,Textarea:D,Select:S,Helper:k,Error:V};async function W(t,i){const{detailedReport:n=!1,disableRules:o=[],includedImpacts:s}={};o.reduce((a,l)=>({...a,[l]:{enabled:!1}}),{});try{const l=await(await _(()=>import("./axe-jWTKearw.js").then(d=>d.a),__vite__mapDeps([0,1,2,3]),import.meta.url)).default.run(t,{rules:o.reduce((d,c)=>({...d,[c]:{enabled:!1}}),{})});if(l.violations.length>0){const c=`Accessibility violations found:
${l.violations.map(u=>{const x=u.nodes.map(L=>`  - ${L.html} (${L.failureSummary})`).join(`
`);return`${u.id}: ${u.description}
${x}`}).join(`

`)}`;if(n)console.error(c);else throw new Error(c)}}catch(a){if(a.message?.includes("Accessibility violations"))throw a;console.warn("Could not run accessibility checks:",a)}}const{expect:p,userEvent:b,within:O,waitFor:E}=__STORYBOOK_MODULE_TEST__,U={title:"Primitives/FormField",component:r.Root,tags:["autodocs"],parameters:{status:{type:"stable"},governance:{maturity:"stable",a11yLevel:"AA"}}},g={args:{children:null},render:()=>e.jsxs(r.Root,{children:[e.jsx(r.Label,{children:"Email"}),e.jsx(r.Input,{type:"email",placeholder:"naam@voorbeeld.nl"})]})},f={args:{required:!0,children:null},render:()=>e.jsxs(r.Root,{required:!0,children:[e.jsx(r.Label,{children:"Naam"}),e.jsx(r.Input,{placeholder:"Voer uw naam in"})]})},y={args:{children:null},render:()=>e.jsxs(r.Root,{children:[e.jsx(r.Label,{children:"Wachtwoord"}),e.jsx(r.Input,{type:"password"}),e.jsx(r.Helper,{children:"Minimaal 8 tekens, inclusief een cijfer."})]})},j={args:{error:"Dit veld is verplicht.",children:null},render:()=>e.jsxs(r.Root,{error:"Dit veld is verplicht.",required:!0,children:[e.jsx(r.Label,{children:"Email"}),e.jsx(r.Input,{type:"email"}),e.jsx(r.Error,{})]})},w={args:{children:null},render:()=>e.jsxs(r.Root,{children:[e.jsx(r.Label,{children:"Beschrijving"}),e.jsx(r.Textarea,{placeholder:"Voer een beschrijving in..."}),e.jsx(r.Helper,{children:"Maximaal 500 tekens."})]})},R={args:{children:null},render:()=>e.jsxs(r.Root,{required:!0,children:[e.jsx(r.Label,{children:"Land"}),e.jsxs(r.Select,{children:[e.jsx("option",{value:"",children:"Selecteer een land"}),e.jsx("option",{value:"nl",children:"Nederland"}),e.jsx("option",{value:"be",children:"België"}),e.jsx("option",{value:"de",children:"Duitsland"})]})]})},B={args:{disabled:!0,children:null},render:()=>e.jsxs(r.Root,{disabled:!0,children:[e.jsx(r.Label,{children:"Gebruikersnaam"}),e.jsx(r.Input,{value:"john_doe"}),e.jsx(r.Helper,{children:"Gebruikersnaam kan niet worden gewijzigd."})]})},I={args:{children:null},render:()=>e.jsxs("form",{className:"space-y-6 max-w-md",children:[e.jsxs(r.Root,{required:!0,children:[e.jsx(r.Label,{children:"Naam"}),e.jsx(r.Input,{placeholder:"Voer uw volledige naam in"})]}),e.jsxs(r.Root,{required:!0,error:"Voer een geldig e-mailadres in.",children:[e.jsx(r.Label,{children:"Email"}),e.jsx(r.Input,{type:"email",defaultValue:"invalid-email"}),e.jsx(r.Error,{})]}),e.jsxs(r.Root,{children:[e.jsx(r.Label,{children:"Telefoonnummer"}),e.jsx(r.Input,{type:"tel",placeholder:"+31 6 12345678"}),e.jsx(r.Helper,{children:"Optioneel — voor 2FA."})]}),e.jsxs(r.Root,{children:[e.jsx(r.Label,{children:"Bio"}),e.jsx(r.Textarea,{placeholder:"Vertel iets over uzelf..."})]}),e.jsx(H,{type:"submit",children:"Opslaan"})]})},v={args:{children:null},render:function(){const[i,n]=m.useState(void 0),o=s=>{s.target.value?s.target.value.includes("@")?n(void 0):n("Voer een geldig e-mailadres in."):n("Dit veld is verplicht.")};return e.jsxs(r.Root,{error:i,required:!0,children:[e.jsx(r.Label,{children:"Email"}),e.jsx(r.Input,{type:"email",placeholder:"naam@voorbeeld.nl",onBlur:o,"data-testid":"email-input"}),e.jsx(r.Helper,{children:"We delen uw email nooit."}),e.jsx(r.Error,{})]})},play:async({canvasElement:t})=>{const i=O(t),n=i.getByTestId("email-input"),o=i.getByText("Email");p(o.tagName).toBe("LABEL");const s=o.getAttribute("for");p(n.getAttribute("id")).toBe(s),p(i.getByText("*")).toBeInTheDocument(),p(n.getAttribute("aria-invalid")).toBeNull(),n.focus(),await b.tab(),await E(()=>{p(i.getByText("Dit veld is verplicht.")).toBeInTheDocument()}),p(n.getAttribute("aria-invalid")).toBe("true");const a=n.getAttribute("aria-describedby");p(a).toBeTruthy(),await b.type(n,"invalid"),await b.tab(),await E(()=>{p(i.getByText("Voer een geldig e-mailadres in.")).toBeInTheDocument()}),await b.clear(n),await b.type(n,"test@example.com"),await b.tab(),await E(()=>{p(i.queryByRole("alert")).not.toBeInTheDocument()}),p(n.getAttribute("aria-invalid")).toBeNull(),await W(t)}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    children: null
  },
  render: () => <FormField.Root>\r
      <FormField.Label>Email</FormField.Label>\r
      <FormField.Input type="email" placeholder="naam@voorbeeld.nl" />\r
    </FormField.Root>
}`,...g.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    required: true,
    children: null
  },
  render: () => <FormField.Root required>\r
      <FormField.Label>Naam</FormField.Label>\r
      <FormField.Input placeholder="Voer uw naam in" />\r
    </FormField.Root>
}`,...f.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    children: null
  },
  render: () => <FormField.Root>\r
      <FormField.Label>Wachtwoord</FormField.Label>\r
      <FormField.Input type="password" />\r
      <FormField.Helper>Minimaal 8 tekens, inclusief een cijfer.</FormField.Helper>\r
    </FormField.Root>
}`,...y.parameters?.docs?.source}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    error: "Dit veld is verplicht.",
    children: null
  },
  render: () => <FormField.Root error="Dit veld is verplicht." required>\r
      <FormField.Label>Email</FormField.Label>\r
      <FormField.Input type="email" />\r
      <FormField.Error />\r
    </FormField.Root>
}`,...j.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    children: null
  },
  render: () => <FormField.Root>\r
      <FormField.Label>Beschrijving</FormField.Label>\r
      <FormField.Textarea placeholder="Voer een beschrijving in..." />\r
      <FormField.Helper>Maximaal 500 tekens.</FormField.Helper>\r
    </FormField.Root>
}`,...w.parameters?.docs?.source}}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    children: null
  },
  render: () => <FormField.Root required>\r
      <FormField.Label>Land</FormField.Label>\r
      <FormField.Select>\r
        <option value="">Selecteer een land</option>\r
        <option value="nl">Nederland</option>\r
        <option value="be">België</option>\r
        <option value="de">Duitsland</option>\r
      </FormField.Select>\r
    </FormField.Root>
}`,...R.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    children: null
  },
  render: () => <FormField.Root disabled>\r
      <FormField.Label>Gebruikersnaam</FormField.Label>\r
      <FormField.Input value="john_doe" />\r
      <FormField.Helper>Gebruikersnaam kan niet worden gewijzigd.</FormField.Helper>\r
    </FormField.Root>
}`,...B.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    children: null
  },
  render: () => <form className="space-y-6 max-w-md">\r
      <FormField.Root required>\r
        <FormField.Label>Naam</FormField.Label>\r
        <FormField.Input placeholder="Voer uw volledige naam in" />\r
      </FormField.Root>\r
\r
      <FormField.Root required error="Voer een geldig e-mailadres in.">\r
        <FormField.Label>Email</FormField.Label>\r
        <FormField.Input type="email" defaultValue="invalid-email" />\r
        <FormField.Error />\r
      </FormField.Root>\r
\r
      <FormField.Root>\r
        <FormField.Label>Telefoonnummer</FormField.Label>\r
        <FormField.Input type="tel" placeholder="+31 6 12345678" />\r
        <FormField.Helper>Optioneel — voor 2FA.</FormField.Helper>\r
      </FormField.Root>\r
\r
      <FormField.Root>\r
        <FormField.Label>Bio</FormField.Label>\r
        <FormField.Textarea placeholder="Vertel iets over uzelf..." />\r
      </FormField.Root>\r
\r
      <Button type="submit">Opslaan</Button>\r
    </form>
}`,...I.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    children: null
  },
  render: function Render() {
    const [error, setError] = useState<string | undefined>(undefined);
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (!e.target.value) {
        setError("Dit veld is verplicht.");
      } else if (!e.target.value.includes("@")) {
        setError("Voer een geldig e-mailadres in.");
      } else {
        setError(undefined);
      }
    };
    return <FormField.Root error={error} required>\r
        <FormField.Label>Email</FormField.Label>\r
        <FormField.Input type="email" placeholder="naam@voorbeeld.nl" onBlur={handleBlur} data-testid="email-input" />\r
        <FormField.Helper>We delen uw email nooit.</FormField.Helper>\r
        <FormField.Error />\r
      </FormField.Root>;
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);

    // Find the input
    const input = canvas.getByTestId("email-input");

    // Verify label is associated with input via htmlFor/id
    const label = canvas.getByText("Email");
    expect(label.tagName).toBe("LABEL");
    const labelFor = label.getAttribute("for");
    expect(input.getAttribute("id")).toBe(labelFor);

    // Verify required indicator is present
    expect(canvas.getByText("*")).toBeInTheDocument();

    // Initially no error, so aria-invalid should not be "true"
    expect(input.getAttribute("aria-invalid")).toBeNull();

    // Focus and blur without value to trigger error
    input.focus();
    await userEvent.tab(); // blur

    // Wait for error to appear
    await waitFor(() => {
      expect(canvas.getByText("Dit veld is verplicht.")).toBeInTheDocument();
    });

    // Verify aria-invalid is now "true"
    expect(input.getAttribute("aria-invalid")).toBe("true");

    // Verify aria-describedby links to error and helper
    const describedBy = input.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();

    // Type invalid email and blur
    await userEvent.type(input, "invalid");
    await userEvent.tab();
    await waitFor(() => {
      expect(canvas.getByText("Voer een geldig e-mailadres in.")).toBeInTheDocument();
    });

    // Type valid email and blur
    await userEvent.clear(input);
    await userEvent.type(input, "test@example.com");
    await userEvent.tab();

    // Error should be cleared
    await waitFor(() => {
      expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
    });

    // aria-invalid should be removed
    expect(input.getAttribute("aria-invalid")).toBeNull();

    // Run axe-core accessibility checks
    await runA11yChecks(canvasElement);
  }
}`,...v.parameters?.docs?.source},description:{story:"Tests that FormField correctly sets accessibility attributes",...v.parameters?.docs?.description}}};const Y=["Default","Required","WithHelper","WithError","WithTextarea","WithSelect","Disabled","CompleteForm","AccessibilityTest"];export{v as AccessibilityTest,I as CompleteForm,g as Default,B as Disabled,f as Required,j as WithError,y as WithHelper,R as WithSelect,w as WithTextarea,Y as __namedExportsOrder,U as default};
