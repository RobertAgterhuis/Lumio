# Lumio
## 🇳🇱 Nederlands

Lumio is een offline-first desktop applicatie waarmee u uw digitale nalatenschap veilig kunt vastleggen. Denk aan testamentaire wensen, noodcontacten, uitvaartwensen, digitaal bezit, donorregistratie en meer — alles lokaal versleuteld opgeslagen op uw eigen computer.

De applicatie is gebouwd met privacy en gebruiksgemak als uitgangspunt: geen cloud, volledig onder uw eigen controle.

- **Technische documentatie:** zie [`docs//technical-manual/NL`](docs/technical-manual/NL)
- **Gebruikershandleiding:** zie [`docs/user-manual/NL`](docs/user-manual/NL)

---

## 🇬🇧 English

Lumio is an offline-first desktop application for securely recording your digital estate. This includes testamentary wishes, emergency contacts, funeral preferences, digital assets, organ donation registration and more — all encrypted and stored locally on your own computer.

The application is built with privacy and ease of use at its core: no cloud, fully under your own control.

- **Technical documentation:** see [`docs/technical-manual/EN`](docs/technical-manual/EN)
- **User manual:** see [`docs/user-manual/EN`](docs/user-manual/EN)

---

## 🏢 Corporate Distribution (Whitelabel)

Lumio supports corporate whitelabel builds, allowing organisations to distribute
a branded version to their employees. The web app and API are never altered —
branding is applied entirely within the Electron shell.

What can be customised:

- Brand color palette (CSS variables, injected at runtime)
- App icon, window title, product name, and installer `appId`
- Startup splash screen color and logo
- In-app company logo overlay (every screen, bottom-center)
- Dashboard footer message

**Guide:** [`tools/whitelabel/README.md`](tools/whitelabel/README.md)

**Quick start:**

```powershell
# Build a whitelabeled installer for your company config
.\tools\build.ps1 -Whitelabel ".\tools\whitelabel\configs\<company-slug>"
```

A reference implementation is available at
[`tools/whitelabel/configs/example-corp/`](tools/whitelabel/configs/example-corp/).
