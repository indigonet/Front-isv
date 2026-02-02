import { useLanguage, releaseNotes } from "../../context/LanguageContext";
import "./notes.css";

const Notes = () => {
  const { language } = useLanguage();

  return (
    <section className="notes-container">
      <h1>Últimos cambios</h1>

      {releaseNotes[language]?.map((release, i) => (
        <div className="note" key={i}>
          <div className="note-version">{release.version}</div>

          <ul className="note-list">
            {release.changes.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
};

export default Notes;
