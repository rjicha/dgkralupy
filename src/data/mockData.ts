/**
 * DEPRECATED: This file is no longer used in production.
 *
 * All content has been migrated to Astro Content Collections as part of Phase 3.
 * Content is now managed through Decap CMS and stored in /src/content/
 *
 * Migration details:
 * - Articles: /src/content/articles/*.md
 * - Pages: /src/content/pages/*.md
 * - Navigation: /src/content/navigation/navigation.json
 * - Contacts: /src/content/contacts/contacts.json
 * - Quick Links: /src/content/quick-links/quick-links.json
 *
 * This file is kept temporarily for reference only.
 * TODO: Remove this file after Phase 3 validation is complete.
 *
 * @deprecated Since Phase 3 (2025-12-12) - Use Astro Content Collections instead
 */

// Mock data from the real dgkralupy.cz website
// Based on Phase 0 analysis conducted on 2025-12-02

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  author: string;
  tags: string[];
  image: string;
  featured: boolean;
  important: boolean;
}

export interface NavigationSection {
  id: string;
  title: string;
  url: string;
  color: string; // TailwindCSS color class
  subsections?: NavigationSubsection[];
}

export interface NavigationSubsection {
  title: string;
  url: string;
}

export interface QuickLink {
  title: string;
  url: string;
  color: string;
}

export interface SchoolContact {
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  ico: string;
  dic: string;
  bankAccount: string;
}

// Navigation structure from the real website
export const navigationSections: NavigationSection[] = [
  {
    id: 'about',
    title: 'O škole',
    url: '/o-skole',
    color: 'primary',
    subsections: [
      { title: 'Popis školy', url: '/o-skole/popis-skoly' },
      { title: 'Základní dokumenty', url: '/o-skole/zakladni-dokumenty' },
      { title: 'Společnost pro rozvoj DG', url: '/o-skole/spolecnost-pro-rozvoj-dg-ops' },
      { title: 'Školní psycholog', url: '/o-skole/skolni-psycholog' },
      { title: 'Kariérový poradce', url: '/o-skole/karierovy-poradce' },
      { title: 'Rada rodičů', url: '/o-skole/rada-rodicu' },
      { title: 'Partneři', url: '/o-skole/partneri' },
      { title: 'Granty a dotace', url: '/o-skole/granty-a-dotace' },
      { title: 'GDPR', url: '/o-skole/gdpr' },
      { title: 'Školská rada', url: '/o-skole/skolska-rada' },
      { title: 'Ochrana oznamovatelů', url: '/o-skole/ochrana-oznamovatelu' },
      { title: 'Výchovný poradce a metodik prevence', url: '/o-skole/vychovny-poradce-a-metodik-prevence' },
      { title: 'Informace dle zákona 106/1999 Sb.', url: '/o-skole/informace-dle-zakona-1061999-sb' },
    ],
  },
  {
    id: 'studies',
    title: 'Studium',
    url: '/studium',
    color: 'secondary',
    subsections: [
      { title: 'Suplování', url: '/studium/suplovani' },
      { title: 'Rozvrhy hodin', url: '/studium/rozvrhy-hodin' },
      { title: 'Bakaláři', url: '/studium/bakalari' },
      { title: 'ISIC', url: '/studium/isic' },
      { title: 'Ke stažení', url: '/studium/dokumenty-a-vzory-ke-stazeni' },
      { title: 'Přijímací řízení', url: '/studium/prijimaci-rizeni' },
      { title: 'Maturita', url: '/studium/maturita' },
      { title: 'Výuka', url: '/studium/vyuka' },
      { title: 'Výuka angličtiny', url: '/studium/vyuka-anglictiny' },
      { title: 'Software ve výuce', url: '/studium/software-ve-vyuce' },
      { title: 'Jídelna', url: '/studium/jidelna' },
    ],
  },
  {
    id: 'activities',
    title: 'Aktivity',
    url: '/aktivity',
    color: 'accent-green',
    subsections: [
      { title: 'Studentský parlament', url: '/aktivity/studentsky-parlament' },
      { title: 'Zájmové kluby', url: '/aktivity/zajmove-kluby' },
      { title: 'Erasmus+', url: '/aktivity/erasmus' },
      { title: 'Den pro DG', url: '/aktivity/den-pro-dg' },
      { title: 'Fiktivní a reálné firmy', url: '/aktivity/fiktivni-a-realne-firmy' },
      { title: 'Pěvecký sbor DG', url: '/aktivity/pevecky-sbor-dg' },
      { title: 'Nota D', url: '/aktivity/nota-d' },
      { title: 'Knihovna', url: '/aktivity/knihovna' },
      { title: 'Úspěchy studentů', url: '/aktivity/uspechy-studentu' },
      { title: 'DofE', url: '/aktivity/dofe' },
      { title: 'Studentský časopis', url: '/aktivity/studentsky-casopis' },
    ],
  },
  {
    id: 'news',
    title: 'Aktuálně',
    url: '/aktualne',
    color: 'accent-coral',
  },
  {
    id: 'help',
    title: 'Pomoc jiným',
    url: '/pomoc-jinym',
    color: 'primary-dark',
  },
  {
    id: 'contacts',
    title: 'Kontakty',
    url: '/kontakty',
    color: 'primary',
    subsections: [
      { title: 'Škola', url: '/kontakty/skola' },
      { title: 'Učitelé', url: '/kontakty/ucitele' },
      { title: 'Předmětové komise', url: '/kontakty/predmetove-komise' },
      { title: 'Školní poradci', url: '/kontakty/skolni-poradci' },
    ],
  },
];

