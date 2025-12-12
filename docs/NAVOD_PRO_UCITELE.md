# Návod pro učitele - Správa obsahu webu

Tento návod vám ukáže, jak upravovat obsah webu dgkralupy.cz pomocí administračního rozhraní.

## Přístup do administrace

Administrační rozhraní najdete na adrese:

**https://rjicha.github.io/dgkralupy/admin/**

### První přihlášení

1. Klikněte na tlačítko **"Login with GitHub"**
2. Přihlaste se svým GitHub účtem
3. Povolte přístup aplikaci (pouze při prvním přihlášení)
4. Budete přesměrováni do administrace

> **Poznámka**: Pro přístup potřebujete GitHub účet a oprávnění k repozitáři. Pokud nemáte přístup, kontaktujte správce webu.

## Základní orientace

Po přihlášení uvidíte hlavní menu s těmito sekcemi:

- **Články a aktuality** - Novinky, akce, oznámení
- **Stránky** - Statické stránky (O škole, Studium, atd.)
- **Nastavení webu** - Kontakty, navigace, rychlé odkazy

## Vytvoření nového článku

1. V levém menu klikněte na **"Články a aktuality"**
2. Klikněte na tlačítko **"New Článek"** vpravo nahoře
3. Vyplňte formulář:

### Povinná pole:
- **Nadpis**: Hlavní nadpis článku
- **Perex**: Krátký úvodní text (2-3 věty)
- **Obsah článku**: Plný text článku
- **Datum publikace**: Ve formátu DD.MM.YYYY (např. 15.12.2025)
- **Autor**: Vaše jméno nebo "Redakce"

### Volitelná pole:
- **Štítky**: Kategorie (Akce, Sport, Studium...) - můžete přidat více
- **Hlavní obrázek**: Nahrát obrázek k článku
- **Zvýrazněný článek**: Zobrazí se na hlavní stránce
- **Důležité oznámení**: Článek bude výrazně označen
- **Koncept**: Článek se nezobrazí na webu (pro rozpracované články)

4. Klikněte na **"Save"** (uloží koncept)
5. Klikněte na **"Publish"** → **"Publish now"** pro zveřejnění

## Úprava existujícího článku

1. V levém menu klikněte na **"Články a aktuality"**
2. Najděte článek v seznamu a klikněte na něj
3. Proveďte změny
4. Klikněte na **"Save"** a pak **"Publish"** → **"Publish now"**

## Práce s obrázky

### Nahrání obrázku:
1. V poli **"Hlavní obrázek"** klikněte na **"Choose an image"**
2. Přetáhněte obrázek nebo klikněte na **"Upload"**
3. Vyberte soubor z počítače
4. Obrázek se automaticky nahraje a vloží

### Doporučení pro obrázky:
- Formát: JPG nebo PNG
- Doporučená velikost: 1200×675 pixelů (poměr 16:9)
- Maximální velikost souboru: 5 MB
- Používejte popisné názvy (např. `den-otevrenych-dveri-2025.jpg`)

## Formátování textu (Markdown)

V editoru můžete používat tyto formátovací značky:

```markdown
# Velký nadpis
## Střední nadpis
### Malý nadpis

**Tučný text**
*Kurzíva*

- Odrážka
- Další odrážka

1. Číslovaný seznam
2. Druhá položka

[Text odkazu](https://example.com)

![Popis obrázku](/dgkralupy/images/obrazek.jpg)
```

Nebo použijte tlačítka v editoru pro:
- **B** - tučné písmo
- **I** - kurzíva
- **"** - citace
- **</>** - kód
- **#** - nadpisy
- 🔗 - odkaz
- 🖼️ - obrázek

## Publikační workflow

Systém používá schvalovací proces:

1. **Draft** (Koncept)
   - Článek je uložen, ale nezveřejněn
   - Můžete na něm dále pracovat

2. **In Review** (Ke kontrole)
   - Článek je připraven ke kontrole
   - Jiný uživatel může zkontrolovat a schválit

3. **Ready** (Připraven)
   - Článek je schválen a bude zveřejněn
   - Po kliknutí na "Publish now" se zveřejní na webu

## Časté otázky

### Jak dlouho trvá, než se změny projeví na webu?
Obvykle 2-5 minut. Web se automaticky sestaví a publikuje po každé změně.

### Můžu vrátit zpět nechtěné změny?
Ano, všechny změny jsou verzovány v Gitu. Kontaktujte správce webu.

### Co dělat, když se změny nezobrazí?
1. Počkejte alespoň 5 minut
2. Obnovte stránku (Ctrl+F5)
3. Zkontrolujte, zda jste klikli na "Publish"
4. Pokud problém přetrvává, kontaktujte správce

### Můžu přidat video?
Momentálně nelze nahrát video přímo. Můžete ale vložit odkaz na YouTube:
```markdown
[Podívejte se na video](https://youtube.com/watch?v=...)
```

### Jak vložím PDF dokument?
1. V editoru vložte odkaz:
```markdown
[Stáhnout dokument](/dgkralupy/documents/nazev.pdf)
```
2. PDF soubory musí být nahrány správcem do složky `public/documents/`

## Správa stránek

Kromě článků můžete upravovat i statické stránky:

1. V levém menu klikněte na **"Stránky"**
2. Vyberte stránku k úpravě
3. Upravte obsah
4. Uložte a zveřejněte

## Nápověda a podpora

- **Technická dokumentace**: Viz soubor `docs/CMS_SETUP.md`
- **Oficiální dokumentace Decap CMS**: https://decapcms.org/docs/
- **Problémy a dotazy**: Kontaktujte správce webu nebo vytvořte issue na GitHubu

## Bezpečnost

- ⚠️ Nikdy nesdílejte své přihlašovací údaje
- ⚠️ Používejte silné heslo k GitHub účtu
- ⚠️ Před publikací zkontrolujte, že nesdílíte citlivé informace
- ⚠️ V článcích nepoužívejte osobní údaje studentů bez souhlasu

## Tipy pro kvalitní články

1. **Poutavý nadpis**: Stručný a výstižný (max 60 znaků)
2. **Dobrý perex**: První 2-3 věty, které shrnou obsah
3. **Strukturovaný text**: Používejte nadpisy a odstavce
4. **Kvalitní obrázky**: Ostré, dobře osvětlené fotografie
5. **Kontrola**: Před publikací zkontrolujte pravopis
6. **Aktuálnost**: Pravidelně aktualizujte staré články nebo je archivujte
7. **Přístupnost**: Popište obrázky pro zrakově postižené

---

**Poslední aktualizace**: Prosinec 2025
**Verze**: 1.0
