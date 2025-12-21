# Návod: Jak nahrát obrázky do článků

## Rychlý start

1. **Nahrajte obrázek** (JPG, PNG nebo WebP, 800×450 px nebo větší)
2. **Vyplňte alternativní text** (popis obrázku pro nevidomé)
3. **Klikněte na důležitou část** obrázku (např. obličej osoby)
4. **Uložte článek**

Hotovo! Systém automaticky vytvoří optimalizované verze pro všechny části webu.

---

## Podrobný návod

### Krok 1: Příprava obrázku

**Doporučené rozměry:**
- **Ideální**: 1200×675 px (poměr stran 16:9)
- **Minimální**: 800×450 px
- **Maximální**: 4000×4000 px

**Podporované formáty:**
- ✅ JPG/JPEG
- ✅ PNG
- ✅ WebP
- ❌ GIF (animace se nepodporují)
- ❌ SVG (bezpečnostní riziko)

**Velikost souboru:**
- **Maximální**: 10 MB
- **Doporučená**: pod 2 MB

---

### Krok 2: Nahrání v Decap CMS

1. Otevřete článek v editoru
2. Klikněte na pole **"Hlavní obrázek"**
3. Klikněte **"Vybrat soubor"** a zvolte obrázek
4. Systém automaticky zkontroluje:
   - ✓ Formát souboru
   - ✓ Velikost souboru
   - ✓ Rozměry obrázku

**Pokud se objeví chyba:**
- Přečtěte si chybovou zprávu (obsahuje návod, jak problém vyřešit)
- Opravte problém dle návodu
- Zkuste nahrát obrázek znovu

---

### Krok 3: Alternativní text

**Co je alternativní text?**
- Popis obrázku pro nevidomé uživatele (čtečky obrazovky)
- Zobrazí se, když se obrázek nenačte
- Důležité pro SEO (vyhledávače)

**Jak psát dobrý alternativní text:**

✅ **Dobré příklady:**
- "Studenti v halloweenských kostýmech při školní akci"
- "Rekonstrukce školní knihovny s novými regály"
- "Žáci zpívají koledy při vánočním koncertě"

❌ **Špatné příklady:**
- "halloween.jpg" (název souboru)
- "obrázek" (neříká nic)
- "fotka ze školy" (příliš obecné)

**Pravidla:**
- Maximálně **125 znaků** (systém vás upozorní)
- Popište, co je na obrázku vidět
- Nepište "obrázek", "foto" nebo "snímek" (čtečka to už ví)
- Buďte struční, ale výstižní

---

### Krok 4: Bod zaměření

**Co je bod zaměření?**

Říká systému, která část obrázku je **nejdůležitější**. Když se obrázek ořeže na menší velikost (např. na mobilním telefonu nebo v kartě článku), tato část zůstane vždy viditelná.

**Příklad:**
- Na skupinové fotografii kliknete na tvář hlavní osoby
- Na fotografii budovy kliknete na logo školy
- Na fotografii akce kliknete na středový objekt

**Jak nastavit:**

1. Po nahrání obrázku se zobrazí náhled
2. **Klikněte** na nejdůležitější část obrázku
3. Objeví se **animovaný křížek** (modrý kruh s pulzací)
4. Hotovo! Systém si zapamatuje toto místo

**Klávesové zkratky:**
- `Enter` nebo `Mezerník` - nastaví bod zaměření na **střed** (50%, 50%)

**Kdy použít střed:**
- Symetrické fotografie
- Krajina bez hlavního objektu
- Abstraktní vzory

**Kdy kliknout jinam:**
- Portréty (klikněte na obličej)
- Produkty (klikněte na produkt)
- Text na obrázku (klikněte na text)

---

### Krok 5: Pokročilé možnosti (volitelné)

> **⚠️ Poznámka:** Pro většinu článků **pokročilé možnosti nepotřebujete**. Standardní bod zaměření funguje výborně.

**Kdy použít pokročilé možnosti:**
- Chcete přesně ovládat, jak se obrázek ořeže
- Standardní ořez nevypadá dobře
- Máte obrázek se složitou kompozicí

**Jak zobrazit:**

