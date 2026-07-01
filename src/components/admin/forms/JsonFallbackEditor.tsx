interface JsonFallbackEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  hint?: string;
}

/**
 * A plain validated-on-save JSON textarea. Used as the editor for collections
 * with no registered lexicon, and as the per-field fallback for blob/ref/union
 * shapes. Parsing/validation is the caller's responsibility (on save).
 */
export function JsonFallbackEditor({ value, onChange, label, hint }: JsonFallbackEditorProps) {
  return (
    <div className="admin__field">
      {label ? <label>{label}</label> : null}
      {hint ? <span className="admin__hint">{hint}</span> : null}
      <textarea
        spellCheck={false}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
