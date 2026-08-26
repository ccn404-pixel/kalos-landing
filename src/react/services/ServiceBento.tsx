import { RevealOnScroll } from "../shared/RevealOnScroll";

export interface ServiceItem {
  title: string;
  description: string;
}

export interface ServiceBentoProps {
  items: ServiceItem[];
  photoSrc: string;
}

export function ServiceBento({ items, photoSrc }: ServiceBentoProps) {
  return (
    <div className="service-bento">
      <RevealOnScroll direction="left" className="service-bento__photo-tile">
        <img src={photoSrc} alt="" width={1000} height={563} loading="lazy" />
      </RevealOnScroll>
      {items.map((item, i) => (
        <RevealOnScroll
          key={item.title}
          direction={i % 2 === 0 ? "up" : "right"}
          delay={i * 0.08}
          className={`service-bento__tile${i === 0 ? " service-bento__tile--wide" : ""}`}
        >
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </RevealOnScroll>
      ))}
    </div>
  );
}
