import{j as e}from"./jsx-runtime-D4KrBPkj.js";import{r as v}from"./iframe-BmexDAhZ.js";import{D as y,a as p,b as m,c as h,d as D}from"./dialog-CmKZs74s.js";import{B as t}from"./button-Fj27Zx3k.js";const{expect:c,fn:x,userEvent:d,within:u,waitFor:g}=__STORYBOOK_MODULE_TEST__,j={title:"Primitives/Dialog",component:y,tags:["autodocs"],parameters:{status:{type:"core"},governance:{maturity:"core",a11yLevel:"AA"}},argTypes:{open:{control:"boolean"}}},s={args:{open:!0,onOpenChange:()=>{},children:e.jsxs(e.Fragment,{children:[e.jsxs(p,{children:[e.jsx(m,{children:"Bevestiging"}),e.jsx(h,{children:"Weet u zeker dat u deze actie wilt uitvoeren?"})]}),e.jsxs(D,{children:[e.jsx(t,{variant:"outline",children:"Annuleren"}),e.jsx(t,{children:"Bevestigen"})]})]})}},l={args:{open:!0,onOpenChange:()=>{},children:e.jsxs(e.Fragment,{children:[e.jsxs(p,{children:[e.jsx(m,{children:"Profiel bewerken"}),e.jsx(h,{children:"Pas uw persoonlijke gegevens aan."})]}),e.jsx("div",{className:"py-4",children:e.jsx("p",{className:"text-sm text-muted-foreground",children:"Formulierinhoud wordt hier getoond."})}),e.jsxs(D,{children:[e.jsx(t,{variant:"outline",children:"Annuleren"}),e.jsx(t,{children:"Opslaan"})]})]})}},a={args:{open:!1,onOpenChange:x(),children:null},render:function(){const[o,n]=v.useState(!1),[B,f]=v.useState(!1);return e.jsxs("div",{className:"space-y-4",children:[e.jsx(t,{onClick:()=>n(!0),"data-testid":"open-dialog",children:"Open Dialog"}),B&&e.jsx("p",{className:"text-sm text-success","data-testid":"confirmed-message",children:"Actie bevestigd!"}),e.jsxs(y,{open:o,onOpenChange:n,children:[e.jsxs(p,{children:[e.jsx(m,{children:"Bevestiging"}),e.jsx(h,{children:"Weet u zeker dat u deze actie wilt uitvoeren?"})]}),e.jsxs(D,{children:[e.jsx(t,{variant:"outline",onClick:()=>n(!1),"data-testid":"cancel-button",children:"Annuleren"}),e.jsx(t,{onClick:()=>{f(!0),n(!1)},"data-testid":"confirm-button",children:"Bevestigen"})]})]})]})},play:async({canvasElement:i})=>{const o=u(i),n=u(document.body),B=o.getByTestId("open-dialog");await d.click(B),await g(()=>{c(n.getByRole("dialog")).toBeInTheDocument()}),c(n.getByText("Bevestiging")).toBeInTheDocument();const f=n.getByTestId("confirm-button");await d.click(f),await g(()=>{c(o.getByTestId("confirmed-message")).toBeInTheDocument()})}},r={args:{open:!1,onOpenChange:x(),children:null},render:function(){const[o,n]=v.useState(!1);return e.jsxs("div",{className:"space-y-4",children:[e.jsx(t,{onClick:()=>n(!0),"data-testid":"open-dialog",children:"Open Dialog"}),e.jsxs(y,{open:o,onOpenChange:n,children:[e.jsxs(p,{children:[e.jsx(m,{children:"Annuleer Test"}),e.jsx(h,{children:"Test dat annuleren werkt."})]}),e.jsxs(D,{children:[e.jsx(t,{variant:"outline",onClick:()=>n(!1),"data-testid":"cancel-button",children:"Annuleren"}),e.jsx(t,{"data-testid":"confirm-button",children:"Bevestigen"})]})]})]})},play:async({canvasElement:i})=>{const o=u(i),n=u(document.body);await d.click(o.getByTestId("open-dialog")),await g(()=>{c(n.getByRole("dialog")).toBeInTheDocument()}),await d.click(n.getByTestId("cancel-button")),await g(()=>{c(n.queryByRole("dialog")).not.toBeInTheDocument()})}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    onOpenChange: () => {},
    children: <>\r
        <DialogHeader>\r
          <DialogTitle>Bevestiging</DialogTitle>\r
          <DialogDescription>\r
            Weet u zeker dat u deze actie wilt uitvoeren?\r
          </DialogDescription>\r
        </DialogHeader>\r
        <DialogFooter>\r
          <Button variant="outline">Annuleren</Button>\r
          <Button>Bevestigen</Button>\r
        </DialogFooter>\r
      </>
  }
}`,...s.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    onOpenChange: () => {},
    children: <>\r
        <DialogHeader>\r
          <DialogTitle>Profiel bewerken</DialogTitle>\r
          <DialogDescription>\r
            Pas uw persoonlijke gegevens aan.\r
          </DialogDescription>\r
        </DialogHeader>\r
        <div className="py-4">\r
          <p className="text-sm text-muted-foreground">\r
            Formulierinhoud wordt hier getoond.\r
          </p>\r
        </div>\r
        <DialogFooter>\r
          <Button variant="outline">Annuleren</Button>\r
          <Button>Opslaan</Button>\r
        </DialogFooter>\r
      </>
  }
}`,...l.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    open: false,
    onOpenChange: fn(),
    children: null
  },
  render: function Render() {
    const [open, setOpen] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    return <div className="space-y-4">\r
        <Button onClick={() => setOpen(true)} data-testid="open-dialog">\r
          Open Dialog\r
        </Button>\r
        {confirmed && <p className="text-sm text-success" data-testid="confirmed-message">\r
            Actie bevestigd!\r
          </p>}\r
        <Dialog open={open} onOpenChange={setOpen}>\r
          <DialogHeader>\r
            <DialogTitle>Bevestiging</DialogTitle>\r
            <DialogDescription>\r
              Weet u zeker dat u deze actie wilt uitvoeren?\r
            </DialogDescription>\r
          </DialogHeader>\r
          <DialogFooter>\r
            <Button variant="outline" onClick={() => setOpen(false)} data-testid="cancel-button">\r
              Annuleren\r
            </Button>\r
            <Button onClick={() => {
            setConfirmed(true);
            setOpen(false);
          }} data-testid="confirm-button">\r
              Bevestigen\r
            </Button>\r
          </DialogFooter>\r
        </Dialog>\r
      </div>;
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    // Click button to open dialog
    const openButton = canvas.getByTestId("open-dialog");
    await userEvent.click(openButton);

    // Wait for dialog to appear
    await waitFor(() => {
      expect(body.getByRole("dialog")).toBeInTheDocument();
    });

    // Verify dialog title is visible
    expect(body.getByText("Bevestiging")).toBeInTheDocument();

    // Click confirm button
    const confirmButton = body.getByTestId("confirm-button");
    await userEvent.click(confirmButton);

    // Wait for dialog to close and confirmation message to appear
    await waitFor(() => {
      expect(canvas.getByTestId("confirmed-message")).toBeInTheDocument();
    });
  }
}`,...a.parameters?.docs?.source},description:{story:"Interactive dialog with play function test",...a.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    open: false,
    onOpenChange: fn(),
    children: null
  },
  render: function Render() {
    const [open, setOpen] = useState(false);
    return <div className="space-y-4">\r
        <Button onClick={() => setOpen(true)} data-testid="open-dialog">\r
          Open Dialog\r
        </Button>\r
        <Dialog open={open} onOpenChange={setOpen}>\r
          <DialogHeader>\r
            <DialogTitle>Annuleer Test</DialogTitle>\r
            <DialogDescription>\r
              Test dat annuleren werkt.\r
            </DialogDescription>\r
          </DialogHeader>\r
          <DialogFooter>\r
            <Button variant="outline" onClick={() => setOpen(false)} data-testid="cancel-button">\r
              Annuleren\r
            </Button>\r
            <Button data-testid="confirm-button">\r
              Bevestigen\r
            </Button>\r
          </DialogFooter>\r
        </Dialog>\r
      </div>;
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    // Open dialog
    await userEvent.click(canvas.getByTestId("open-dialog"));

    // Wait for dialog
    await waitFor(() => {
      expect(body.getByRole("dialog")).toBeInTheDocument();
    });

    // Click cancel
    await userEvent.click(body.getByTestId("cancel-button"));

    // Dialog should be closed
    await waitFor(() => {
      expect(body.queryByRole("dialog")).not.toBeInTheDocument();
    });
  }
}`,...r.parameters?.docs?.source},description:{story:"Test dialog can be cancelled",...r.parameters?.docs?.description}}};const T=["Default","WithContent","Interactive","CancelInteraction"],k=Object.freeze(Object.defineProperty({__proto__:null,CancelInteraction:r,Default:s,Interactive:a,WithContent:l,__namedExportsOrder:T,default:j},Symbol.toStringTag,{value:"Module"}));export{k as D,s as a};
