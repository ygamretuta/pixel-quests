import type { EvidenceRow } from "@/features/quests/types";
import "./ProofGallery.css";

/** Parent-only strip of the latest evidence photos. */
export function ProofGallery({ evidence }: { evidence: EvidenceRow[] }) {
  return (
    <section className="proof-gallery">
      <h2 className="proof-gallery__title">Recent proof</h2>
      <ul className="proof-gallery__list">
        {evidence.map((item) => (
          <li key={item.id} className="proof-gallery__item">
            <a href={`/api/evidence/${item.id}`} target="_blank" rel="noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="proof-gallery__image"
                src={`/api/evidence/${item.id}`}
                alt={`Proof for ${item.questTitle}`}
                loading="lazy"
              />
            </a>
            <span className="proof-gallery__caption">
              {item.questTitle}
              <br />
              {new Date(item.createdAt).toLocaleDateString("en-PH", {
                timeZone: "Asia/Manila",
                month: "short",
                day: "numeric",
              })}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