// Quick links from the real website
export const quickLinks: QuickLink[] = [
  { title: 'Suplování', url: '/studium/suplovani', color: 'accent-coral' },
  { title: 'Rozvrhy hodin', url: '/studium/rozvrhy-hodin', color: 'secondary' },
  { title: 'Přijímací řízení', url: '/studium/prijimaci-rizeni', color: 'accent-rose' },
  { title: 'Bakaláři', url: '/studium/bakalari', color: 'accent-green' },
];

// Sample articles based on real content from the website (as of 2025-12-02)
export const articles: Article[] = [
  {
    id: '1',
    title: 'Den otevřených dveří - středa 3. prosince 2025 od 14:30 do 17:00',
    slug: 'den-otevrenych-dveri-prosinec-2025',
    excerpt: 'Zveme vás na tradiční den otevřených dveří, kde se můžete seznámit s prostředím naší školy, vyučujícími a studijními programy.',
    content: 'Srdečně zveme všechny zájemce o studium na Dvořákově gymnáziu na den otevřených dveří. Akce se koná ve středu 3. prosince 2025 od 14:30 do 17:00 hodin. Budete mít možnost prohlédnout si prostory školy, setkat se s vyučujícími a studenty, a dozvědět se více o našich studijních programech a aktivitách.',
    publishedAt: '30.11.2025',
    author: 'Mgr. Jana Nováková',
    tags: ['Akce', 'Přijímací řízení', 'Den otevřených dveří'],
    image: '/images/open-house.jpg',
    featured: true,
    important: true,
  },
  {
    id: '2',
    title: 'Adventní běhání',
    slug: 'adventni-behani',
    excerpt: 'Studenti a učitelé naší školy se zapojují do tradiční dobročinné akce Adventní běhání, jejímž cílem je podpořit potřebné.',
    content: 'I letos se naše škola zapojila do Adventního běhání. Tato aktivita spojuje sportovní vyžití s pomocí druhým. Výtěžek z akce bude věnován charitativním účelům. Děkujeme všem účastníkům za jejich nasazení!',
    publishedAt: '28.11.2025',
    author: 'Mgr. Petr Svoboda',
    tags: ['Sport', 'Charita', 'Aktivity'],
    image: '/images/advent-run.jpg',
    featured: true,
    important: false,
  },
  {
    id: '3',
    title: 'Vánoční koncert',
    slug: 'vanocni-koncert-2025',
    excerpt: 'Pěvecký sbor DG a další hudební uskupení vás srdečně zvou na tradiční vánoční koncert, který se koná 18. prosince 2025.',
    content: 'V předvánočním čase vás srdečně zveme na tradiční vánoční koncert, který se uskuteční ve středu 18. prosince 2025 v aule naší školy. Představí se pěvecký sbor DG, školní kapela Nota D a další talentovaní studenti. Vstup je volný.',
    publishedAt: '25.11.2025',
    author: 'Mgr. Marie Dvořáková',
    tags: ['Kultura', 'Hudba', 'Akce'],
    image: '/images/christmas-concert.jpg',
    featured: false,
    important: false,
  },
  {
    id: '4',
    title: 'Halloween na DG',
    slug: 'halloween-oslava',
    excerpt: 'Studenti si užili tradiční halloweenskou oslavu s kostýmy, soutěžemi a strašidelnou atmosférou.',
    content: 'Halloweenská oslava se i letos setkala s velkým úspěchem. Studenti přišli v kreativních kostýmech a účastnili se různých soutěží a aktivit. Děkujeme studentskému parlamentu za skvělou organizaci této akce!',
    publishedAt: '01.11.2025',
    author: 'Studentský parlament',
    tags: ['Akce', 'Studentský parlament', 'Zábava'],
    image: '/images/halloween.jpg',
    featured: false,
    important: false,
  },
  {
    id: '5',
    title: 'Rekonstrukce školní knihovny',
    slug: 'rekonstrukce-knihovny',
    excerpt: 'Probíhají práce na rekonstrukci školní knihovny, která získá moderní podobu a nové vybavení pro studenty.',
    content: 'Jsme rádi, že můžeme informovat o pokračující rekonstrukci naší školní knihovny. Nový prostor bude vybaven moderním nábytkem, počítačovou technikou a poskytne studentům příjemné prostředí pro studium a relaxaci. Dokončení prací očekáváme začátkem roku 2026.',
    publishedAt: '15.10.2025',
    author: 'Mgr. Karel Procházka',
    tags: ['Škola', 'Rekonstrukce', 'Knihovna'],
    image: '/images/library-reconstruction.jpg',
    featured: false,
    important: false,
  },
  {
    id: '6',
    title: 'Erasmus+ výměnný pobyt v Německu',
    slug: 'erasmus-nemecko',
    excerpt: 'Skupina našich studentů se vrátila z týdenního pobytu v německém partnerském gymnáziu v rámci programu Erasmus+.',
    content: 'Skupina 15 studentů se vrátila z úspěšného týdenního pobytu na partnerském gymnáziu v Berlíně. Program zahrnoval návštěvy kulturních památek, účast na výuce a ubytování v rodinách německých studentů. Jednalo se o skvělou příležitost k jazykovému a kulturnímu rozvoji.',
    publishedAt: '10.10.2025',
    author: 'Mgr. Eva Černá',
    tags: ['Erasmus+', 'Zahraniční pobyt', 'Studium'],
    image: '/images/erasmus-germany.jpg',
    featured: false,
    important: false,
  },
];

// School contact information
export const schoolContact: SchoolContact = {
  name: 'Dvořákovo gymnázium',
  address: 'Dvořákovo nám. 800',
  city: '278 01 Kralupy nad Vltavou',
  phone: '315 727 311',
  email: 'info@dgkralupy.cz',
  ico: '48588954',
  dic: 'CZ48588954',
  bankAccount: '27-6451920297/0100',
};

export const cafeteriaContact = {
  phone: '315 722 552',
  email: 'jidelna@dgkralupy.cz',
  submission: '7czbwjy',
};

export const socialMedia = {
  facebook: 'https://www.facebook.com/dvorakovogym',
  instagram: 'https://www.instagram.com/dg_kralupy',
};