1. Klikněte **"▶ Zobrazit pokročilé možnosti"**
2. Vyberte **variantu** (kde se obrázek použije):
   - **Hlavní banner** (16:9) - velký banner v článku
   - **Karta článku** (16:9) - náhled na přehledových stránkách
   - **Miniatura** (16:9) - malé náhledy
   - **Detail článku** (3:2) - hlavní fotografie v článku
3. Přetáhněte **modrý rám** pro ruční úpravu ořezu
4. Klikněte **"Resetovat ořez"** pro návrat k výchozímu nastavení

**Klávesové zkratky v pokročilém režimu:**
- **Šipky** (← ↑ → ↓) - posunout oblast
- **Ctrl + Šipky** - změnit velikost oblasti
- **+** / **-** - přiblížit/oddálit náhled

---

## Časté problémy a řešení

### ❌ "Nepodporovaný formát souboru"

**Příčina:** Nahráváte soubor, který není JPG, PNG nebo WebP.

**Řešení:**
1. Zjistěte formát vašeho souboru (např. GIF, BMP, TIFF)
2. Převeďte ho online:
   - [convertio.co](https://convertio.co) (online konverze)
   - [cloudconvert.com](https://cloudconvert.com) (online konverze)
   - GIMP (desktop aplikace) - Export as → JPEG
3. Nahrajte převedený soubor

---

### ❌ "Soubor je příliš velký"

**Příčina:** Soubor je větší než 10 MB.

**Řešení - online komprese:**
- [tinypng.com](https://tinypng.com) (nejlepší pro fotografie)
- [squoosh.app](https://squoosh.app) (pokročilá komprese)
- [compressor.io](https://compressor.io) (automatická komprese)

**Řešení - desktop aplikace:**
- **GIMP**: Otevřít → Export As → Quality: 80-85%
- **TinyPNG Desktop**: [tinypng.com/desktop](https://tinypng.com/desktop)

**Tip:** Kvalita 80-85% je ideální - stále vypadá dobře, ale je výrazně menší.

---

### ❌ "Obrázek je příliš malý"

**Příčina:** Obrázek má rozměry menší než 800×450 px.

**Řešení:**
1. **Najděte větší verzi** původního obrázku
2. Pokud nemáte větší verzi:
   - Fotografie z mobilu: pořiďte novou s vyšším rozlišením
   - Obrázek z webu: hledejte verzi "original" nebo "full size"
3. **Nezvětšujte malé obrázky** - budou rozmazané

---

### ❌ "Obrázek je příliš velký (rozměry)"

**Příčina:** Obrázek má rozměry větší než 4000×4000 px.

**Řešení:**
1. Zmenšete obrázek v grafickém editoru
2. Online nástroje:
   - [iloveimg.com/resize-image](https://www.iloveimg.com/resize-image)
   - [picresize.com](https://picresize.com)
3. Doporučené rozměry: 1200×675 px

---

### ❌ "Obrázek se nezobrazuje na webu"

**Řešení:**

1. **Zkontrolujte alternativní text** - je vyplněný?
2. **Uložte článek znovu** - možná se neuložil správně
3. **Vyčkejte 1-2 minuty** - systém může potřebovat čas na zpracování
4. **Aktualizujte stránku** - Ctrl+F5 (vynutí načtení nové verze)
5. **Otevřete konzoli prohlížeče**:
   - Stiskněte F12
   - Záložka "Console"
   - Hledejte chybové zprávy (červeně)
   - Kontaktujte IT podporu s chybovou zprávou

---

### ❌ "Bod zaměření nefunguje správně"

**Příčina:** Klikli jste na špatné místo nebo má obrázek neobvyklý poměr stran.

**Řešení:**
1. Klikněte **znovu** na správné místo (křížek se přesune)
2. Zkontrolujte souřadnice (zobrazují se pod náhledem)
3. Pro reset stiskněte **Enter** (nastaví střed)
4. Pokud problém přetrvává, použijte **pokročilé možnosti** a ořízněte manuálně

---

## Tipy pro nejlepší výsledky

### 📸 Kvalita fotografií

✅ **Používejte kvalitní fotografie:**
- Ostré (ne rozmazané)
- Dobře osvětlené (ne tmavé ani přesvětlené)
- Správně zaostřené

❌ **Vyhněte se:**
- Fotografiím přes sklo (odlesky)
- Fotografiím ze silného protisvetla
- Rozmazaným nebo pixelovaným obrázkům

---

### 📏 Rozměry a kompozice

✅ **Ideální:**
- Horizontální formát (na šířku)
- Poměr stran 16:9 nebo 3:2
- Hlavní objekt ve střední části nebo lehce mimo střed

❌ **Problémy:**
- Vertikální fotografie (na výšku) - budou ořezané
- Čtvercové fotografie - budou ořezané z boků nebo shora/zdola
- Hlavní objekt v rohu - může se ořezat

---

### ⚖️ Autorská práva

✅ **Bezpečné:**
- Vlastní fotografie (pořízené vámi nebo kolegy)
- Fotografie s licencí Creative Commons (CC0, CC-BY)
- Stock fotografie s komerční licencí

❌ **Nebezpečné (možný právní problém):**
- Fotografie z Google vyhledávání (bez povolení)
- Fotografie z jiných webů (bez povolení)
- Fotografie známých fotografů (bez licence)

**Tip:** Pro bezpečné fotografie zdarma použijte:
- [unsplash.com](https://unsplash.com)
- [pexels.com](https://www.pexels.com)
- [pixabay.com](https://pixabay.com)

---

### 🚀 Výkon a optimalizace

✅ **Před nahráním:**
- Zkomprimujte obrázek (tinypng.com)
- Ořízněte nepotřebné části
- Použijte rozumnou velikost (1200×675 px je dost)

✅ **Po nahrání:**
- Systém automaticky vytvoří:
  - WebP verzi (moderní prohlížeče)
  - AVIF verzi (nejnovější prohlížeče)
  - JPG verzi (starší prohlížeče)
- Systém automaticky ořeže pro různé velikosti:
  - Banner: 1920×1080 px
  - Karta: 800×450 px
  - Miniatura: 400×225 px
  - Detail: 1200×800 px

---

## Příklady

### ✅ Dobrý příklad

```yaml
image:
  src: "/images/articles/vanoce-2024.jpg"
  alt: "Žáci zpívají koledy při školním vánočním koncertě v tělocvičně"
  focusPoint:
    x: 45
    y: 35
```

**Proč je to dobré:**
- ✓ Popisný název souboru
- ✓ Výstižný alt text (popisuje scénu)
- ✓ Bod zaměření mimo střed (zaměřený na zpěváky)

---

### ❌ Špatný příklad

```yaml
image:
  src: "/images/IMG_1234.jpg"
  alt: "obrázek"
  focusPoint:
    x: 50
    y: 50
```

**Proč je to špatné:**
- ✗ Generický název souboru (IMG_1234)
- ✗ Neužitečný alt text ("obrázek")
- ✗ Výchozí bod zaměření (možná nestačí)

---

## Kontrolní seznam před publikací

Před publikací článku s obrázkem zkontrolujte:

- [ ] Obrázek je **ostrý a dobře osvětlený**
- [ ] Obrázek má **správný formát** (JPG, PNG, WebP)
- [ ] Obrázek má **dostatečné rozměry** (min. 800×450 px)
- [ ] **Alternativní text** je vyplněný a výstižný (max. 125 znaků)
- [ ] **Bod zaměření** je nastaven na hlavní objekt
- [ ] Máte **autorská práva** k obrázku
- [ ] Obrázek se **správně zobrazuje** v náhledu článku

---

## Potřebujete pomoc?

Pokud máte problém, který není v tomto návodu:

1. **Zkontrolujte chybovou zprávu** - často obsahuje přesný návod
2. **Zkuste jiný obrázek** - problém může být ve specifickém souboru
3. **Kontaktujte IT podporu** s těmito informacemi:
   - Co jste se snažili udělat?
   - Jaká chybová zpráva se objevila?
   - Screenshot obrazovky (Print Screen)
   - Název a velikost souboru, který jste nahrávali

**Kontakt:**
- Email: webmaster@dgkralupy.cz
- IT koordinátor školy
- Školní administrátor CMS

---

## Další zdroje

- [Decap CMS dokumentace](https://decapcms.org/docs/)
- [Astro dokumentace](https://docs.astro.build)
- [Web Accessibility (MDN)](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [Jak psát alt text (WebAIM)](https://webaim.org/techniques/alttext/)

---

**Poslední aktualizace:** 21. prosince 2025
**Verze návodu:** 1.0
