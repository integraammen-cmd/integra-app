// [REFACTOR v0.2.0]: Section label component — design system Integra Mutual

interface SectionLabelProps {
  texto: string;
}

export default function SectionLabel({ texto }: SectionLabelProps) {
  return (
    <h2 className="section-label mb-3 mt-1">{texto}</h2>
  );
}
