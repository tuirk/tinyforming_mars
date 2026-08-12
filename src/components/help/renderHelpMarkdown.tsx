import type { ReactNode } from 'react';

/** Lightweight markdown for help text: **bold**, ### headings, - lists */
export function renderHelpMarkdown(content: string): ReactNode[] {
  const lines = content.split('\n');
  const nodes: ReactNode[] = [];
  let listItems: ReactNode[] = [];
  let key = 0;

  const flushList = () => {
    if (listItems.length === 0) return;
    nodes.push(
      <ul key={`ul-${key++}`} className="my-2 list-disc space-y-1 pl-5">
        {listItems}
      </ul>,
    );
    listItems = [];
  };

  const inline = (text: string, prefix: string): ReactNode => {
    const parts: ReactNode[] = [];
    const re = /\*\*(.+?)\*\*/g;
    let last = 0;
    let match: RegExpExecArray | null;
    let i = 0;
    while ((match = re.exec(text)) !== null) {
      if (match.index > last) {
        parts.push(text.slice(last, match.index));
      }
      parts.push(
        <strong key={`${prefix}-b-${i++}`} className="font-semibold text-foreground">
          {match[1]}
        </strong>,
      );
      last = match.index + match[0].length;
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts.length === 1 ? parts[0] : parts;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const trimmed = line.trim();

    if (trimmed.startsWith('- ')) {
      listItems.push(
        <li key={`li-${key++}`}>{inline(trimmed.slice(2), `li-${key}`)}</li>,
      );
      continue;
    }

    flushList();

    if (!trimmed) {
      nodes.push(<div key={`sp-${key++}`} className="h-2" />);
      continue;
    }

    if (trimmed.startsWith('### ')) {
      nodes.push(
        <h4 key={`h-${key++}`} className="mt-3 mb-1 font-headline text-sm font-semibold text-foreground">
          {inline(trimmed.slice(4), `h-${key}`)}
        </h4>,
      );
      continue;
    }

    // Numbered list line (e.g. "1. Points from cities")
    const numbered = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numbered) {
      nodes.push(
        <p key={`n-${key++}`} className="my-0.5 pl-1">
          <span className="text-muted-foreground">{numbered[1]}.</span>{' '}
          {inline(numbered[2], `n-${key}`)}
        </p>,
      );
      continue;
    }

    nodes.push(
      <p key={`p-${key++}`} className="my-1">
        {inline(trimmed, `p-${key}`)}
      </p>,
    );
  }

  flushList();
  return nodes;
}
