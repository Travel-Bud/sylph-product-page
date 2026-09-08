import { Fragment } from "react";

/**
 * A sentence split into per character spans so it can be typed in. The real
 * sentence also renders once for screen readers, and the split copy is hidden
 * from them. Words are inline blocks with real spaces between them, so the
 * line still wraps naturally at any width.
 *
 * Base state is the finished state: every character paints. Only the motion
 * gate hides them before replaying the type.
 */
export function Typed({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <>
      <span className="spine-sr">{text}</span>
      <span aria-hidden="true">
        {words.map((word, wi) => (
          <Fragment key={`${word}-${wi}`}>
            <span className="spine-w">
              {Array.from(word).map((ch, ci) => (
                <span className="spine-ch" key={ci}>
                  {ch}
                </span>
              ))}
            </span>
            {wi < words.length - 1 ? " " : null}
          </Fragment>
        ))}
      </span>
    </>
  );
}
