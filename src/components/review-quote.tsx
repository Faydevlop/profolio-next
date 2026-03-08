"use client";

import { useMemo, useState } from "react";

type ReviewQuoteProps = {
  text: string;
};

export default function ReviewQuote({ text }: ReviewQuoteProps) {
  const [expanded, setExpanded] = useState(false);
  const words = useMemo(() => text.trim().split(/\s+/).filter(Boolean), [text]);
  const shouldToggle = words.length > 10;
  const shortText = shouldToggle ? `${words.slice(0, 10).join(" ")}...` : text;

  return (
    <div className="quote-block">
      <p className="quote">{expanded || !shouldToggle ? text : shortText}</p>
      {shouldToggle ? (
        <button type="button" className="quote-toggle" onClick={() => setExpanded((prev) => !prev)}>
          {expanded ? "Show less" : "See more"}
        </button>
      ) : null}
    </div>
  );
}
