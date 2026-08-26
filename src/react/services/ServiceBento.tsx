import { RevealOnScroll } from "../shared/RevealOnScroll";

export interface ServiceItem {
  title: string;
  description: string;
}

export interface ServiceBentoProps {
  items: ServiceItem[];
}

export function ServiceBento({ items }: ServiceBentoProps) {
  return (
    <div className="bento">
      <RevealOnScroll direction="left" className="bento-panel">
        <div className="panel-row"><span>ENGAGEMENT</span><span className="val">ACTIVE</span></div>
        <div className="panel-row"><span>STACK</span><span className="val">REACT · NODE · CLOUD</span></div>
        <div className="panel-row"><span>OWNERSHIP</span><span className="val">100% CLIENT</span></div>
        <div className="panel-title">Built from the ground up — yours entirely.</div>
      </RevealOnScroll>
      {items.map((item, i) => (
        <RevealOnScroll
          key={item.title}
          direction={i % 2 === 0 ? "up" : "right"}
          delay={i * 0.08}
          className={`bento-tile${i === items.length - 1 ? " bento-tile--wide" : ""}`}
        >
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </RevealOnScroll>
      ))}
    </div>
  );
}
