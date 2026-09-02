import Link from 'next/link';
import { Fragment } from 'react';

/**
 * Zwei Auszeichnungen in den Inhaltsdaten, mehr nicht: `**fett**` und
 * `[Text](/pfad)`.
 *
 * Bewusst kein Markdown-Paket und erst recht kein `dangerouslySetInnerHTML`.
 * Die Rechtstexte sind der einzige Ort mit Auszeichnungen, sie brauchen genau
 * diese beiden, und alles, was hier durchgeht, wird als React-Element gebaut —
 * damit kann aus einem Inhaltstext niemals Markup werden.
 */

const PATTERN = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;

export function RichText({ children }: { children: string }) {
  const parts = children.split(PATTERN).filter((part) => part !== '');

  return (
    <>
      {parts.map((part, index) => {
        const bold = /^\*\*([^*]+)\*\*$/.exec(part);
        if (bold) return <strong key={index}>{bold[1]}</strong>;

        const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
        if (link) {
          const [, text, href] = link;
          // Nur eigene Adressen. Ein Rechtstext, der plötzlich nach außen
          // verlinkt, wäre eine Änderung, die man sehen will — nicht eine, die
          // sich über einen Inhaltsstring einschleicht.
          return href.startsWith('/') ? (
            <Link key={index} href={href}>
              {text}
            </Link>
          ) : (
            <Fragment key={index}>{text}</Fragment>
          );
        }

        return <Fragment key={index}>{part}</Fragment>;
      })}
    </>
  );
}
