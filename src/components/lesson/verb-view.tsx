import type { VerbEntry } from "@/types/content";

type VerbInfoViewProps = {
  verb: VerbEntry;
};

export function VerbInfoView({ verb }: VerbInfoViewProps) {
  const conjugationEntries = verb.conjugation ? Object.entries(verb.conjugation) : [];

  return (
    <article className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)]/50 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">{verb.infinitive}</h3>
        <span className="text-sm font-medium text-[var(--accent-academic-blue)]">
          {verb.englishMeaning}
        </span>
      </div>

      {verb.prateritum || verb.partizipII ? (
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          {verb.prateritum ? (
            <div>
              <dt className="text-xs font-medium text-[var(--text-secondary)] uppercase">
                Präteritum
              </dt>
              <dd className="mt-0.5 font-medium text-[var(--text-primary)]">{verb.prateritum}</dd>
            </div>
          ) : null}
          {verb.partizipII ? (
            <div>
              <dt className="text-xs font-medium text-[var(--text-secondary)] uppercase">
                Partizip II
              </dt>
              <dd className="mt-0.5 font-medium text-[var(--text-primary)]">{verb.partizipII}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      {conjugationEntries.length > 0 ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] uppercase">
                <th className="py-2 pr-4 font-semibold">Person / Form</th>
                <th className="py-2 font-semibold">Conjugated Form</th>
              </tr>
            </thead>
            <tbody>
              {conjugationEntries.map(([pronounOrForm, form]) => (
                <tr key={pronounOrForm} className="border-b border-[var(--border-subtle)]/70">
                  <td className="py-2 pr-4 text-[var(--text-secondary)]">{pronounOrForm}</td>
                  <td className="py-2 font-medium text-[var(--text-primary)]">{form}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {verb.exampleSentence ? (
        <div className="mt-4 border-t border-[var(--border-subtle)] pt-3 text-sm">
          <p className="font-medium text-[var(--text-primary)]">{verb.exampleSentence.german}</p>
          {verb.exampleSentence.english ? (
            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
              {verb.exampleSentence.english}
            </p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

type VerbConjugationViewProps = {
  infinitive: string;
  forms: Readonly<Record<string, string>>;
  notes?: string;
};

export function VerbConjugationView({ infinitive, forms, notes }: VerbConjugationViewProps) {
  const rows = Object.entries(forms);

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-white p-5">
      <h3 className="text-lg font-semibold text-[var(--text-primary)]">{infinitive}</h3>

      {rows.length > 0 ? (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] uppercase">
                <th className="py-2 pr-4 font-semibold">Subject / Slot</th>
                <th className="py-2 font-semibold">Form</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([slot, conjugated]) => (
                <tr key={slot} className="border-b border-[var(--border-subtle)]/70">
                  <td className="py-2 pr-4 text-[var(--text-secondary)]">{slot}</td>
                  <td className="py-2 font-medium text-[var(--text-primary)]">{conjugated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {notes ? <p className="mt-3 text-sm text-[var(--text-secondary)]">{notes}</p> : null}
    </div>
  );
}

