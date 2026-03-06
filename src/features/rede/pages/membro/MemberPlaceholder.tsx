import "./memberPages.css";

type Props = {
  title: string;
  description?: string;
};

export default function MemberPlaceholder({ title, description }: Props) {
  return (
    <section className="member-page">
      <header className="member-page-header">
        <h1>{title}</h1>
        <p>{description || "Em construcao. Em breve novidades para sua jornada."}</p>
      </header>
      <div className="member-card member-card--wide">
        <h3>Em breve</h3>
        <p>Estamos preparando este espaco com cuidado pastoral e ferramentas para sua caminhada.</p>
      </div>
    </section>
  );
}
