// P-S12: Voorbeeld-data per sectie — "Familie de Voorbeeld"
// Fictieve data om gebruikers te laten zien wat ze kunnen invullen.

export interface VoorbeeldVeld {
  label: string;
  waarde: string;
}

export interface VoorbeeldSectie {
  titel: string;
  velden: VoorbeeldVeld[];
}

export interface VoorbeeldData {
  domein: string;
  titel: string;
  beschrijving: string;
  secties: VoorbeeldSectie[];
}

export function getVoorbeeldData(
  t: (key: string) => string,
): Record<string, VoorbeeldData> {
  return {
    eigenaar: {
      domein: "eigenaar",
      titel: t("eigenaar.titel"),
      beschrijving: t("eigenaar.beschrijving"),
      secties: [
        {
          titel: t("eigenaar.secties.persoonsgegevens.titel"),
          velden: [
            { label: t("eigenaar.secties.persoonsgegevens.voornaam"), waarde: t("eigenaar.secties.persoonsgegevens.voornaamWaarde") },
            { label: t("eigenaar.secties.persoonsgegevens.tussenvoegsel"), waarde: t("eigenaar.secties.persoonsgegevens.tussenvoegselWaarde") },
            { label: t("eigenaar.secties.persoonsgegevens.achternaam"), waarde: t("eigenaar.secties.persoonsgegevens.achternaamWaarde") },
            { label: t("eigenaar.secties.persoonsgegevens.geboortedatum"), waarde: t("eigenaar.secties.persoonsgegevens.geboortedatumWaarde") },
            { label: t("eigenaar.secties.persoonsgegevens.bsn"), waarde: t("eigenaar.secties.persoonsgegevens.bsnWaarde") },
            { label: t("eigenaar.secties.persoonsgegevens.telefoon"), waarde: t("eigenaar.secties.persoonsgegevens.telefoonWaarde") },
            { label: t("eigenaar.secties.persoonsgegevens.email"), waarde: t("eigenaar.secties.persoonsgegevens.emailWaarde") },
          ],
        },
        {
          titel: t("eigenaar.secties.adresgegevens.titel"),
          velden: [
            { label: t("eigenaar.secties.adresgegevens.adres"), waarde: t("eigenaar.secties.adresgegevens.adresWaarde") },
            { label: t("eigenaar.secties.adresgegevens.postcode"), waarde: t("eigenaar.secties.adresgegevens.postcodeWaarde") },
            { label: t("eigenaar.secties.adresgegevens.woonplaats"), waarde: t("eigenaar.secties.adresgegevens.woonplaatsWaarde") },
          ],
        },
        {
          titel: t("eigenaar.secties.burgerlijkeStaat.titel"),
          velden: [
            { label: t("eigenaar.secties.burgerlijkeStaat.burgerlijkeStaat"), waarde: t("eigenaar.secties.burgerlijkeStaat.burgerlijkeStaatWaarde") },
            { label: t("eigenaar.secties.burgerlijkeStaat.huwelijksvoorwaarden"), waarde: t("eigenaar.secties.burgerlijkeStaat.huwelijksvoorwaardenWaarde") },
            { label: t("eigenaar.secties.burgerlijkeStaat.datumHuwelijk"), waarde: t("eigenaar.secties.burgerlijkeStaat.datumHuwelijkWaarde") },
          ],
        },
        {
          titel: t("eigenaar.secties.legitimatie.titel"),
          velden: [
            { label: t("eigenaar.secties.legitimatie.soort"), waarde: t("eigenaar.secties.legitimatie.soortWaarde") },
            { label: t("eigenaar.secties.legitimatie.documentnummer"), waarde: t("eigenaar.secties.legitimatie.documentnummerWaarde") },
            { label: t("eigenaar.secties.legitimatie.datumAfgifte"), waarde: t("eigenaar.secties.legitimatie.datumAfgifteWaarde") },
            { label: t("eigenaar.secties.legitimatie.geldigTot"), waarde: t("eigenaar.secties.legitimatie.geldigTotWaarde") },
          ],
        },
      ],
    },

    testament: {
      domein: "testament",
      titel: t("testament.titel"),
      beschrijving: t("testament.beschrijving"),
      secties: [
        {
          titel: t("testament.secties.testamentgegevens.titel"),
          velden: [
            { label: t("testament.secties.testamentgegevens.typeTestament"), waarde: t("testament.secties.testamentgegevens.typeTestamentWaarde") },
            { label: t("testament.secties.testamentgegevens.datumTestament"), waarde: t("testament.secties.testamentgegevens.datumTestamentWaarde") },
            { label: t("testament.secties.testamentgegevens.ctrNummer"), waarde: t("testament.secties.testamentgegevens.ctrNummerWaarde") },
            { label: t("testament.secties.testamentgegevens.locatie"), waarde: t("testament.secties.testamentgegevens.locatieWaarde") },
          ],
        },
        {
          titel: t("testament.secties.notaris.titel"),
          velden: [
            { label: t("testament.secties.notaris.naam"), waarde: t("testament.secties.notaris.naamWaarde") },
            { label: t("testament.secties.notaris.kantoor"), waarde: t("testament.secties.notaris.kantoorWaarde") },
            { label: t("testament.secties.notaris.telefoon"), waarde: t("testament.secties.notaris.telefoonWaarde") },
            { label: t("testament.secties.notaris.email"), waarde: t("testament.secties.notaris.emailWaarde") },
            { label: t("testament.secties.notaris.adres"), waarde: t("testament.secties.notaris.adresWaarde") },
          ],
        },
        {
          titel: t("testament.secties.executeur.titel"),
          velden: [
            { label: t("testament.secties.executeur.naam"), waarde: t("testament.secties.executeur.naamWaarde") },
            { label: t("testament.secties.executeur.relatie"), waarde: t("testament.secties.executeur.relatieWaarde") },
            { label: t("testament.secties.executeur.bevoegdheden"), waarde: t("testament.secties.executeur.bevoegdhedenWaarde") },
            { label: t("testament.secties.executeur.telefoon"), waarde: t("testament.secties.executeur.telefoonWaarde") },
          ],
        },
        {
          titel: t("testament.secties.begunstigden.titel"),
          velden: [
            { label: t("testament.secties.begunstigden.mariaDeVoorbeeldJansen"), waarde: t("testament.secties.begunstigden.mariaDeVoorbeeldJansenWaarde") },
            { label: t("testament.secties.begunstigden.thomasDeVoorbeeld"), waarde: t("testament.secties.begunstigden.thomasDeVoorbeeldWaarde") },
            { label: t("testament.secties.begunstigden.sophieDeVoorbeeld"), waarde: t("testament.secties.begunstigden.sophieDeVoorbeeldWaarde") },
          ],
        },
        {
          titel: t("testament.secties.aanvullend.titel"),
          velden: [
            { label: t("testament.secties.aanvullend.uitsluitingsclausule"), waarde: t("testament.secties.aanvullend.uitsluitingsclausuleWaarde") },
            { label: t("testament.secties.aanvullend.legaten"), waarde: t("testament.secties.aanvullend.legatenWaarde") },
            { label: t("testament.secties.aanvullend.algemeneWensen"), waarde: t("testament.secties.aanvullend.algemeneWensenWaarde") },
          ],
        },
      ],
    },

    euthanasie: {
      domein: "euthanasie",
      titel: t("euthanasie.titel"),
      beschrijving: t("euthanasie.beschrijving"),
      secties: [
        {
          titel: t("euthanasie.secties.wilsverklaring.titel"),
          velden: [
            { label: t("euthanasie.secties.wilsverklaring.type"), waarde: t("euthanasie.secties.wilsverklaring.typeWaarde") },
            { label: t("euthanasie.secties.wilsverklaring.datumOpgesteld"), waarde: t("euthanasie.secties.wilsverklaring.datumOpgesteldWaarde") },
            { label: t("euthanasie.secties.wilsverklaring.locatieDocument"), waarde: t("euthanasie.secties.wilsverklaring.locatieDocumentWaarde") },
            { label: t("euthanasie.secties.wilsverklaring.huisarts"), waarde: t("euthanasie.secties.wilsverklaring.huisartsWaarde") },
            { label: t("euthanasie.secties.wilsverklaring.telefoonHuisarts"), waarde: t("euthanasie.secties.wilsverklaring.telefoonHuisartsWaarde") },
          ],
        },
        {
          titel: t("euthanasie.secties.wensenEnVoorwaarden.titel"),
          velden: [
            { label: t("euthanasie.secties.wensenEnVoorwaarden.wanneerVanToepassing"), waarde: t("euthanasie.secties.wensenEnVoorwaarden.wanneerVanToepassingWaarde") },
            { label: t("euthanasie.secties.wensenEnVoorwaarden.behandelverbod"), waarde: t("euthanasie.secties.wensenEnVoorwaarden.behandelverbodWaarde") },
            { label: t("euthanasie.secties.wensenEnVoorwaarden.aanvullendeWensen"), waarde: t("euthanasie.secties.wensenEnVoorwaarden.aanvullendeWensenWaarde") },
          ],
        },
      ],
    },

    donor: {
      domein: "donor",
      titel: t("donor.titel"),
      beschrijving: t("donor.beschrijving"),
      secties: [
        {
          titel: t("donor.secties.registratie.titel"),
          velden: [
            { label: t("donor.secties.registratie.keuze"), waarde: t("donor.secties.registratie.keuzeWaarde") },
            { label: t("donor.secties.registratie.specificatie"), waarde: t("donor.secties.registratie.specificatieWaarde") },
            { label: t("donor.secties.registratie.geregistreerdOp"), waarde: t("donor.secties.registratie.geregistreerdOpWaarde") },
            { label: t("donor.secties.registratie.donorregister"), waarde: t("donor.secties.registratie.donorregisterWaarde") },
          ],
        },
      ],
    },

    boedel: {
      domein: "boedel",
      titel: t("boedel.titel"),
      beschrijving: t("boedel.beschrijving"),
      secties: [
        {
          titel: t("boedel.secties.fysiekeBezittingen.titel"),
          velden: [
            { label: t("boedel.secties.fysiekeBezittingen.woningVoorbeeldstraat"), waarde: t("boedel.secties.fysiekeBezittingen.woningVoorbeeldstraatWaarde") },
            { label: t("boedel.secties.fysiekeBezittingen.volkswagenId4"), waarde: t("boedel.secties.fysiekeBezittingen.volkswagenId4Waarde") },
            { label: t("boedel.secties.fysiekeBezittingen.antiekDressoir"), waarde: t("boedel.secties.fysiekeBezittingen.antiekDressoirWaarde") },
            { label: t("boedel.secties.fysiekeBezittingen.zonnepanelen"), waarde: t("boedel.secties.fysiekeBezittingen.zonnepanelenWaarde") },
          ],
        },
        {
          titel: t("boedel.secties.bankrekeningen.titel"),
          velden: [
            { label: t("boedel.secties.bankrekeningen.ingBetaalrekening"), waarde: t("boedel.secties.bankrekeningen.ingBetaalrekeningWaarde") },
            { label: t("boedel.secties.bankrekeningen.rabobankSpaarrekening"), waarde: t("boedel.secties.bankrekeningen.rabobankSpaarrekeningWaarde") },
            { label: t("boedel.secties.bankrekeningen.abnAmroBeleggingsrekening"), waarde: t("boedel.secties.bankrekeningen.abnAmroBeleggingsrekeningWaarde") },
          ],
        },
        {
          titel: t("boedel.secties.verzekeringen.titel"),
          velden: [
            { label: t("boedel.secties.verzekeringen.overlijdensrisicoverzekering"), waarde: t("boedel.secties.verzekeringen.overlijdensrisicoverzekeringWaarde") },
            { label: t("boedel.secties.verzekeringen.uitvaartverzekering"), waarde: t("boedel.secties.verzekeringen.uitvaartverzekeringWaarde") },
            { label: t("boedel.secties.verzekeringen.inboedelverzekering"), waarde: t("boedel.secties.verzekeringen.inboedelverzekeringWaarde") },
          ],
        },
        {
          titel: t("boedel.secties.schulden.titel"),
          velden: [
            { label: t("boedel.secties.schulden.hypotheekWoning"), waarde: t("boedel.secties.schulden.hypotheekWoningWaarde") },
            { label: t("boedel.secties.schulden.persoonlijkeLening"), waarde: t("boedel.secties.schulden.persoonlijkeLeningWaarde") },
          ],
        },
      ],
    },

    uitvaart: {
      domein: "uitvaart",
      titel: t("uitvaart.titel"),
      beschrijving: t("uitvaart.beschrijving"),
      secties: [
        {
          titel: t("uitvaart.secties.vormEnLocatie.titel"),
          velden: [
            { label: t("uitvaart.secties.vormEnLocatie.voorkeur"), waarde: t("uitvaart.secties.vormEnLocatie.voorkeurWaarde") },
            { label: t("uitvaart.secties.vormEnLocatie.locatie"), waarde: t("uitvaart.secties.vormEnLocatie.locatieWaarde") },
            { label: t("uitvaart.secties.vormEnLocatie.uitvaartondernemer"), waarde: t("uitvaart.secties.vormEnLocatie.uitvaartondernemerWaarde") },
            { label: t("uitvaart.secties.vormEnLocatie.verzekeraar"), waarde: t("uitvaart.secties.vormEnLocatie.verzekeraarWaarde") },
          ],
        },
        {
          titel: t("uitvaart.secties.ceremonie.titel"),
          velden: [
            { label: t("uitvaart.secties.ceremonie.type"), waarde: t("uitvaart.secties.ceremonie.typeWaarde") },
            { label: t("uitvaart.secties.ceremonie.muziek"), waarde: t("uitvaart.secties.ceremonie.muziekWaarde") },
            { label: t("uitvaart.secties.ceremonie.sprekers"), waarde: t("uitvaart.secties.ceremonie.sprekersWaarde") },
            { label: t("uitvaart.secties.ceremonie.bloemen"), waarde: t("uitvaart.secties.ceremonie.bloemenWaarde") },
            { label: t("uitvaart.secties.ceremonie.dresscode"), waarde: t("uitvaart.secties.ceremonie.dresscodeWaarde") },
          ],
        },
        {
          titel: t("uitvaart.secties.naDeUitvaart.titel"),
          velden: [
            { label: t("uitvaart.secties.naDeUitvaart.asbestemming"), waarde: t("uitvaart.secties.naDeUitvaart.asbestemmingWaarde") },
            { label: t("uitvaart.secties.naDeUitvaart.rouwkaart"), waarde: t("uitvaart.secties.naDeUitvaart.rouwkaartWaarde") },
            { label: t("uitvaart.secties.naDeUitvaart.condoleance"), waarde: t("uitvaart.secties.naDeUitvaart.condoleanceWaarde") },
          ],
        },
      ],
    },

    erfgenamen: {
      domein: "erfgenamen",
      titel: t("erfgenamen.titel"),
      beschrijving: t("erfgenamen.beschrijving"),
      secties: [
        {
          titel: t("erfgenamen.secties.erfgenaam1.titel"),
          velden: [
            { label: t("erfgenamen.secties.erfgenaam1.naam"), waarde: t("erfgenamen.secties.erfgenaam1.naamWaarde") },
            { label: t("erfgenamen.secties.erfgenaam1.relatie"), waarde: t("erfgenamen.secties.erfgenaam1.relatieWaarde") },
            { label: t("erfgenamen.secties.erfgenaam1.geboortedatum"), waarde: t("erfgenamen.secties.erfgenaam1.geboortedatumWaarde") },
            { label: t("erfgenamen.secties.erfgenaam1.bsn"), waarde: t("erfgenamen.secties.erfgenaam1.bsnWaarde") },
            { label: t("erfgenamen.secties.erfgenaam1.telefoon"), waarde: t("erfgenamen.secties.erfgenaam1.telefoonWaarde") },
            { label: t("erfgenamen.secties.erfgenaam1.email"), waarde: t("erfgenamen.secties.erfgenaam1.emailWaarde") },
            { label: t("erfgenamen.secties.erfgenaam1.legitimatie"), waarde: t("erfgenamen.secties.erfgenaam1.legitimatieWaarde") },
          ],
        },
        {
          titel: t("erfgenamen.secties.erfgenaam2.titel"),
          velden: [
            { label: t("erfgenamen.secties.erfgenaam2.naam"), waarde: t("erfgenamen.secties.erfgenaam2.naamWaarde") },
            { label: t("erfgenamen.secties.erfgenaam2.relatie"), waarde: t("erfgenamen.secties.erfgenaam2.relatieWaarde") },
            { label: t("erfgenamen.secties.erfgenaam2.geboortedatum"), waarde: t("erfgenamen.secties.erfgenaam2.geboortedatumWaarde") },
            { label: t("erfgenamen.secties.erfgenaam2.telefoon"), waarde: t("erfgenamen.secties.erfgenaam2.telefoonWaarde") },
            { label: t("erfgenamen.secties.erfgenaam2.email"), waarde: t("erfgenamen.secties.erfgenaam2.emailWaarde") },
          ],
        },
        {
          titel: t("erfgenamen.secties.erfgenaam3.titel"),
          velden: [
            { label: t("erfgenamen.secties.erfgenaam3.naam"), waarde: t("erfgenamen.secties.erfgenaam3.naamWaarde") },
            { label: t("erfgenamen.secties.erfgenaam3.relatie"), waarde: t("erfgenamen.secties.erfgenaam3.relatieWaarde") },
            { label: t("erfgenamen.secties.erfgenaam3.geboortedatum"), waarde: t("erfgenamen.secties.erfgenaam3.geboortedatumWaarde") },
            { label: t("erfgenamen.secties.erfgenaam3.telefoon"), waarde: t("erfgenamen.secties.erfgenaam3.telefoonWaarde") },
            { label: t("erfgenamen.secties.erfgenaam3.email"), waarde: t("erfgenamen.secties.erfgenaam3.emailWaarde") },
          ],
        },
      ],
    },

    "digitaal-bezit": {
      domein: "digitaal-bezit",
      titel: t("digitaalBezit.titel"),
      beschrijving: t("digitaalBezit.beschrijving"),
      secties: [
        {
          titel: t("digitaalBezit.secties.emailEnCloud.titel"),
          velden: [
            { label: t("digitaalBezit.secties.emailEnCloud.google"), waarde: t("digitaalBezit.secties.emailEnCloud.googleWaarde") },
            { label: t("digitaalBezit.secties.emailEnCloud.icloud"), waarde: t("digitaalBezit.secties.emailEnCloud.icloudWaarde") },
          ],
        },
        {
          titel: t("digitaalBezit.secties.socialMedia.titel"),
          velden: [
            { label: t("digitaalBezit.secties.socialMedia.facebook"), waarde: t("digitaalBezit.secties.socialMedia.facebookWaarde") },
            { label: t("digitaalBezit.secties.socialMedia.linkedin"), waarde: t("digitaalBezit.secties.socialMedia.linkedinWaarde") },
            { label: t("digitaalBezit.secties.socialMedia.instagram"), waarde: t("digitaalBezit.secties.socialMedia.instagramWaarde") },
          ],
        },
        {
          titel: t("digitaalBezit.secties.financieelEnCrypto.titel"),
          velden: [
            { label: t("digitaalBezit.secties.financieelEnCrypto.paypal"), waarde: t("digitaalBezit.secties.financieelEnCrypto.paypalWaarde") },
            { label: t("digitaalBezit.secties.financieelEnCrypto.bitcoinWallet"), waarde: t("digitaalBezit.secties.financieelEnCrypto.bitcoinWalletWaarde") },
          ],
        },
      ],
    },

    noodcontacten: {
      domein: "noodcontacten",
      titel: t("noodcontacten.titel"),
      beschrijving: t("noodcontacten.beschrijving"),
      secties: [
        {
          titel: t("noodcontacten.secties.contactpersonen.titel"),
          velden: [
            { label: t("noodcontacten.secties.contactpersonen.mariaDeVoorbeeldJansen"), waarde: t("noodcontacten.secties.contactpersonen.mariaDeVoorbeeldJansenWaarde") },
            { label: t("noodcontacten.secties.contactpersonen.mrJhBakker"), waarde: t("noodcontacten.secties.contactpersonen.mrJhBakkerWaarde") },
            { label: t("noodcontacten.secties.contactpersonen.drAbSmit"), waarde: t("noodcontacten.secties.contactpersonen.drAbSmitWaarde") },
            { label: t("noodcontacten.secties.contactpersonen.janDeVries"), waarde: t("noodcontacten.secties.contactpersonen.janDeVriesWaarde") },
            { label: t("noodcontacten.secties.contactpersonen.karelJansen"), waarde: t("noodcontacten.secties.contactpersonen.karelJansenWaarde") },
          ],
        },
      ],
    },
  };
}
