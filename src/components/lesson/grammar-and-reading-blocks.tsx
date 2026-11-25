type GrammarExplanationViewProps = {
  ruleTitle: string;
  explanation: string;
  examples?: readonly string[];
};

export function GrammarExplanationView({
  ruleTitle,
  explanation,
  examples,
}: GrammarExplanationViewProps) {
  return (
    <article className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)]/40 p-5">
      <h3 className="text-lg font-semibold text-[var(--text-primary)]">{ruleTitle}</h3>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-[var(--text-primary)] sm:text-base">
        {explanation}
      </p>
      {examples && examples.length > 0 ? (
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-[var(--text-primary)]">
          {examples.map((example, index) => (
            <li key={`${index}-${example}`}>{example}</li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

type ExampleSentenceViewProps = {
  german: string;
  english: string;
};

export function ExampleSentenceView({ german, english }: ExampleSentenceViewProps) {
  return (
    <blockquote className="rounded-[var(--radius-md)] border-l-4 border-[var(--accent-academic-blue)] bg-[var(--surface-secondary)]/50 px-4 py-3">
      <p className="text-base font-medium text-[var(--text-primary)]">{german}</p>
      {english ? (
        <footer className="mt-1 text-sm text-[var(--text-secondary)]">{english}</footer>
      ) : null}
    </blockquote>
  );
}

type ReadingPassageViewProps = {
  title: string;
  germanText: string;
  translationNote?: string;
};

export function ReadingPassageView({
  title,
  germanText,
  translationNote,
}: ReadingPassageViewProps) {
  const paragraphs = germanText
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <article className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-white p-5 sm:p-6">
      <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
      <div className="mt-3 max-w-prose space-y-3 text-base leading-relaxed text-[var(--text-primary)]">
        {paragraphs.length > 0 ? (
          paragraphs.map((paragraph, idx) => <p key={idx}>{paragraph}</p>)
        ) : (
          <p>{germanText}</p>
        )}
      </div>
      {translationNote ? (
        <p className="mt-4 max-w-prose border-t border-[var(--border-subtle)] pt-3 text-sm text-[var(--text-secondary)]">
          {translationNote}
        </p>
      ) : null}
    </article>
  );
}

type SentenceConstructionViewProps = {
  prompt: string;
  targetHint?: string;
};

export function SentenceConstructionView({
  prompt,
  targetHint,
}: SentenceConstructionViewProps) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)]/40 p-5">
      <p className="text-base font-medium text-[var(--text-primary)]">{prompt}</p>
      {targetHint ? (
        <p className="mt-2 text-sm text-[var(--text-secondary)]">Hint: {targetHint}</p>
      ) : null}
    </div>
  );
}

type ExerciseReferenceViewProps = {
  exerciseId: string;
  summary: string;
};

export function ExerciseReferenceView({ exerciseId, summary }: ExerciseReferenceViewProps) {
  return (
    <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--border-subtle)] bg-[var(--surface-secondary)]/30 p-4">
      <p className="text-xs font-medium tracking-wide text-[var(--text-secondary)] uppercase">
        Exercise Reference &middot; {exerciseId}
      </p>
      <p className="mt-1 text-sm text-[var(--text-primary)]">{summary}</p>
    </div>
  );
}

